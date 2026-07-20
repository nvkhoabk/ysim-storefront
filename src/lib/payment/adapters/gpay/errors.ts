export type GPayErrorCode =
  | "GPAY_CONFIG_ERROR"
  | "GPAY_TOKEN_REQUEST_FAILED"
  | "GPAY_TOKEN_RESPONSE_INVALID"
  | "GPAY_TOKEN_REJECTED"
  | "GPAY_QR_TOKEN_REQUEST_FAILED"
  | "GPAY_QR_TOKEN_RESPONSE_INVALID"
  | "GPAY_QR_CREATE_REJECTED"
  | "GPAY_QR_RESPONSE_INVALID"
  | "GPAY_QR_SIGNATURE_INVALID"
  | "GPAY_GATEWAY_CALLBACK_INVALID"
  | "GPAY_GATEWAY_INPUT_INVALID"
  | "GPAY_GATEWAY_RESPONSE_INVALID"
  | "GPAY_GATEWAY_INIT_REJECTED"
  | "GPAY_GATEWAY_QUERY_REJECTED";

export interface GPayErrorOptions {
  code: GPayErrorCode;
  message: string;
  status?: number;
  cause?: unknown;
  details?: unknown;
}

export class GPayError extends Error {
  readonly code: GPayErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor({
    code,
    message,
    status,
    cause,
    details,
  }: GPayErrorOptions) {
    super(message, { cause });
    this.name = "GPayError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isGPayError(
  error: unknown,
): error is GPayError {
  return error instanceof GPayError;
}
