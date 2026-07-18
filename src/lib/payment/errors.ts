import type {
  PaymentProviderId,
} from "./types";

export type PaymentErrorCode =
  | "PROVIDER_NOT_FOUND"
  | "PROVIDER_DISABLED"
  | "INVALID_INPUT"
  | "CONFIGURATION_ERROR"
  | "PROVIDER_REQUEST_FAILED"
  | "INVALID_PROVIDER_RESPONSE"
  | "WEBHOOK_VERIFICATION_FAILED"
  | "PAYMENT_STATUS_FAILED";

export interface PaymentErrorOptions {
  code: PaymentErrorCode;

  message: string;

  providerId?: PaymentProviderId;

  cause?: unknown;

  details?: unknown;
}

export class PaymentError extends Error {
  readonly code: PaymentErrorCode;

  readonly providerId?: PaymentProviderId;

  readonly details?: unknown;

  constructor({
    code,
    message,
    providerId,
    cause,
    details,
  }: PaymentErrorOptions) {
    super(message, {
      cause,
    });

    this.name = "PaymentError";
    this.code = code;
    this.providerId = providerId;
    this.details = details;
  }
}

export function isPaymentError(
  error: unknown,
): error is PaymentError {
  return error instanceof PaymentError;
}