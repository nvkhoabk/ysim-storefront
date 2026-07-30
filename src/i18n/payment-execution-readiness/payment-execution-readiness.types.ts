// F07A-3E_PAYMENT_EXECUTION_READINESS_GATE_CANDIDATE_R1

import type { paymentExecutionReadinessMessagesVi } from "./messages/vi";

export type PaymentExecutionReadinessMessageKey =
  keyof typeof paymentExecutionReadinessMessagesVi;

export type PaymentExecutionReadinessTranslator = (
  key: PaymentExecutionReadinessMessageKey,
  params?: Readonly<Record<string, string | number | bigint>>,
) => string;
