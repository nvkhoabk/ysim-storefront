// F07A-3Y_PAYMENT_SANDBOX_EXECUTION_LIFECYCLE_BINDING_ISSUANCE_R1

import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxExecutionLifecycleBindingIssuanceMessagesEn } from "./messages/en";
import { paymentSandboxExecutionLifecycleBindingIssuanceMessagesLo } from "./messages/lo";
import { paymentSandboxExecutionLifecycleBindingIssuanceMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxExecutionLifecycleBindingIssuanceMessageCatalog,
  PaymentSandboxExecutionLifecycleBindingIssuanceMessageKey,
  PaymentSandboxExecutionLifecycleBindingIssuanceTranslatorWithLocale,
} from "./payment-sandbox-execution-lifecycle-binding-issuance.types";
import type { PaymentSandboxExecutionLifecycleBindingIssuanceView } from "@/lib/payments/payment-sandbox-execution-lifecycle-binding-issuance.types";

const catalogs: Readonly<
  Record<
    ShellLocale,
    PaymentSandboxExecutionLifecycleBindingIssuanceMessageCatalog
  >
> = Object.freeze({
  vi: paymentSandboxExecutionLifecycleBindingIssuanceMessagesVi,
  en: paymentSandboxExecutionLifecycleBindingIssuanceMessagesEn,
  lo: paymentSandboxExecutionLifecycleBindingIssuanceMessagesLo,
});

const views: readonly PaymentSandboxExecutionLifecycleBindingIssuanceView[] = [
  "binding",
  "lifecycle",
  "binding-envelope",
  "audit",
];

export function normalizePaymentSandboxExecutionLifecycleBindingIssuanceView(
  value: string | undefined,
): PaymentSandboxExecutionLifecycleBindingIssuanceView {
  return views.includes(
    value as PaymentSandboxExecutionLifecycleBindingIssuanceView,
  )
    ? (value as PaymentSandboxExecutionLifecycleBindingIssuanceView)
    : "binding";
}

export function createPaymentSandboxExecutionLifecycleBindingIssuanceTranslator(
  locale: ShellLocale,
): PaymentSandboxExecutionLifecycleBindingIssuanceTranslatorWithLocale {
  const catalog = catalogs[locale] ?? catalogs.vi;
  const translator = ((
    key: PaymentSandboxExecutionLifecycleBindingIssuanceMessageKey,
  ) =>
    catalog[key] ??
    catalogs.vi[
      key
    ]) as PaymentSandboxExecutionLifecycleBindingIssuanceTranslatorWithLocale;
  Object.defineProperty(translator, "locale", {
    value: locale,
    enumerable: true,
  });
  return translator;
}
