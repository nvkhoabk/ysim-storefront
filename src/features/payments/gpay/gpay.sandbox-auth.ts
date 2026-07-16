import { timingSafeEqual } from "node:crypto";

const SANDBOX_SECRET_HEADER = "x-ysim-sandbox-secret";

export function getSandboxSecretHeaderName(): string {
  return SANDBOX_SECRET_HEADER;
}

function safeCompare(receivedValue: string, expectedValue: string): boolean {
  const receivedBuffer = Buffer.from(receivedValue, "utf8");

  const expectedBuffer = Buffer.from(expectedValue, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function isGPaySandboxEnvironment(): boolean {
  return process.env.GPAY_ENV?.trim().toLowerCase() === "sandbox";
}

export function authorizeGPaySandboxRequest(request: Request): boolean {
  if (!isGPaySandboxEnvironment()) {
    return false;
  }

  const expectedSecret = process.env.GPAY_SANDBOX_TEST_SECRET?.trim();

  if (!expectedSecret) {
    return false;
  }

  const receivedSecret = request.headers.get(SANDBOX_SECRET_HEADER)?.trim();

  if (!receivedSecret) {
    return false;
  }

  return safeCompare(receivedSecret, expectedSecret);
}
