// F07A-3F_PAYMENT_OPERATIONAL_EVIDENCE_MANIFEST_CANDIDATE_R1

import type { paymentOperationalEvidenceMessagesVi } from "./messages/vi";

export type PaymentOperationalEvidenceMessageKey =
  keyof typeof paymentOperationalEvidenceMessagesVi;

export type PaymentOperationalEvidenceTranslator = (
  key: PaymentOperationalEvidenceMessageKey,
  params?: Readonly<Record<string, string | number | bigint>>,
) => string;
