import { createSign, createVerify, X509Certificate } from "node:crypto";
import { readFile } from "node:fs/promises";

import { gpayConfig } from "./gpay.config";

async function readPemFile(path: string): Promise<string> {
  if (!path.trim()) {
    throw new Error(
      "Cannot read PEM file because the configured path is empty.",
    );
  }

  return readFile(path, "utf8");
}

function requireGPayVerifyCertificatePath(): string {
  const path = gpayConfig.gpayVerifyCertificatePath.trim();

  if (!path) {
    throw new Error(
      [
        "Missing environment variable:",
        "GPAY_VERIFY_CERTIFICATE_PATH.",
        "This value is required when verifying",
        "a GPay response or webhook signature.",
      ].join(" "),
    );
  }

  return path;
}

/**
 * Đọc X.509 certificate của Merchant/YSim.
 */
export async function getMerchantCertificatePem(): Promise<string> {
  return readPemFile(gpayConfig.merchantCertificatePath);
}

/**
 * Trả về certificate Merchant ở dạng Base64 DER.
 *
 * Chỉ dùng nếu tài liệu GPay yêu cầu header certificate
 * không gồm PEM header/footer.
 */
export async function getMerchantCertificateBase64(): Promise<string> {
  const certificatePem = await getMerchantCertificatePem();

  const certificate = new X509Certificate(certificatePem);

  return certificate.raw.toString("base64");
}

/**
 * Ký dữ liệu bằng RSA-SHA256 với private key của YSim.
 */
export async function signWithMerchantKey(rawData: string): Promise<string> {
  const privateKey = await readPemFile(gpayConfig.merchantPrivateKeyPath);

  const signer = createSign("RSA-SHA256");

  signer.update(rawData, "utf8");
  signer.end();

  return signer.sign(privateKey, "base64");
}

/**
 * Xác minh chữ ký response/webhook bằng certificate
 * do GPay cung cấp.
 *
 * GPAY_VERIFY_CERTIFICATE_PATH chỉ được yêu cầu
 * tại thời điểm hàm này thực sự được gọi.
 */
export async function verifyWithGPayCertificate(
  rawData: string,
  signature: string,
): Promise<boolean> {
  const certificatePath = requireGPayVerifyCertificatePath();

  const gpayCertificate = await readPemFile(certificatePath);

  const verifier = createVerify("RSA-SHA256");

  verifier.update(rawData, "utf8");
  verifier.end();

  return verifier.verify(gpayCertificate, signature, "base64");
}
