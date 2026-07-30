// F07A-3G_PAYMENT_EVIDENCE_VERIFICATION_REVIEW_CANDIDATE_R1

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentEvidenceVerificationMessagesEn } from "./messages/en";
import { paymentEvidenceVerificationMessagesLo } from "./messages/lo";
import { paymentEvidenceVerificationMessagesVi } from "./messages/vi";
import type {
  PaymentEvidenceVerificationMessageCatalog,
  PaymentEvidenceVerificationTranslator,
} from "./payment-evidence-verification.types";
import type { PaymentEvidenceVerificationView } from "@/lib/payments/payment-evidence-verification.types";

export const PAYMENT_EVIDENCE_VERIFICATION_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, PaymentEvidenceVerificationMessageCatalog>
> = Object.freeze({
  vi: paymentEvidenceVerificationMessagesVi,
  en: paymentEvidenceVerificationMessagesEn,
  lo: paymentEvidenceVerificationMessagesLo,
});

export function createPaymentEvidenceVerificationTranslator(
  localeInput: unknown,
): PaymentEvidenceVerificationTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_EVIDENCE_VERIFICATION_MESSAGE_CATALOG[locale];
  const translator = ((key: string): string =>
    messages[key] ??
    PAYMENT_EVIDENCE_VERIFICATION_MESSAGE_CATALOG.vi[key] ??
    key) as PaymentEvidenceVerificationTranslator;
  Object.defineProperty(translator, "locale", { value: locale });
  return translator;
}

export function normalizePaymentEvidenceVerificationView(
  value: unknown,
): PaymentEvidenceVerificationView {
  return value === "checklist" ||
    value === "decision-draft" ||
    value === "audit"
    ? value
    : "review-queue";
}
