import type {
  PaymentProviderId,
} from "@/features/payments/payment.types";

import {
  tryParseRegisteredPaymentProviderId,
} from "@/features/payments/candidate/payment-provider-runtime";

import type {
  PaymentCandidateConfigViewModel,
} from "@/types/view-models/payment-route-candidate";

function providerList(
  raw:
    | string
    | undefined,
): readonly PaymentProviderId[] {
  const parsed =
    (
      raw ||
      "cash_agent"
    )
      .split(
        ",",
      )
      .map(
        (value) =>
          tryParseRegisteredPaymentProviderId(
            value,
          ),
      )
      .filter(
        (
          value,
        ): value is
          PaymentProviderId =>
          Boolean(
            value,
          ),
      );

  if (
    parsed.length >
    0
  ) {
    return Array.from(
      new Set(
        parsed,
      ),
    );
  }

  const fallback =
    tryParseRegisteredPaymentProviderId(
      "cash_agent",
    );

  return fallback
    ? [
        fallback,
      ]
    : [];
}

function payableStatuses(
  raw:
    | string
    | undefined,
): readonly string[] {
  const parsed =
    (
      raw ||
      "pending,on-hold,failed"
    )
      .split(
        ",",
      )
      .map(
        (value) =>
          value
            .trim()
            .toLowerCase(),
      )
      .filter(Boolean);

  return parsed.length >
    0
    ? Array.from(
        new Set(
          parsed,
        ),
      )
    : [
        "pending",
        "on-hold",
        "failed",
      ];
}

export function getPaymentCandidateEnabledProviders():
  readonly PaymentProviderId[] {
  return providerList(
    process.env
      .YSIM_PAYMENT_CANDIDATE_ENABLED_PROVIDERS,
  );
}

export function getPaymentCandidatePayableStatuses():
  readonly string[] {
  return payableStatuses(
    process.env
      .YSIM_PAYMENT_CANDIDATE_PAYABLE_STATUSES,
  );
}

export function createPaymentCandidateConfigViewModel():
  PaymentCandidateConfigViewModel {
  const enabledProviders =
    getPaymentCandidateEnabledProviders();

  const statuses =
    getPaymentCandidatePayableStatuses();

  return {
    title:
      "Thanh toán đơn hàng",
    description:
      "Xác minh lại WooCommerce Order trước khi khởi tạo Payment Provider.",
    enabledProviders,
    payableStatuses:
      statuses,
    resultPath:
      "/ui-preview/payment-result-route-candidate",
    diagnostics: [
      {
        label:
          "Order verification",
        status:
          "live",
        statusLabel:
          "Server-side",
        message:
          "Amount, currency và customer được lấy lại từ WooCommerce REST API.",
      },
      {
        label:
          "Provider allowlist",
        status:
          "ready",
        statusLabel:
          enabledProviders.length >
          0
            ? enabledProviders.join(
                ", ",
              )
            : "No provider",
        message:
          "ID provider được xác minh theo payment registry hiện tại.",
      },
      {
        label:
          "Redirect",
        status:
          "ready",
        statusLabel:
          "Manual",
        message:
          "Không tự redirect; người dùng phải bấm mở cổng thanh toán.",
      },
      {
        label:
          "Callback",
        status:
          "warning",
        statusLabel:
          "Separate",
        message:
          "Webhook, query status và signature verification chưa nằm trong Package 30.",
      },
      {
        label:
          "Order update",
        status:
          "warning",
        statusLabel:
          "Not included",
        message:
          "PaymentSession chưa tự đánh dấu WooCommerce Order là paid.",
      },
    ],
  };
}
