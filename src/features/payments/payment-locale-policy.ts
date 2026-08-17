import type { ShellLocale } from "@/i18n/shell/shell.types";

import type {
  PaymentMethodOption,
  PaymentProviderId,
} from "./payment.types";

const PAYMENT_METHODS_BY_LOCALE = {
  vi: [
    {
      id: "gpay_virtual_account",
      title: "QRcode chuyển khoản",
      description:
        "Quét mã QR để chuyển khoản qua tài khoản ảo GPay dành riêng cho đơn hàng.",
    },
  ],
  en: [
    {
      id: "gpay_gateway_all",
      title: "Payment Gateway",
      description: "Continue securely through the GPay payment gateway.",
    },
  ],
  lo: [
    {
      id: "gpay_gateway_all",
      title: "Payment Gateway",
      description:
        "ດຳເນີນການຊຳລະເງິນຢ່າງປອດໄພຜ່ານປະຕູຊຳລະເງິນ GPay.",
    },
  ],
} as const satisfies Readonly<Record<ShellLocale, readonly PaymentMethodOption[]>>;

export const PAYMENT_LOCALE_POLICY_VERSION = "f08-01-v1";

export function isPaymentLocale(value: unknown): value is ShellLocale {
  return value === "vi" || value === "en" || value === "lo";
}

export function getPaymentMethodsForLocale(
  locale: ShellLocale,
): readonly PaymentMethodOption[] {
  return PAYMENT_METHODS_BY_LOCALE[locale];
}

export function getPaymentMethodForLocale(
  locale: ShellLocale,
  providerId: PaymentProviderId,
): PaymentMethodOption | null {
  return (
    getPaymentMethodsForLocale(locale).find(
      (method) => method.id === providerId,
    ) ?? null
  );
}

export function isPaymentProviderAllowedForLocale(
  locale: ShellLocale,
  providerId: PaymentProviderId,
): boolean {
  return getPaymentMethodForLocale(locale, providerId) !== null;
}
