import {
  createSign,
  createVerify,
  X509Certificate,
} from "node:crypto";
import { readFile } from "node:fs/promises";

import { gpayConfig } from "./gpay.config";

async function readPemFile(
  path: string,
): Promise<string> {
  return readFile(path, "utf8");
}

/**
 * Đọc X.509 certificate của Merchant/YSim.
 *
 * Giá trị trả về vẫn bao gồm:
 * -----BEGIN CERTIFICATE-----
 * ...
 * -----END CERTIFICATE-----
 */
export async function getMerchantCertificatePem(): Promise<string> {
  return readPemFile(
    gpayConfig.merchantCertificatePath,
  );
}

/**
 * Trả về certificate YSim ở dạng base64 DER.
 *
 * Chỉ sử dụng hàm này nếu đặc tả GPay yêu cầu
 * x-certificate không bao gồm PEM header/footer.
 */
export async function getMerchantCertificateBase64(): Promise<string> {
  const certificatePem =
    await getMerchantCertificatePem();

  const certificate = new X509Certificate(
    certificatePem,
  );

  return certificate.raw.toString("base64");
}

/**
 * Ký dữ liệu bằng RSA-SHA256 với private key của YSim.
 */
export async function signWithMerchantKey(
  rawData: string,
): Promise<string> {
  const privateKey = await readPemFile(
    gpayConfig.merchantPrivateKeyPath,
  );

  const signer = createSign("RSA-SHA256");

  signer.update(rawData, "utf8");
  signer.end();

  return signer.sign(
    privateKey,
    "base64",
  );
}

/**
 * Xác minh chữ ký response/webhook bằng certificate
 * do GPay cung cấp.
 *
 * Node.js có thể sử dụng trực tiếp X.509 certificate PEM
 * trong createVerify().verify().
 */
export async function verifyWithGPayCertificate(
  rawData: string,
  signature: string,
): Promise<boolean> {
  const gpayCertificate =
    await readPemFile(
      gpayConfig.gpayVerifyCertificatePath,
    );

  const verifier = createVerify(
    "RSA-SHA256",
  );

  verifier.update(rawData, "utf8");
  verifier.end();

  return verifier.verify(
    gpayCertificate,
    signature,
    "base64",
  );
}