import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
} from "../types";

function createReference(
  orderId: number,
): string {
  return [
    "MANUAL",
    orderId,
    Date.now(),
  ].join("-");
}

export const manualPaymentProvider: PaymentProvider =
  {
    id: "manual",

    displayName:
      "Thanh toán thủ công",

    enabled:
      process.env
        .PAYMENT_MANUAL_ENABLED !==
      "false",

    async createPayment(
      input: CreatePaymentInput,
    ): Promise<CreatePaymentResult> {
      const reference =
        createReference(
          input.order.orderId,
        );

      return {
        providerId: "manual",

        providerPaymentId: reference,

        paymentReference: reference,

        status: "pending",

        action: {
          type: "manual_instruction",

          title:
            "Đơn hàng đang chờ xác nhận",

          instructions: [
            "YSim sẽ kiểm tra và xác nhận thanh toán thủ công.",
            "Vui lòng giữ lại mã đơn hàng để được hỗ trợ.",
            `Mã đơn hàng: ${
              input.order.orderNumber ??
              input.order.orderId
            }`,
          ],
        },

        createdAt:
          new Date().toISOString(),

        raw: {
          orderId:
            input.order.orderId,

          amount:
            input.money.amount,

          currency:
            input.money.currency,
        },
      };
    },
  };