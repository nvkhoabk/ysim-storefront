// F07A-3D_PAYMENT_PROVIDER_ASSIGNMENT_POLICY_CANDIDATE_R1

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import type { PaymentProviderAssignmentView } from "../../lib/payments/payment-provider-assignment.types";
import { paymentProviderAssignmentMessagesEn } from "./messages/en";
import { paymentProviderAssignmentMessagesLo } from "./messages/lo";
import { paymentProviderAssignmentMessagesVi } from "./messages/vi";
import type {
  PaymentProviderAssignmentMessageKey,
  PaymentProviderAssignmentTranslator,
} from "./payment-provider-assignment.types";

export const PAYMENT_PROVIDER_ASSIGNMENT_MESSAGE_CATALOG = {
  vi: paymentProviderAssignmentMessagesVi,
  en: paymentProviderAssignmentMessagesEn,
  lo: paymentProviderAssignmentMessagesLo,
} as const satisfies Readonly<
  Record<ShellLocale, Record<PaymentProviderAssignmentMessageKey, string>>
>;

const VIEWS = [
  "policy",
  "assignment",
  "settlement-draft",
  "audit",
] as const satisfies readonly PaymentProviderAssignmentView[];

export function normalizePaymentProviderAssignmentView(
  input: unknown,
): PaymentProviderAssignmentView {
  return typeof input === "string" &&
    (VIEWS as readonly string[]).includes(input)
    ? (input as PaymentProviderAssignmentView)
    : "policy";
}

export function createPaymentProviderAssignmentTranslator(
  localeInput: unknown,
): PaymentProviderAssignmentTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_PROVIDER_ASSIGNMENT_MESSAGE_CATALOG[locale];
  const fallback = PAYMENT_PROVIDER_ASSIGNMENT_MESSAGE_CATALOG.vi;
  return (key, params = {}) => {
    const template = messages[key] ?? fallback[key];
    if (!template) {
      throw new Error(
        `PAYMENT_PROVIDER_ASSIGNMENT_TRANSLATION_MISSING:${locale}:${key}`,
      );
    }
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (_, name: string) => {
        const value = params[name];
        if (value === undefined) {
          throw new Error(
            `PAYMENT_PROVIDER_ASSIGNMENT_PLACEHOLDER_MISSING:${key}:${name}`,
          );
        }
        return String(value);
      },
    );
  };
}
