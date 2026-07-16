import type {
  CreatePaymentInput,
  PaymentProvider,
  PaymentSession,
} from "../payment.types";

export const gpayQrProvider: PaymentProvider = {
  id: "gpay_qr",

  async createPayment(
    input: CreatePaymentInput,
  ): Promise<PaymentSession> {
    /*
     * Tạm thời chỉ tạo session nội bộ.
     * Khi GPay sẵn sàng test, thay bằng:
     * - lấy token
     * - ký request
     * - init bill / tạo QR
     * - trả bill_url hoặc qr image
     */

    const merchantTransactionId =
      `GPAY-${input.orderId}-${Date.now()}`;

    return {
      provider: "gpay_qr",
      status: "waiting",

      orderId: input.orderId,
      orderNumber: input.orderNumber,

      merchantTransactionId,

      amount: input.amount,
      currency: input.currency,

      message:
        "Đang chờ cấu hình GPay Sandbox.",
    };
  },
};