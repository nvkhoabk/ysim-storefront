// F07A-3P_PAYMENT_SANDBOX_APPROVAL_TOKEN_R1

import type { PaymentSandboxApprovalTokenView } from "@/lib/payments/payment-sandbox-approval-token.types";

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxApprovalTokenMessagesEn } from "./messages/en";
import { paymentSandboxApprovalTokenMessagesLo } from "./messages/lo";
import { paymentSandboxApprovalTokenMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxApprovalTokenMessageCatalog,
  PaymentSandboxApprovalTokenMessageKey,
  PaymentSandboxApprovalTokenTranslator,
} from "./payment-sandbox-approval-token.types";

export const PAYMENT_SANDBOX_APPROVAL_TOKEN_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxApprovalTokenMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxApprovalTokenMessagesVi,
  en: paymentSandboxApprovalTokenMessagesEn,
  lo: paymentSandboxApprovalTokenMessagesLo,
});

export function createPaymentSandboxApprovalTokenTranslator(
  localeInput: unknown,
): PaymentSandboxApprovalTokenTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_APPROVAL_TOKEN_MESSAGE_CATALOG[locale];
  const translator = ((key: PaymentSandboxApprovalTokenMessageKey): string =>
    messages[key] ??
    PAYMENT_SANDBOX_APPROVAL_TOKEN_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxApprovalTokenTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentSandboxApprovalTokenView(
  value: unknown,
): PaymentSandboxApprovalTokenView {
  return value === "eligibility" ||
    value === "token-envelope" ||
    value === "audit"
    ? value
    : "token";
}
