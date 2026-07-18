import {
  PaymentError,
  isPaymentError,
} from "./errors";

import {
  getPaymentProvider,
} from "./providers";

import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GetPaymentStatusInput,
  PaymentProviderId,
  PaymentStatusResult,
  PaymentWebhookEvent,
  VerifyWebhookInput,
} from "./types";

function validateCreatePaymentInput(
  input: CreatePaymentInput,
): void {
  if (!input.order.orderId) {
    throw new PaymentError({
      code: "INVALID_INPUT",
      providerId: input.providerId,
      message:
        "Thiếu WooCommerce order ID.",
    });
  }

  if (
    !Number.isFinite(input.money.amount) ||
    input.money.amount <= 0
  ) {
    throw new PaymentError({
      code: "INVALID_INPUT",
      providerId: input.providerId,
      message:
        "Số tiền thanh toán phải lớn hơn 0.",
    });
  }

  if (!input.money.currency.trim()) {
    throw new PaymentError({
      code: "INVALID_INPUT",
      providerId: input.providerId,
      message:
        "Thiếu đơn vị tiền tệ.",
    });
  }

  if (!input.customer.email.trim()) {
    throw new PaymentError({
      code: "INVALID_INPUT",
      providerId: input.providerId,
      message:
        "Email khách hàng là bắt buộc.",
    });
  }

  if (!input.description.trim()) {
    throw new PaymentError({
      code: "INVALID_INPUT",
      providerId: input.providerId,
      message:
        "Thiếu nội dung thanh toán.",
    });
  }
}

function assertCreatePaymentResult(
  providerId: PaymentProviderId,
  result: CreatePaymentResult,
): void {
  if (
    result.providerId !== providerId ||
    !result.providerPaymentId ||
    !result.paymentReference ||
    !result.status ||
    !result.action ||
    !result.createdAt
  ) {
    throw new PaymentError({
      code: "INVALID_PROVIDER_RESPONSE",
      providerId,
      message:
        `Provider "${providerId}" trả về kết quả tạo thanh toán không hợp lệ.`,
      details: result,
    });
  }
}

export async function createPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  validateCreatePaymentInput(input);

  const provider =
    getPaymentProvider(input.providerId);

  try {
    const result =
      await provider.createPayment(input);

    assertCreatePaymentResult(
      input.providerId,
      result,
    );

    return result;
  } catch (error) {
    if (isPaymentError(error)) {
      throw error;
    }

    throw new PaymentError({
      code: "PROVIDER_REQUEST_FAILED",
      providerId: input.providerId,
      message:
        `Không thể tạo thanh toán qua ${provider.displayName}.`,
      cause: error,
    });
  }
}

export async function getPaymentStatus(
  providerId: PaymentProviderId,
  input: GetPaymentStatusInput,
): Promise<PaymentStatusResult> {
  const provider =
    getPaymentProvider(providerId);

  if (!provider.getPaymentStatus) {
    throw new PaymentError({
      code: "PAYMENT_STATUS_FAILED",
      providerId,
      message:
        `Provider "${providerId}" không hỗ trợ truy vấn trạng thái thanh toán.`,
    });
  }

  try {
    return await provider.getPaymentStatus(
      input,
    );
  } catch (error) {
    if (isPaymentError(error)) {
      throw error;
    }

    throw new PaymentError({
      code: "PAYMENT_STATUS_FAILED",
      providerId,
      message:
        `Không thể truy vấn trạng thái thanh toán từ ${provider.displayName}.`,
      cause: error,
    });
  }
}

export async function verifyPaymentWebhook(
  providerId: PaymentProviderId,
  input: VerifyWebhookInput,
): Promise<PaymentWebhookEvent> {
  const provider =
    getPaymentProvider(providerId);

  if (!provider.verifyWebhook) {
    throw new PaymentError({
      code: "WEBHOOK_VERIFICATION_FAILED",
      providerId,
      message:
        `Provider "${providerId}" không hỗ trợ webhook.`,
    });
  }

  try {
    return await provider.verifyWebhook(
      input,
    );
  } catch (error) {
    if (isPaymentError(error)) {
      throw error;
    }

    throw new PaymentError({
      code: "WEBHOOK_VERIFICATION_FAILED",
      providerId,
      message:
        `Không thể xác thực webhook từ ${provider.displayName}.`,
      cause: error,
    });
  }
}