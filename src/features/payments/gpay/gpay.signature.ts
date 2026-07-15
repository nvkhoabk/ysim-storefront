import {
  createSign,
  createVerify,
} from "node:crypto";
import { readFile } from "node:fs/promises";

import { gpayConfig } from "./gpay.config";

async function readPemFile(
  path: string,
): Promise<string> {
  return readFile(path, "utf8");
}

export async function signWithMerchantKey(
  rawData: string,
): Promise<string> {
  const privateKey = await readPemFile(
    gpayConfig.privateKeyPath,
  );

  const signer = createSign("RSA-SHA256");

  signer.update(rawData, "utf8");
  signer.end();

  return signer.sign(privateKey, "base64");
}

export async function verifyWithGPayKey(
  rawData: string,
  signature: string,
): Promise<boolean> {
  const publicKey = await readPemFile(
    gpayConfig.gpayPublicKeyPath,
  );

  const verifier = createVerify("RSA-SHA256");

  verifier.update(rawData, "utf8");
  verifier.end();

  return verifier.verify(
    publicKey,
    signature,
    "base64",
  );
}
