import type { PaymentSession } from "@/features/payments/payment.types";
import type { ShellLocale } from "@/i18n/shell/shell.types";

import type { CheckoutOrderHandoff } from "@/types/view-models/checkout-route-candidate";

import type { VerifiedPaymentCreateResponse } from "@/types/view-models/payment-route-candidate";

interface ApiErrorBody {
  message?: string;
}

export async function createVerifiedPaymentCandidate({
  handoff,
  locale,
}: {
  handoff: CheckoutOrderHandoff;
  locale: ShellLocale;
}): Promise<VerifiedPaymentCreateResponse> {
  const response = await fetch("/api/payments/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: handoff.provider,
      locale,
      orderId: handoff.orderId,
      orderNumber: handoff.orderNumber,
      orderKey: handoff.orderKey,
      amount: handoff.amount,
      currency: handoff.currency,
      customerName: handoff.customerName,
      customerEmail: handoff.customerEmail,
      customerPhone: handoff.customerPhone,
      description: `Thanh toán đơn YSim #${handoff.orderNumber}`,
    }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as ApiErrorBody).message || "")
        : "";

    throw new Error(message || `Payment candidate error ${response.status}`);
  }

  const session = body as PaymentSession;

  if (!session || typeof session !== "object" || !session.orderId) {
    throw new Error("Phản hồi tạo thanh toán không hợp lệ.");
  }

  const [localPart = "", domain = ""] = handoff.customerEmail.split("@");
  const customerEmailMasked = domain
    ? `${localPart.slice(0, 2)}***@${domain}`
    : "***";

  return {
    session,
    order: {
      orderId: session.orderId,
      orderNumber: session.orderNumber,
      status: handoff.orderStatus,
      amount: session.amount,
      currency: session.currency,
      customerEmailMasked,
    },
  };
}
