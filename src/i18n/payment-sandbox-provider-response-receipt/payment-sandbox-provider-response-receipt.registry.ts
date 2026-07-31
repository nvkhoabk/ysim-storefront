// F07A-3W_PAYMENT_SANDBOX_PROVIDER_RESPONSE_RECEIPT_R1

import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxProviderResponseReceiptMessagesEn } from "./messages/en";
import { paymentSandboxProviderResponseReceiptMessagesLo } from "./messages/lo";
import { paymentSandboxProviderResponseReceiptMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxProviderResponseReceiptMessageCatalog,
  PaymentSandboxProviderResponseReceiptMessageKey,
  PaymentSandboxProviderResponseReceiptTranslatorWithLocale,
} from "./payment-sandbox-provider-response-receipt.types";
import type { PaymentSandboxProviderResponseReceiptView } from "@/lib/payments/payment-sandbox-provider-response-receipt.types";

const catalogs: Readonly<
  Record<ShellLocale, PaymentSandboxProviderResponseReceiptMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxProviderResponseReceiptMessagesVi,
  en: paymentSandboxProviderResponseReceiptMessagesEn,
  lo: paymentSandboxProviderResponseReceiptMessagesLo,
});
const views: readonly PaymentSandboxProviderResponseReceiptView[] =
  Object.freeze(["receipt", "normalization", "receipt-envelope", "audit"]);
export function normalizePaymentSandboxProviderResponseReceiptView(
  value: unknown,
): PaymentSandboxProviderResponseReceiptView {
  return typeof value === "string" &&
    views.includes(value as PaymentSandboxProviderResponseReceiptView)
    ? (value as PaymentSandboxProviderResponseReceiptView)
    : "receipt";
}
export function createPaymentSandboxProviderResponseReceiptTranslator(
  locale: ShellLocale,
): PaymentSandboxProviderResponseReceiptTranslatorWithLocale {
  const catalog = catalogs[locale] ?? catalogs.vi;
  const translator = ((key: PaymentSandboxProviderResponseReceiptMessageKey) =>
    catalog[key] ??
    catalogs.vi[
      key
    ]) as PaymentSandboxProviderResponseReceiptTranslatorWithLocale;
  Object.defineProperty(translator, "locale", {
    value: locale,
    enumerable: true,
  });
  return translator;
}
