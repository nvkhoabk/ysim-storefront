// F07A-3N_PAYMENT_SANDBOX_APPROVAL_CANDIDATE_R1

import type { PaymentSandboxApprovalCandidateView } from "@/lib/payments/payment-sandbox-approval-candidate.types";

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxApprovalCandidateMessagesEn } from "./messages/en";
import { paymentSandboxApprovalCandidateMessagesLo } from "./messages/lo";
import { paymentSandboxApprovalCandidateMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxApprovalCandidateMessageCatalog,
  PaymentSandboxApprovalCandidateMessageKey,
  PaymentSandboxApprovalCandidateTranslator,
} from "./payment-sandbox-approval-candidate.types";

export const PAYMENT_SANDBOX_APPROVAL_CANDIDATE_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxApprovalCandidateMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxApprovalCandidateMessagesVi,
  en: paymentSandboxApprovalCandidateMessagesEn,
  lo: paymentSandboxApprovalCandidateMessagesLo,
});

export function createPaymentSandboxApprovalCandidateTranslator(
  localeInput: unknown,
): PaymentSandboxApprovalCandidateTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_APPROVAL_CANDIDATE_MESSAGE_CATALOG[locale];
  const translator = ((
    key: PaymentSandboxApprovalCandidateMessageKey,
  ): string =>
    messages[key] ??
    PAYMENT_SANDBOX_APPROVAL_CANDIDATE_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxApprovalCandidateTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxApprovalCandidateView(
  value: unknown,
): PaymentSandboxApprovalCandidateView {
  return value === "eligibility" ||
    value === "approval-envelope" ||
    value === "audit"
    ? value
    : "approval";
}
