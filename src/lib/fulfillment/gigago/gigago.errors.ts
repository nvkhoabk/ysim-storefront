export type GigagoErrorCode =
  | "GIGAGO_CONFIG_ERROR"
  | "GIGAGO_HTTP_ERROR"
  | "GIGAGO_RESPONSE_INVALID"
  | "GIGAGO_API_REJECTED"
  | "GIGAGO_TIMEOUT";

export interface GigagoErrorOptions {
  code: GigagoErrorCode;
  message: string;
  status?: number;
  details?: unknown;
  cause?: unknown;
}

export class GigagoError extends Error {
  readonly code: GigagoErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor({ code, message, status, details, cause }: GigagoErrorOptions) {
    super(message, { cause });
    this.name = "GigagoError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isGigagoError(error: unknown): error is GigagoError {
  return error instanceof GigagoError;
}
