// F07A-3L_PAYMENT_SANDBOX_REVIEW_DECISION_CANDIDATE_R1

import type { PaymentSandboxReviewDecisionView } from "@/lib/payments/payment-sandbox-review-decision.types";

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxReviewDecisionMessagesEn } from "./messages/en";
import { paymentSandboxReviewDecisionMessagesLo } from "./messages/lo";
import { paymentSandboxReviewDecisionMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxReviewDecisionMessageCatalog,
  PaymentSandboxReviewDecisionMessageKey,
  PaymentSandboxReviewDecisionTranslator,
} from "./payment-sandbox-review-decision.types";

export const PAYMENT_SANDBOX_REVIEW_DECISION_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxReviewDecisionMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxReviewDecisionMessagesVi,
  en: paymentSandboxReviewDecisionMessagesEn,
  lo: paymentSandboxReviewDecisionMessagesLo,
});

export function createPaymentSandboxReviewDecisionTranslator(
  localeInput: unknown,
): PaymentSandboxReviewDecisionTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_REVIEW_DECISION_MESSAGE_CATALOG[locale];
  const translator = ((key: PaymentSandboxReviewDecisionMessageKey): string =>
    messages[key] ??
    PAYMENT_SANDBOX_REVIEW_DECISION_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxReviewDecisionTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxReviewDecisionView(
  value: unknown,
): PaymentSandboxReviewDecisionView {
  return value === "eligibility" ||
    value === "decision-envelope" ||
    value === "audit"
    ? value
    : "decision";
}
