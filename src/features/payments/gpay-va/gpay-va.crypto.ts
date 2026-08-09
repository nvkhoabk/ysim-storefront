import { createSign, createVerify, X509Certificate } from "node:crypto";
import { readFile } from "node:fs/promises";

import { getGPayVAConfig } from "./gpay-va.config";

async function readPem(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export async function getGPayVACertificateBase64(): Promise<string> {
  const config = getGPayVAConfig();
  const pem = await readPem(config.certificatePath);
  const certificate = new X509Certificate(pem);

  return certificate.raw.toString("base64");
}

export async function signGPayVARequest(raw: string): Promise<string> {
  const config = getGPayVAConfig();
  const privateKey = await readPem(config.privateKeyPath);
  const signer = createSign("RSA-SHA256");

  signer.update(raw, "utf8");
  signer.end();

  return signer.sign(privateKey, "base64");
}

export async function verifyGPayVAWebhookSignature(
  raw: string,
  signature: string,
): Promise<boolean> {
  const config = getGPayVAConfig();
  const certificate = await readPem(config.verifyCertificatePath);
  const verifier = createVerify("RSA-SHA256");

  verifier.update(raw, "utf8");
  verifier.end();

  return verifier.verify(certificate, signature, "base64");
}
