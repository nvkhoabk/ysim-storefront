// F07A-3X_PAYMENT_SANDBOX_EXECUTION_LIFECYCLE_BINDING_R1

import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxExecutionLifecycleBindingMessagesEn } from "./messages/en";
import { paymentSandboxExecutionLifecycleBindingMessagesLo } from "./messages/lo";
import { paymentSandboxExecutionLifecycleBindingMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxExecutionLifecycleBindingMessageCatalog,
  PaymentSandboxExecutionLifecycleBindingMessageKey,
  PaymentSandboxExecutionLifecycleBindingTranslatorWithLocale,
} from "./payment-sandbox-execution-lifecycle-binding.types";
import type { PaymentSandboxExecutionLifecycleBindingView } from "@/lib/payments/payment-sandbox-execution-lifecycle-binding.types";

const catalogs: Readonly<
  Record<ShellLocale, PaymentSandboxExecutionLifecycleBindingMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxExecutionLifecycleBindingMessagesVi,
  en: paymentSandboxExecutionLifecycleBindingMessagesEn,
  lo: paymentSandboxExecutionLifecycleBindingMessagesLo,
});

const views: readonly PaymentSandboxExecutionLifecycleBindingView[] = [
  "binding",
  "lifecycle",
  "binding-envelope",
  "audit",
];

export function normalizePaymentSandboxExecutionLifecycleBindingView(
  value: string | undefined,
): PaymentSandboxExecutionLifecycleBindingView {
  return views.includes(value as PaymentSandboxExecutionLifecycleBindingView)
    ? (value as PaymentSandboxExecutionLifecycleBindingView)
    : "binding";
}

export function createPaymentSandboxExecutionLifecycleBindingTranslator(
  locale: ShellLocale,
): PaymentSandboxExecutionLifecycleBindingTranslatorWithLocale {
  const catalog = catalogs[locale] ?? catalogs.vi;
  const translator = ((
    key: PaymentSandboxExecutionLifecycleBindingMessageKey,
  ) =>
    catalog[key] ??
    catalogs.vi[
      key
    ]) as PaymentSandboxExecutionLifecycleBindingTranslatorWithLocale;
  Object.defineProperty(translator, "locale", {
    value: locale,
    enumerable: true,
  });
  return translator;
}
