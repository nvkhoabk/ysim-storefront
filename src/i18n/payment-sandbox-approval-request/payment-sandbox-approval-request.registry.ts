// F07A-3H_PAYMENT_SANDBOX_APPROVAL_REQUEST_CANDIDATE_R1

import type { PaymentSandboxApprovalRequestView } from "@/lib/payments/payment-sandbox-approval-request.types";

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxApprovalRequestMessagesEn } from "./messages/en";
import { paymentSandboxApprovalRequestMessagesLo } from "./messages/lo";
import { paymentSandboxApprovalRequestMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxApprovalRequestMessageCatalog,
  PaymentSandboxApprovalRequestTranslator,
} from "./payment-sandbox-approval-request.types";

export const PAYMENT_SANDBOX_APPROVAL_REQUEST_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxApprovalRequestMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxApprovalRequestMessagesVi,
  en: paymentSandboxApprovalRequestMessagesEn,
  lo: paymentSandboxApprovalRequestMessagesLo,
});

export function createPaymentSandboxApprovalRequestTranslator(
  localeInput: unknown,
): PaymentSandboxApprovalRequestTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_APPROVAL_REQUEST_MESSAGE_CATALOG[locale];
  const translator = ((key: string): string =>
    messages[key] ??
    PAYMENT_SANDBOX_APPROVAL_REQUEST_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxApprovalRequestTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxApprovalRequestView(
  value: unknown,
): PaymentSandboxApprovalRequestView {
  return value === "prerequisites" ||
    value === "approval-draft" ||
    value === "audit"
    ? value
    : "request";
}
