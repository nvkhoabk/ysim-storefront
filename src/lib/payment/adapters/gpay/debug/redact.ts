const SENSITIVE_KEYS = new Set([
  "authorization",
  "access_token",
  "accessToken",
  "token",
  "client_secret",
  "clientSecret",
  "password",
  "private_key",
  "privateKey",
  "secret",
  "merchant_password",
]);

const LARGE_VALUE_KEYS = new Set([
  "qr_code_image",
  "qrCodeImage",
  "qrImageDataUrl",
  "image",
  "base64",
]);

const SIGNATURE_KEYS = new Set([
  "signature",
  "x-signature",
  "x_signature",
]);

export interface RedactOptions {
  maxStringLength?: number;
}

function redactString(
  key: string,
  value: string,
  maxStringLength: number,
): string {
  if (SENSITIVE_KEYS.has(key)) {
    return "[REDACTED]";
  }

  if (LARGE_VALUE_KEYS.has(key)) {
    return `[REDACTED_LARGE_VALUE length=${value.length}]`;
  }

  if (SIGNATURE_KEYS.has(key)) {
    if (value.length <= 16) {
      return "[REDACTED_SIGNATURE]";
    }

    return [
      value.slice(0, 8),
      "...",
      value.slice(-8),
      `(length=${value.length})`,
    ].join("");
  }

  if (value.startsWith("Bearer ")) {
    return "Bearer [REDACTED]";
  }

  if (
    value.startsWith("data:image/") &&
    value.includes(";base64,")
  ) {
    return `[REDACTED_DATA_URL length=${value.length}]`;
  }

  if (value.length > maxStringLength) {
    return `${value.slice(
      0,
      maxStringLength,
    )}...[TRUNCATED length=${value.length}]`;
  }

  return value;
}

function redactValue(
  key: string,
  value: unknown,
  maxStringLength: number,
): unknown {
  if (typeof value === "string") {
    return redactString(
      key,
      value,
      maxStringLength,
    );
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      redactValue(
        key,
        item,
        maxStringLength,
      ),
    );
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return redactObject(
      value as Record<string, unknown>,
      {
        maxStringLength,
      },
    );
  }

  return value;
}

export function redactObject(
  input: Record<string, unknown>,
  options: RedactOptions = {},
): Record<string, unknown> {
  const maxStringLength =
    options.maxStringLength ?? 2_000;

  return Object.fromEntries(
    Object.entries(input).map(
      ([key, value]) => [
        key,
        redactValue(
          key,
          value,
          maxStringLength,
        ),
      ],
    ),
  );
}

export function redactUnknown(
  input: unknown,
  options: RedactOptions = {},
): unknown {
  if (
    typeof input === "object" &&
    input !== null &&
    !Array.isArray(input)
  ) {
    return redactObject(
      input as Record<string, unknown>,
      options,
    );
  }

  if (Array.isArray(input)) {
    return input.map((item) =>
      redactUnknown(item, options),
    );
  }

  if (typeof input === "string") {
    return redactString(
      "value",
      input,
      options.maxStringLength ?? 2_000,
    );
  }

  return input;
}
