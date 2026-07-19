import { GPayError } from "./errors";

export type GPayQrTokenStrategy =
  | "legacy"
  | "openapi";

export interface GPayQrConfig {
  environment: "sandbox" | "production";
  baseUrl: string;
  tokenPath: string;
  createQrPath: string;
  tokenStrategy: GPayQrTokenStrategy;
  merchantCode: string;
  password: string;
  accountName: string;
  qrType: "STATIC" | "DYNAMIC";
  sourceOfFund: "VIETQR" | "UNIONPAY";
  terminalId?: string;
  storeCode?: string;
  requestTimeoutMs: number;
}

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message: `Thiếu biến môi trường ${name}.`,
    });
  }

  return value;
}

function optional(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizePath(value: string): string {
  return `/${value.replace(/^\/+/, "")}`;
}

function readPositiveInteger(
  name: string,
  fallback: number,
): number {
  const raw = process.env[name]?.trim();

  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message: `${name} phải là số nguyên lớn hơn 0.`,
    });
  }

  return parsed;
}

export function getGPayQrConfig(): GPayQrConfig {
  const environment =
    process.env.GPAY_ENVIRONMENT === "production"
      ? "production"
      : "sandbox";

  const defaultBaseUrl =
    environment === "production"
      ? "https://mpa-va.g-pay.vn/api/v3"
      : "https://mpa-va-sandbox.g-pay.vn/api/v3";

  const tokenStrategy: GPayQrTokenStrategy =
    process.env.GPAY_QR_TOKEN_STRATEGY?.trim() === "openapi"
      ? "openapi"
      : "legacy";

  const password =
    optional("GPAY_QR_PASSWORD") ??
    optional("GPAY_CLIENT_SECRET");

  if (!password) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message:
        "Thiếu GPAY_QR_PASSWORD; có thể tạm dùng GPAY_CLIENT_SECRET để thử nghiệm.",
    });
  }

  return {
    environment,
    baseUrl: normalizeBaseUrl(
      optional("GPAY_QR_BASE_URL") ?? defaultBaseUrl,
    ),
    tokenPath: normalizePath(
      optional("GPAY_QR_TOKEN_PATH") ??
        "authentication/token/create",
    ),
    createQrPath: normalizePath(
      optional("GPAY_QR_CREATE_PATH") ??
        "qr-payment/create",
    ),
    tokenStrategy,
    merchantCode: required("GPAY_QR_MERCHANT_CODE"),
    password,
    accountName: required("GPAY_QR_ACCOUNT_NAME"),
    qrType:
      process.env.GPAY_QR_TYPE?.trim() === "STATIC"
        ? "STATIC"
        : "DYNAMIC",
    sourceOfFund:
      process.env.GPAY_QR_SOURCE_OF_FUND?.trim() ===
      "UNIONPAY"
        ? "UNIONPAY"
        : "VIETQR",
    terminalId: optional("GPAY_QR_TERMINAL_ID"),
    storeCode: optional("GPAY_QR_STORE_CODE"),
    requestTimeoutMs: readPositiveInteger(
      "GPAY_REQUEST_TIMEOUT_MS",
      15_000,
    ),
  };
}

export function buildGPayQrTokenUrl(
  config: GPayQrConfig,
): string {
  return `${config.baseUrl}${config.tokenPath}`;
}

export function buildGPayCreateQrUrl(
  config: GPayQrConfig,
): string {
  return `${config.baseUrl}${config.createQrPath}`;
}
