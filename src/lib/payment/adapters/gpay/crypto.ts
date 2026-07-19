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
}

const keyCache: CachedKeyMaterial = {};

async function readRequiredPemFile(
  environmentName: string,
): Promise<string> {
  const filePath =
    process.env[environmentName]?.trim();

  if (!filePath) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message:
        `Thiếu biến môi trường ${environmentName}.`,
    });
  }

  try {
    return await readFile(
      filePath,
      "utf8",
    );
  } catch (error) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message:
        `Không đọc được file PEM tại ${filePath}.`,
      cause: error,
    });
  }
}

export async function getGPayPrivateKeyPem():
Promise<string> {
  if (!keyCache.privateKeyPem) {
    keyCache.privateKeyPem =
      await readRequiredPemFile(
        "GPAY_PRIVATE_KEY_PATH",
      );
  }

  return keyCache.privateKeyPem;
}

export async function getMerchantPublicKeyPem():
Promise<string> {
  if (!keyCache.publicKeyPem) {
    keyCache.publicKeyPem =
      await readRequiredPemFile(
        "GPAY_PUBLIC_KEY_PATH",
      );
  }

  return keyCache.publicKeyPem;
}

export async function signGPayRawInput(
  rawInput: string,
): Promise<string> {
  if (!rawInput) {
    throw new GPayError({
      code: "GPAY_TOKEN_RESPONSE_INVALID",
      message:
        "Chuỗi cần ký không được để trống.",
    });
  }

  try {
    const privateKey = createPrivateKey(
      await getGPayPrivateKeyPem(),
    );

    const binarySignature = sign(
      "RSA-SHA256",
      Buffer.from(rawInput, "utf8"),
      privateKey,
    );

    return binarySignature.toString(
      "base64",
    );
  } catch (error) {
    throw new GPayError({
      code: "GPAY_TOKEN_REQUEST_FAILED",
      message:
        "Không thể tạo chữ ký RSA-SHA256.",
      cause: error,
    });
  }
}

export async function verifyGPayRawInput(
  rawInput: string,
  signatureBase64: string,
  publicKeyPem?: string,
): Promise<boolean> {
  try {
    const publicKey = createPublicKey(
      publicKeyPem ??
        (await getMerchantPublicKeyPem()),
    );

    return verify(
      "RSA-SHA256",
      Buffer.from(rawInput, "utf8"),
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

export function clearGPayKeyCache(): void {
  delete keyCache.privateKeyPem;
  delete keyCache.publicKeyPem;
}

let cachedProviderPublicKey:
  | string
  | null = null;

export async function getGPayProviderPublicKeyPem():
Promise<string> {
  if (cachedProviderPublicKey) {
    return cachedProviderPublicKey;
  }

  const path =
    process.env
      .GPAY_PROVIDER_PUBLIC_KEY_PATH
      ?.trim();

  if (!path) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message:
        "Thiếu GPAY_PROVIDER_PUBLIC_KEY_PATH.",
    });
  }

  try {
    cachedProviderPublicKey =
      await readFile(path, "utf8");

    return cachedProviderPublicKey;
  } catch (error) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message:
        "Không đọc được public key của GPay.",
      cause: error,
    });
  }
}

export async function verifyGPayProviderSignature(
  rawInput: string,
  signatureBase64: string,
): Promise<boolean> {
  return verifyGPayRawInput(
    rawInput,
    signatureBase64,
    await getGPayProviderPublicKeyPem(),
  );
}
