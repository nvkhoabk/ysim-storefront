// F07A-3O_PAYMENT_SANDBOX_APPROVAL_ISSUANCE_R1
import type { PaymentSandboxApprovalIssuanceView } from "@/lib/payments/payment-sandbox-approval-issuance.types";
import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxApprovalIssuanceMessagesEn } from "./messages/en";
import { paymentSandboxApprovalIssuanceMessagesLo } from "./messages/lo";
import { paymentSandboxApprovalIssuanceMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxApprovalIssuanceMessageCatalog,
  PaymentSandboxApprovalIssuanceMessageKey,
  PaymentSandboxApprovalIssuanceTranslator,
} from "./payment-sandbox-approval-issuance.types";
export const PAYMENT_SANDBOX_APPROVAL_ISSUANCE_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentSandboxApprovalIssuanceMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxApprovalIssuanceMessagesVi,
  en: paymentSandboxApprovalIssuanceMessagesEn,
  lo: paymentSandboxApprovalIssuanceMessagesLo,
});
export function createPaymentSandboxApprovalIssuanceTranslator(
  localeInput: unknown,
): PaymentSandboxApprovalIssuanceTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_SANDBOX_APPROVAL_ISSUANCE_MESSAGE_CATALOG[locale];
  const translator = ((key: PaymentSandboxApprovalIssuanceMessageKey): string =>
    messages[key] ??
    PAYMENT_SANDBOX_APPROVAL_ISSUANCE_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentSandboxApprovalIssuanceTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}
export function normalizePaymentSandboxApprovalIssuanceView(
  value: unknown,
): PaymentSandboxApprovalIssuanceView {
  return value === "eligibility" ||
    value === "issuance-envelope" ||
    value === "audit"
    ? value
    : "issuance";
}
