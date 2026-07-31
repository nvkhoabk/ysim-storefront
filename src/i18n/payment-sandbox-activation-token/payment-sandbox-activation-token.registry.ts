// F07A-3R_PAYMENT_SANDBOX_ACTIVATION_TOKEN_R1

import type { PaymentSandboxActivationTokenView } from "@/lib/payments/payment-sandbox-activation-token.types";
import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxActivationTokenMessagesEn } from "./messages/en";
import { paymentSandboxActivationTokenMessagesLo } from "./messages/lo";
import { paymentSandboxActivationTokenMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxActivationTokenMessageCatalog,
  PaymentSandboxActivationTokenMessageKey,
  PaymentSandboxActivationTokenTranslator,
} from "./payment-sandbox-activation-token.types";

export const PAYMENT_SANDBOX_ACTIVATION_TOKEN_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxActivationTokenMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxActivationTokenMessagesVi,
  en: paymentSandboxActivationTokenMessagesEn,
  lo: paymentSandboxActivationTokenMessagesLo,
});

export function createPaymentSandboxActivationTokenTranslator(
  localeInput: unknown,
): PaymentSandboxActivationTokenTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_ACTIVATION_TOKEN_MESSAGE_CATALOG[locale];
  const translator = ((key: PaymentSandboxActivationTokenMessageKey): string =>
    messages[key] ??
    PAYMENT_SANDBOX_ACTIVATION_TOKEN_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxActivationTokenTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxActivationTokenView(
  value: unknown,
): PaymentSandboxActivationTokenView {
  return value === "eligibility" ||
    value === "token-envelope" ||
    value === "audit"
    ? value
    : "token";
}
