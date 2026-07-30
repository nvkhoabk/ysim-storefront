// F07A-3E_PAYMENT_EXECUTION_READINESS_GATE_CANDIDATE_R1

import type { PaymentExecutionReadinessView } from "../../lib/payments/payment-execution-readiness.types";
import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentExecutionReadinessMessagesEn } from "./messages/en";
import { paymentExecutionReadinessMessagesLo } from "./messages/lo";
import { paymentExecutionReadinessMessagesVi } from "./messages/vi";
import type {
  PaymentExecutionReadinessMessageKey,
  PaymentExecutionReadinessTranslator,
} from "./payment-execution-readiness.types";

export const PAYMENT_EXECUTION_READINESS_MESSAGE_CATALOG = {
  vi: paymentExecutionReadinessMessagesVi,
  en: paymentExecutionReadinessMessagesEn,
  lo: paymentExecutionReadinessMessagesLo,
} as const satisfies Readonly<
  Record<ShellLocale, Record<PaymentExecutionReadinessMessageKey, string>>
>;

const VIEWS = [
  "readiness",
  "blockers",
  "activation-draft",
  "audit",
] as const satisfies readonly PaymentExecutionReadinessView[];

export function normalizePaymentExecutionReadinessView(
  input: unknown,
): PaymentExecutionReadinessView {
  return typeof input === "string" &&
    (VIEWS as readonly string[]).includes(input)
    ? (input as PaymentExecutionReadinessView)
    : "readiness";
}

export function createPaymentExecutionReadinessTranslator(
  localeInput: unknown,
): PaymentExecutionReadinessTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_EXECUTION_READINESS_MESSAGE_CATALOG[locale];
  const fallback = PAYMENT_EXECUTION_READINESS_MESSAGE_CATALOG.vi;
  return (key, params = {}) => {
    const template = messages[key] ?? fallback[key];
    if (!template) {
      throw new Error(
        `PAYMENT_EXECUTION_READINESS_TRANSLATION_MISSING:${locale}:${key}`,
      );
    }
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (_, name: string) => {
        const value = params[name];
        if (value === undefined) {
          throw new Error(
            `PAYMENT_EXECUTION_READINESS_PLACEHOLDER_MISSING:${key}:${name}`,
          );
        }
        return String(value);
      },
    );
  };
}
