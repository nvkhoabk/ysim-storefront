import { GigagoError } from "./gigago.errors";

export interface GigagoConfig {
  environment: "sandbox" | "production";
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new GigagoError({
      code: "GIGAGO_CONFIG_ERROR",
      message: `Thiếu biến môi trường bắt buộc: ${name}.`,
    });
  }

  return value;
}

function positiveInteger(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(value) || value <= 0) {
    throw new GigagoError({
      code: "GIGAGO_CONFIG_ERROR",
      message: `${name} phải là số nguyên lớn hơn 0.`,
    });
  }

  return value;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getGigagoConfig(): GigagoConfig {
  const environment =
    process.env.GIGAGO_ENV?.trim().toLowerCase() === "production"
      ? "production"
      : "sandbox";

  const defaultBaseUrl =
    environment === "production"
      ? "https://partners-api.gigago.com"
      : "https://sandbox-partners-api.gigago.com";

  return {
    environment,
    baseUrl: normalizeBaseUrl(
      process.env.GIGAGO_BASE_URL?.trim() || defaultBaseUrl,
    ),
    apiKey: requiredEnvironment("GIGAGO_API_KEY"),
    timeoutMs: positiveInteger("GIGAGO_TIMEOUT_MS", 15_000),
  };
}

export function getGigagoTestSecret(): string {
  return requiredEnvironment("GIGAGO_TEST_SECRET");
}
