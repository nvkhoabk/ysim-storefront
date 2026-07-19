import {
  GPayError,
} from "./errors";

export type GPayTimestampFormat =
  | "milliseconds"
  | "seconds"
  | "iso";

export interface GPayGatewayConfig {
  initOrderPath: string;
  queryOrderPath: string;
  certificatePath: string;
  timestampFormat: GPayTimestampFormat;
}

function normalizePath(
  value: string,
): string {
  return value.startsWith("/")
    ? value
    : `/${value}`;
}

function readRequiredEnvironmentVariable(
  names: string[],
): string {
  for (const name of names) {
    const value =
      process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  throw new GPayError({
    code: "GPAY_CONFIG_ERROR",
    message:
      `Thiếu biến môi trường bắt buộc: ${names.join(" hoặc ")}.`,
  });
}

export function getGPayGatewayConfig():
GPayGatewayConfig {
  return {
    initOrderPath:
      normalizePath(
        process.env
          .GPAY_GATEWAY_INIT_ORDER_PATH
          ?.trim() ||
          "/payments/gateway/init-order",
      ),

    queryOrderPath:
      normalizePath(
        process.env
          .GPAY_GATEWAY_QUERY_ORDER_PATH
          ?.trim() ||
          "/payments/gateway/query-order",
      ),

    certificatePath:
      readRequiredEnvironmentVariable([
        "GPAY_CERTIFICATE_PATH",
        "GPAY_MERCHANT_CERTIFICATE_PATH",
      ]),

    timestampFormat:
      process.env
        .GPAY_TIMESTAMP_FORMAT === "seconds"
        ? "seconds"
        : process.env
            .GPAY_TIMESTAMP_FORMAT === "iso"
          ? "iso"
          : "milliseconds",
  };
}

export function buildGPayGatewayUrl(
  baseUrl: string,
  path: string,
): string {
  return `${baseUrl.replace(/\/+$/, "")}${normalizePath(path)}`;
}
