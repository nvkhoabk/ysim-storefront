// F07A-3Q_PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_R1

import type { PaymentSandboxActivationCandidateView } from "@/lib/payments/payment-sandbox-activation-candidate.types";
import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxActivationCandidateMessagesEn } from "./messages/en";
import { paymentSandboxActivationCandidateMessagesLo } from "./messages/lo";
import { paymentSandboxActivationCandidateMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxActivationCandidateMessageCatalog,
  PaymentSandboxActivationCandidateMessageKey,
  PaymentSandboxActivationCandidateTranslator,
} from "./payment-sandbox-activation-candidate.types";

export const PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxActivationCandidateMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxActivationCandidateMessagesVi,
  en: paymentSandboxActivationCandidateMessagesEn,
  lo: paymentSandboxActivationCandidateMessagesLo,
});

export function createPaymentSandboxActivationCandidateTranslator(
  localeInput: unknown,
): PaymentSandboxActivationCandidateTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_MESSAGE_CATALOG[locale];
  const translator = ((
    key: PaymentSandboxActivationCandidateMessageKey,
  ): string =>
    messages[key] ??
    PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxActivationCandidateTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxActivationCandidateView(
  value: unknown,
): PaymentSandboxActivationCandidateView {
  return value === "eligibility" ||
    value === "activation-envelope" ||
    value === "audit"
    ? value
    : "activation";
}
