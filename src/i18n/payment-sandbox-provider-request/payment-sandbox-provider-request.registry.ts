// F07A-3S_PAYMENT_SANDBOX_PROVIDER_REQUEST_R1

import type { PaymentSandboxProviderRequestView } from "@/lib/payments/payment-sandbox-provider-request.types";
import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxProviderRequestMessagesEn } from "./messages/en";
import { paymentSandboxProviderRequestMessagesLo } from "./messages/lo";
import { paymentSandboxProviderRequestMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxProviderRequestMessageCatalog,
  PaymentSandboxProviderRequestMessageKey,
  PaymentSandboxProviderRequestTranslator,
} from "./payment-sandbox-provider-request.types";

export const PAYMENT_SANDBOX_PROVIDER_REQUEST_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxProviderRequestMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxProviderRequestMessagesVi,
  en: paymentSandboxProviderRequestMessagesEn,
  lo: paymentSandboxProviderRequestMessagesLo,
});

export function createPaymentSandboxProviderRequestTranslator(
  localeInput: unknown,
): PaymentSandboxProviderRequestTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_PROVIDER_REQUEST_MESSAGE_CATALOG[locale];
  const translator = ((key: PaymentSandboxProviderRequestMessageKey): string =>
    messages[key] ??
    PAYMENT_SANDBOX_PROVIDER_REQUEST_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxProviderRequestTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxProviderRequestView(
  value: unknown,
): PaymentSandboxProviderRequestView {
  return value === "eligibility" ||
    value === "request-envelope" ||
    value === "audit"
    ? value
    : "request";
}
