// F07A-3K_PAYMENT_SANDBOX_REVIEWER_ATTESTATION_CANDIDATE_R1

import type { PaymentSandboxReviewerAttestationView } from "@/lib/payments/payment-sandbox-reviewer-attestation.types";

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxReviewerAttestationMessagesEn } from "./messages/en";
import { paymentSandboxReviewerAttestationMessagesLo } from "./messages/lo";
import { paymentSandboxReviewerAttestationMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxReviewerAttestationMessageCatalog,
  PaymentSandboxReviewerAttestationMessageKey,
  PaymentSandboxReviewerAttestationTranslator,
} from "./payment-sandbox-reviewer-attestation.types";

export const PAYMENT_SANDBOX_REVIEWER_ATTESTATION_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxReviewerAttestationMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxReviewerAttestationMessagesVi,
  en: paymentSandboxReviewerAttestationMessagesEn,
  lo: paymentSandboxReviewerAttestationMessagesLo,
});

export function createPaymentSandboxReviewerAttestationTranslator(
  localeInput: unknown,
): PaymentSandboxReviewerAttestationTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_REVIEWER_ATTESTATION_MESSAGE_CATALOG[locale];
  const translator = ((
    key: PaymentSandboxReviewerAttestationMessageKey,
  ): string =>
    messages[key] ??
    PAYMENT_SANDBOX_REVIEWER_ATTESTATION_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxReviewerAttestationTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxReviewerAttestationView(
  value: unknown,
): PaymentSandboxReviewerAttestationView {
  return value === "eligibility" ||
    value === "attestation-envelope" ||
    value === "audit"
    ? value
    : "attestation";
}
