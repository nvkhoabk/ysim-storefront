// F07A-3F_PAYMENT_OPERATIONAL_EVIDENCE_MANIFEST_CANDIDATE_R1

import type { PaymentOperationalEvidenceView } from "../../lib/payments/payment-operational-evidence.types";
import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { paymentOperationalEvidenceMessagesEn } from "./messages/en";
import { paymentOperationalEvidenceMessagesLo } from "./messages/lo";
import { paymentOperationalEvidenceMessagesVi } from "./messages/vi";
import type {
  PaymentOperationalEvidenceMessageKey,
  PaymentOperationalEvidenceTranslator,
} from "./payment-operational-evidence.types";

export const PAYMENT_OPERATIONAL_EVIDENCE_MESSAGE_CATALOG = {
  vi: paymentOperationalEvidenceMessagesVi,
  en: paymentOperationalEvidenceMessagesEn,
  lo: paymentOperationalEvidenceMessagesLo,
} as const satisfies Readonly<
  Record<ShellLocale, Record<PaymentOperationalEvidenceMessageKey, string>>
>;

const VIEWS = [
  "evidence",
  "matrix",
  "approval-draft",
  "audit",
] as const satisfies readonly PaymentOperationalEvidenceView[];

export function normalizePaymentOperationalEvidenceView(
  input: unknown,
): PaymentOperationalEvidenceView {
  return typeof input === "string" &&
    (VIEWS as readonly string[]).includes(input)
    ? (input as PaymentOperationalEvidenceView)
    : "evidence";
}

export function createPaymentOperationalEvidenceTranslator(
  localeInput: unknown,
): PaymentOperationalEvidenceTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = PAYMENT_OPERATIONAL_EVIDENCE_MESSAGE_CATALOG[locale];
  const fallback = PAYMENT_OPERATIONAL_EVIDENCE_MESSAGE_CATALOG.vi;
  return (key, params = {}) => {
    const template = messages[key] ?? fallback[key];
    if (!template) {
      throw new Error(
        `PAYMENT_OPERATIONAL_EVIDENCE_TRANSLATION_MISSING:${locale}:${key}`,
      );
    }
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (_, name: string) => {
        const value = params[name];
        if (value === undefined) {
          throw new Error(
            `PAYMENT_OPERATIONAL_EVIDENCE_PLACEHOLDER_MISSING:${key}:${name}`,
          );
        }
        return String(value);
      },
    );
  };
}
