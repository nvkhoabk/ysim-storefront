// F07A-3V_PAYMENT_SANDBOX_PROVIDER_EXECUTION_BOUNDARY_R1

import type { ShellLocale } from "../shell/shell.types";
import { paymentSandboxProviderExecutionBoundaryMessagesEn } from "./messages/en";
import { paymentSandboxProviderExecutionBoundaryMessagesLo } from "./messages/lo";
import { paymentSandboxProviderExecutionBoundaryMessagesVi } from "./messages/vi";
import type {
  PaymentSandboxProviderExecutionBoundaryMessageCatalog,
  PaymentSandboxProviderExecutionBoundaryMessageKey,
  PaymentSandboxProviderExecutionBoundaryTranslator,
} from "./payment-sandbox-provider-execution-boundary.types";
import type { PaymentSandboxProviderExecutionBoundaryView } from "@/lib/payments/payment-sandbox-provider-execution-boundary.types";

const catalogs: Readonly<
  Record<ShellLocale, PaymentSandboxProviderExecutionBoundaryMessageCatalog>
> = Object.freeze({
  vi: paymentSandboxProviderExecutionBoundaryMessagesVi,
  en: paymentSandboxProviderExecutionBoundaryMessagesEn,
  lo: paymentSandboxProviderExecutionBoundaryMessagesLo,
});
const views: readonly PaymentSandboxProviderExecutionBoundaryView[] = [
  "boundary",
  "eligibility",
  "boundary-envelope",
  "audit",
];
export function normalizePaymentSandboxProviderExecutionBoundaryView(
  value: string | undefined,
): PaymentSandboxProviderExecutionBoundaryView {
  return views.includes(value as PaymentSandboxProviderExecutionBoundaryView)
    ? (value as PaymentSandboxProviderExecutionBoundaryView)
    : "boundary";
}
export function createPaymentSandboxProviderExecutionBoundaryTranslator(
  locale: ShellLocale,
): PaymentSandboxProviderExecutionBoundaryTranslator {
  const catalog = catalogs[locale] ?? catalogs.vi;
  const translator = ((
    key: PaymentSandboxProviderExecutionBoundaryMessageKey,
  ) =>
    catalog[key] ??
    catalogs.vi[key]) as PaymentSandboxProviderExecutionBoundaryTranslator;
  Object.defineProperty(translator, "locale", {
    value: locale,
    enumerable: true,
  });
  return translator;
}
