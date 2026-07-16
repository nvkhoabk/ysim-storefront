import type {
  CreatePaymentInput,
  PaymentProvider,
  PaymentSession,
} from "../payment.types";

export const cashAgentProvider: PaymentProvider = {
  id: "cash_agent",

  async createPayment(input: CreatePaymentInput): Promise<PaymentSession> {
    return {
      provider: "cash_agent",
      status: "waiting",

      orderId: input.orderId,
      orderNumber: input.orderNumber,

      merchantTransactionId: `CASH-${input.orderId}-${Date.now()}`,

      amount: input.amount,
      currency: input.currency,

      message: "Đơn hàng đang chờ nhân viên xác nhận đã nhận tiền mặt.",
    };
  },
};
