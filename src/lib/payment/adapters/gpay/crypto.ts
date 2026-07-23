import {
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from "node:crypto";

import {
  readFile,
} from "node:fs/promises";

import {
  GPayError,
} from "./errors";

interface CachedKeyMaterial {
  privateKeyPem?: string;
  publicKeyPem?: string;
  providerPublicKeyPem?: string;
}

const keyCache:
  CachedKeyMaterial = {};

async function readRequiredPemFile(
  environmentName: string,
): Promise<string> {
  const filePath =
    process.env[
      environmentName
    ]
      ?.trim();

  if (!filePath) {
    throw new GPayError({
      code:
        "GPAY_CONFIG_ERROR",
      message:
        `Thiếu biến môi trường ${environmentName}.`,
    });
  }

  try {
    return await readFile(
      filePath,
      "utf8",
    );
  } catch (
    error
  ) {
    throw new GPayError({
      code:
        "GPAY_CONFIG_ERROR",
      message:
        `Không đọc được file PEM tại ${filePath}.`,
      cause:
        error,
    });
  }
}

export async function getGPayPrivateKeyPem():
Promise<string> {
  if (
    !keyCache
      .privateKeyPem
  ) {
    keyCache.privateKeyPem =
      await readRequiredPemFile(
        "GPAY_PRIVATE_KEY_PATH",
      );
  }

  return keyCache
    .privateKeyPem;
}

export async function getMerchantPublicKeyPem():
Promise<string> {
  if (
    !keyCache
      .publicKeyPem
  ) {
    keyCache.publicKeyPem =
      await readRequiredPemFile(
        "GPAY_PUBLIC_KEY_PATH",
      );
  }

  return keyCache
    .publicKeyPem;
}

export async function signGPayRawInput(
  rawInput: string,
): Promise<string> {
  if (!rawInput) {
    throw new GPayError({
      code:
        "GPAY_TOKEN_RESPONSE_INVALID",
      message:
        "Chuỗi cần ký không được để trống.",
    });
  }

  try {
    const privateKey =
      createPrivateKey(
        await getGPayPrivateKeyPem(),
      );

    const binarySignature =
      sign(
        "RSA-SHA256",
        Buffer.from(
          rawInput,
          "utf8",
        ),
        privateKey,
      );

    return binarySignature
      .toString(
        "base64",
      );
  } catch (
    error
  ) {
    throw new GPayError({
      code:
        "GPAY_TOKEN_REQUEST_FAILED",
      message:
        "Không thể tạo chữ ký RSA-SHA256.",
      cause:
        error,
    });
  }
}

export async function verifyGPayRawInput(
  rawInput: string,
  signatureBase64: string,
  publicKeyPem?: string,
): Promise<boolean> {
  try {
    const publicKey =
      createPublicKey(
        publicKeyPem ??
          (
            await getMerchantPublicKeyPem()
          ),
      );

    return verify(
      "RSA-SHA256",
      Buffer.from(
        rawInput,
        "utf8",
      ),
      publicKey,
      Buffer.from(
        signatureBase64,
        "base64",
      ),
    );
  } catch {
    return false;
  }
}

export function normalizeGPayProviderSignatureBase64(
  value: string,
): string | null {
  const compact =
    value
      .trim()
      .replace(
        / /g,
        "+",
      )
      .replace(
        /[\r\n\t]/g,
        "",
      );

  if (
    !compact ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(
      compact,
    )
  ) {
    return null;
  }

  const withoutPadding =
    compact.replace(
      /=+$/,
      "",
    );

  if (
    withoutPadding.length %
      4 ===
    1
  ) {
    return null;
  }

  const paddingLength =
    (
      4 -
      (
        withoutPadding
          .length %
        4
      )
    ) %
    4;

  return (
    withoutPadding +
    "=".repeat(
      paddingLength,
    )
  );
}

export function clearGPayKeyCache():
void {
  delete keyCache
    .privateKeyPem;

  delete keyCache
    .publicKeyPem;

  delete keyCache
    .providerPublicKeyPem;
}

export async function getGPayProviderPublicKeyPem():
Promise<string> {
  if (
    keyCache
      .providerPublicKeyPem
  ) {
    return keyCache
      .providerPublicKeyPem;
  }

  const path =
    process.env
      .GPAY_PROVIDER_PUBLIC_KEY_PATH
      ?.trim() ||
    process.env
      .GPAY_PROVIDER_CERTIFICATE_PATH
      ?.trim();

  if (!path) {
    throw new GPayError({
      code:
        "GPAY_CONFIG_ERROR",
      message:
        "Thiếu GPAY_PROVIDER_PUBLIC_KEY_PATH.",
    });
  }

  try {
    keyCache
      .providerPublicKeyPem =
      await readFile(
        path,
        "utf8",
      );

    return keyCache
      .providerPublicKeyPem;
  } catch (
    error
  ) {
    throw new GPayError({
      code:
        "GPAY_CONFIG_ERROR",
      message:
        "Không đọc được public key/certificate của GPay.",
      cause:
        error,
    });
  }
}

export async function verifyGPayProviderSignature(
  rawInput: string,
  signatureBase64: string,
): Promise<boolean> {
  const normalizedSignature =
    normalizeGPayProviderSignatureBase64(
      signatureBase64,
    );

  if (
    !normalizedSignature
  ) {
    return false;
  }

  return verifyGPayRawInput(
    rawInput,
    normalizedSignature,
    await getGPayProviderPublicKeyPem(),
  );
}
