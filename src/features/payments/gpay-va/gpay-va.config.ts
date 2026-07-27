function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Thiếu biến môi trường ${name}.`);
  }

  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

function integer(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();

  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} phải là số nguyên dương.`);
  }

  return parsed;
}

function environmentBaseUrl(): string {
  const explicit = optional("GPAY_VA_BASE_URL");

  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const environment = optional("GPAY_ENVIRONMENT", "sandbox").toLowerCase();

  return environment === "production"
    ? "https://openapi.g-pay.vn/v1"
    : "https://openapi-sandbox.g-pay.vn/v1";
}

export function isGPayVirtualAccountEnabled(): boolean {
  return process.env.GPAY_VA_ENABLED?.trim().toLowerCase() === "true";
}

export function getGPayVAConfig() {
  if (!isGPayVirtualAccountEnabled()) {
    throw new Error("GPay Virtual Account đang bị tắt.");
  }

  return {
    environment: optional("GPAY_ENVIRONMENT", "sandbox"),
    baseUrl: environmentBaseUrl(),
    tokenPath: optional("GPAY_VA_TOKEN_PATH", "/auth/token"),
    createPath: optional("GPAY_VA_CREATE_PATH", "/collection/va/create"),
    detailPath: optional("GPAY_VA_DETAIL_PATH", "/collection/va/detail"),
    clientId: required("GPAY_CLIENT_ID"),
    clientSecret: required("GPAY_CLIENT_SECRET"),
    accountName: required("GPAY_VA_ACCOUNT_NAME"),
    bankCode: optional("GPAY_VA_BANK_CODE", "BIDV"),
    merchantCode: optional("GPAY_VA_MERCHANT_CODE"),
    webhookUrl: optional("GPAY_VA_WEBHOOK_URL"),
    privateKeyPath: required("GPAY_PRIVATE_KEY_PATH"),
    certificatePath: required("GPAY_CERTIFICATE_PATH"),
    verifyCertificatePath: required("GPAY_VERIFY_CERTIFICATE_PATH"),
    requestTimeoutMs: integer("GPAY_VA_REQUEST_TIMEOUT_MS", 15_000),
    tokenRefreshBufferSeconds: integer(
      "GPAY_VA_TOKEN_REFRESH_BUFFER_SECONDS",
      120,
    ),
  } as const;
}

export function joinGPayVAUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
