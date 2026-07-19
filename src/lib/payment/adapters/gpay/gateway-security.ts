import {
  randomUUID,
} from "node:crypto";

import {
  readFile,
} from "node:fs/promises";

import {
  GPayError,
} from "./errors";

import {
  getGPayGatewayConfig,
} from "./gateway-config";

import {
  signGPayRawInput,
} from "./crypto";

let cachedCertificate:
  | string
  | null = null;

function normalizeCertificate(
  pem: string,
): string {
  return pem
    .replace(
      /-----BEGIN CERTIFICATE-----/g,
      "",
    )
    .replace(
      /-----END CERTIFICATE-----/g,
      "",
    )
    .replace(/\s+/g, "")
    .trim();
}

export async function getGPayCertificateHeader():
Promise<string> {
  if (cachedCertificate) {
    return cachedCertificate;
  }

  const config =
    getGPayGatewayConfig();

  try {
    const pem =
      await readFile(
        config.certificatePath,
        "utf8",
      );

    const normalized =
      normalizeCertificate(pem);

    if (!normalized) {
      throw new Error(
        "Certificate content is empty.",
      );
    }

    cachedCertificate = normalized;
    return normalized;
  } catch (error) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message:
        "Không đọc hoặc chuẩn hóa được merchant certificate của GPay.",
      cause: error,
    });
  }
}

export interface GPaySecurityHeaders {
  authorization: string;
  signature: string;
  "x-certificate": string;
  "x-requests-id": string;
  "x-timestamp": string;
}

export interface BuildGPaySecurityHeadersInput {
  accessToken: string;
  bodyJson: string;
  requestId?: string;
  timestamp?: string;
}

export async function buildGPaySecurityHeaders(
  input: BuildGPaySecurityHeadersInput,
): Promise<GPaySecurityHeaders> {
  const requestId =
    input.requestId?.trim() ||
    randomUUID();

  /*
   * Tài liệu chỉ định timestamp tại thời điểm request,
   * nhưng không ghi rõ đơn vị. Portal OpenAPI hiện dùng
   * chuỗi Unix timestamp theo millisecond trong adapter test.
   */
  const config =
    getGPayGatewayConfig();

  const timestamp =
    input.timestamp?.trim() ||
    (config.timestampFormat === "seconds"
      ? Math.floor(Date.now() / 1000).toString()
      : config.timestampFormat === "iso"
        ? new Date().toISOString()
        : Date.now().toString());

  const rawSignatureInput =
    `${timestamp}${requestId}${input.bodyJson}`;

  return {
    authorization:
      `Bearer ${input.accessToken}`,

    signature:
      await signGPayRawInput(
        rawSignatureInput,
      ),

    "x-certificate":
      await getGPayCertificateHeader(),

    "x-requests-id":
      requestId,

    "x-timestamp":
      timestamp,
  };
}

export function clearGPayCertificateCache():
void {
  cachedCertificate = null;
}
