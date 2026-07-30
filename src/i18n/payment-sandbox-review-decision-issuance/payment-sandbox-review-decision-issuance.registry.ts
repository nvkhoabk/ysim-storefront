// F07A-3M_PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_CANDIDATE_R1

import type { PaymentSandboxReviewDecisionIssuanceView } from "@/lib/payments/payment-sandbox-review-decision-issuance.types";

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxReviewDecisionIssuanceMessagesEn } from "./messages/en";
import { paymentSandboxReviewDecisionIssuanceMessagesLo } from "./messages/lo";
import { paymentSandboxReviewDecisionIssuanceMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxReviewDecisionIssuanceMessageCatalog,
  PaymentSandboxReviewDecisionIssuanceMessageKey,
  PaymentSandboxReviewDecisionIssuanceTranslator,
} from "./payment-sandbox-review-decision-issuance.types";

export const PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxReviewDecisionIssuanceMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxReviewDecisionIssuanceMessagesVi,
  en: paymentSandboxReviewDecisionIssuanceMessagesEn,
  lo: paymentSandboxReviewDecisionIssuanceMessagesLo,
});

export function createPaymentSandboxReviewDecisionIssuanceTranslator(
  localeInput: unknown,
): PaymentSandboxReviewDecisionIssuanceTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages =
    PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_MESSAGE_CATALOG[locale];
  const translator = ((
    key: PaymentSandboxReviewDecisionIssuanceMessageKey,
  ): string =>
    messages[key] ??
    PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxReviewDecisionIssuanceTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxReviewDecisionIssuanceView(
  value: unknown,
): PaymentSandboxReviewDecisionIssuanceView {
  return value === "eligibility" ||
    value === "issuance-envelope" ||
    value === "audit"
    ? value
    : "issuance";
}
