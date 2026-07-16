import type {
  CreatePaymentInput,
  PaymentProvider,
  PaymentSession,
} from "../payment.types";

export const onePayCardProvider: PaymentProvider = {
  id: "onepay_card",

  async createPayment(
    input: CreatePaymentInput,
  ): Promise<PaymentSession> {
    const merchantTransactionId =
      `ONEPAY-${input.orderId}-${Date.now()}`;

    /*
     * Chưa có Merchant ID, Access Code, Secure Secret.
     * Khi OnePay cấp credential, phương thức này sẽ:
     *
     * 1. Build vpc parameters.
     * 2. amount = VND amount * 100.
     * 3. Tạo chữ ký SecureHash.
     * 4. Trả redirectUrl.
     */

    return {
      provider: "onepay_card",
      status: "redirect_required",

      orderId: input.orderId,
      orderNumber: input.orderNumber,

      merchantTransactionId,

      amount: input.amount,
      currency: input.currency,

      message:
        "Đang chờ thông tin tích hợp OnePay.",
    };
  },
};