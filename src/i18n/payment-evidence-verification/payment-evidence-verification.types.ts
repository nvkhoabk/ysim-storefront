// F07A-3G_PAYMENT_EVIDENCE_VERIFICATION_REVIEW_CANDIDATE_R1

import type { ShellLocale } from "../shell/shell.types";

export type PaymentEvidenceVerificationMessageCatalog = Readonly<
  Record<string, string>
>;

export interface PaymentEvidenceVerificationTranslator {
  readonly locale: ShellLocale;
  (key: string): string;
}
