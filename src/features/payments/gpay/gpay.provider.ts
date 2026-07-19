import {
  initGPayGatewayOrder,
  type GPayGatewayPaymentMethod,
} from "@/lib/payment/adapters/gpay";

import type {
  CreatePaymentInput,
  PaymentProvider,
  PaymentProviderId,
  PaymentSession,
} from "../payment.types";

interface GPayGatewayProviderDefinition {
  id: PaymentProviderId;
  paymentMethod?: GPayGatewayPaymentMethod;
}

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Thiếu biến môi trường ${name}.`);
  }

  return value.replace(/\/+$/, "");
}

function createRequestId(input: CreatePaymentInput): string {
  const timestamp = Date.now();
  const raw = `YSIM-${input.orderNumber}-${timestamp}`;

  return raw.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
}

function createGPayGatewayProvider(
  definition: GPayGatewayProviderDefinition,
): PaymentProvider {
  return {
    id: definition.id,

    async createPayment(input: CreatePaymentInput): Promise<PaymentSession> {
      if (input.currency.toUpperCase() !== "VND") {
        throw new Error("GPay Gateway hiện chỉ được cấu hình cho VND.");
      }

      if (!Number.isInteger(input.amount) || input.amount <= 0) {
        throw new Error("Số tiền gửi GPay phải là số nguyên VND lớn hơn 0.");
      }

      const storefrontBaseUrl = requireEnvironmentVariable(
        "GPAY_STOREFRONT_BASE_URL",
      );

      const webhookUrl =
        process.env.GPAY_GATEWAY_WEBHOOK_URL?.trim() ||
        `${storefrontBaseUrl}/api/payments/gpay/webhook`;

      const requestId = createRequestId(input);

      const embedData = JSON.stringify({
        source: "ysim-storefront",
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        orderKey: input.orderKey,
        paymentProvider: definition.id,
        merchantOrderId: requestId,
      });

      const result = await initGPayGatewayOrder({
        amount: input.amount,
        callbackUrl: `${storefrontBaseUrl}/checkout/gpay/return`,
        customerId: String(input.orderId),
        customerName: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
        description: input.description,
        title: `Thanh toán đơn YSim #${input.orderNumber}`,
        embedData,
        paymentMethod: definition.paymentMethod,
        paymentType: "IMMEDIATE",
        requestId,
        webhookUrl,
      });

      return {
        provider: definition.id,
        status: "redirect_required",

        orderId: input.orderId,
        orderNumber: input.orderNumber,

        merchantTransactionId: result.requestId,
        providerBillId: result.billId,

        amount: input.amount,
        currency: input.currency.toUpperCase(),

        redirectUrl: result.billUrl,
        expiresAt: result.expiredTime,
        message: "Chuyển sang cổng thanh toán bảo mật của GPay.",
      };
    },
  };
}

export const gpayGatewayAllProvider = createGPayGatewayProvider({
  id: "gpay_gateway_all",
});

export const gpayGatewayCardProvider = createGPayGatewayProvider({
  id: "gpay_gateway_card",
  paymentMethod: "BANK_INTERNATIONAL",
});

export const gpayGatewayAtmProvider = createGPayGatewayProvider({
  id: "gpay_gateway_atm",
  paymentMethod: "BANK_ATM",
});

export const gpayGatewayQrProvider = createGPayGatewayProvider({
  id: "gpay_gateway_qr",
  paymentMethod: "QR PAYMENT",
});
