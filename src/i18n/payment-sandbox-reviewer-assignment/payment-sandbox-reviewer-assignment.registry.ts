// F07A-3J_PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_CANDIDATE_R1

import type { PaymentSandboxReviewerAssignmentView } from "@/lib/payments/payment-sandbox-reviewer-assignment.types";

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxReviewerAssignmentMessagesEn } from "./messages/en";
import { paymentSandboxReviewerAssignmentMessagesLo } from "./messages/lo";
import { paymentSandboxReviewerAssignmentMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxReviewerAssignmentMessageCatalog,
  PaymentSandboxReviewerAssignmentMessageKey,
  PaymentSandboxReviewerAssignmentTranslator,
} from "./payment-sandbox-reviewer-assignment.types";

export const PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxReviewerAssignmentMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxReviewerAssignmentMessagesVi,
  en: paymentSandboxReviewerAssignmentMessagesEn,
  lo: paymentSandboxReviewerAssignmentMessagesLo,
});

export function createPaymentSandboxReviewerAssignmentTranslator(
  localeInput: unknown,
): PaymentSandboxReviewerAssignmentTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_MESSAGE_CATALOG[locale];
  const translator = ((
    key: PaymentSandboxReviewerAssignmentMessageKey,
  ): string =>
    messages[key] ??
    PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxReviewerAssignmentTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxReviewerAssignmentView(
  value: unknown,
): PaymentSandboxReviewerAssignmentView {
  return value === "eligibility" ||
    value === "assignment-envelope" ||
    value === "audit"
    ? value
    : "assignment";
}
