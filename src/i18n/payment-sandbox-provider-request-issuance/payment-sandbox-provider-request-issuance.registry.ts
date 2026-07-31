// F07A-3T_PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_R1

import type { PaymentSandboxProviderRequestIssuanceView } from "@/lib/payments/payment-sandbox-provider-request-issuance.types";
import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxProviderRequestIssuanceMessagesEn } from "./messages/en";
import { paymentSandboxProviderRequestIssuanceMessagesLo } from "./messages/lo";
import { paymentSandboxProviderRequestIssuanceMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxProviderRequestIssuanceMessageCatalog,
  PaymentSandboxProviderRequestIssuanceMessageKey,
  PaymentSandboxProviderRequestIssuanceTranslator,
} from "./payment-sandbox-provider-request-issuance.types";

export const PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxProviderRequestIssuanceMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxProviderRequestIssuanceMessagesVi,
  en: paymentSandboxProviderRequestIssuanceMessagesEn,
  lo: paymentSandboxProviderRequestIssuanceMessagesLo,
});

export function createPaymentSandboxProviderRequestIssuanceTranslator(
  localeInput: unknown,
): PaymentSandboxProviderRequestIssuanceTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages =
    PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_MESSAGE_CATALOG[locale];
  const translator = ((
    key: PaymentSandboxProviderRequestIssuanceMessageKey,
  ): string =>
    messages[key] ??
    PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxProviderRequestIssuanceTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxProviderRequestIssuanceView(
  value: unknown,
): PaymentSandboxProviderRequestIssuanceView {
  return value === "eligibility" ||
    value === "issuance-envelope" ||
    value === "audit"
    ? value
    : "issuance";
}
