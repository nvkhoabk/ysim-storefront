// F07A-3I_PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_CANDIDATE_R1

import type { PaymentSandboxApprovalReviewHandoffView } from "@/lib/payments/payment-sandbox-approval-review-handoff.types";

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxApprovalReviewHandoffMessagesEn } from "./messages/en";
import { paymentSandboxApprovalReviewHandoffMessagesLo } from "./messages/lo";
import { paymentSandboxApprovalReviewHandoffMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxApprovalReviewHandoffMessageCatalog,
  PaymentSandboxApprovalReviewHandoffMessageKey,
  PaymentSandboxApprovalReviewHandoffTranslator,
} from "./payment-sandbox-approval-review-handoff.types";

export const PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxApprovalReviewHandoffMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxApprovalReviewHandoffMessagesVi,
  en: paymentSandboxApprovalReviewHandoffMessagesEn,
  lo: paymentSandboxApprovalReviewHandoffMessagesLo,
});

export function createPaymentSandboxApprovalReviewHandoffTranslator(
  localeInput: unknown,
): PaymentSandboxApprovalReviewHandoffTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_MESSAGE_CATALOG[locale];
  const translator = ((
    key: PaymentSandboxApprovalReviewHandoffMessageKey,
  ): string =>
    messages[key] ??
    PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxApprovalReviewHandoffTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxApprovalReviewHandoffView(
  value: unknown,
): PaymentSandboxApprovalReviewHandoffView {
  return value === "checklist" || value === "export-envelope" || value === "audit"
    ? value
    : "handoff";
}
