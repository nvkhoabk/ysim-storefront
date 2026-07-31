// F07A-3U_PAYMENT_SANDBOX_PROVIDER_SUBMISSION_GATE_R1

import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxProviderSubmissionGateMessagesEn } from "./messages/en";
import { paymentSandboxProviderSubmissionGateMessagesLo } from "./messages/lo";
import { paymentSandboxProviderSubmissionGateMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxProviderSubmissionGateMessageCatalog,
  PaymentSandboxProviderSubmissionGateMessageKey,
  PaymentSandboxProviderSubmissionGateTranslator,
} from "./payment-sandbox-provider-submission-gate.types";
import type { PaymentSandboxProviderSubmissionGateView } from "@/lib/payments/payment-sandbox-provider-submission-gate.types";

const catalogs: Readonly<
  Record<ShellLocale, PaymentSandboxProviderSubmissionGateMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxProviderSubmissionGateMessagesVi,
  en: paymentSandboxProviderSubmissionGateMessagesEn,
  lo: paymentSandboxProviderSubmissionGateMessagesLo,
});
const views: readonly PaymentSandboxProviderSubmissionGateView[] = [
  "gate",
  "eligibility",
  "gate-envelope",
  "audit",
];
export function normalizePaymentSandboxProviderSubmissionGateView(
  value: string | undefined,
): PaymentSandboxProviderSubmissionGateView {
  return views.includes(value as PaymentSandboxProviderSubmissionGateView)
    ? (value as PaymentSandboxProviderSubmissionGateView)
    : "gate";
}
export function createPaymentSandboxProviderSubmissionGateTranslator(
  locale: ShellLocale,
): PaymentSandboxProviderSubmissionGateTranslator {
  const catalog = catalogs[locale] ?? catalogs.vi;
  const translator = ((key: PaymentSandboxProviderSubmissionGateMessageKey) =>
    catalog[key] ??
    catalogs.vi[key]) as PaymentSandboxProviderSubmissionGateTranslator;
  Object.defineProperty(translator, "locale", {
    value: locale,
    enumerable: true,
  });
  return translator;
}
