// F07A-3D_PAYMENT_PROVIDER_ASSIGNMENT_POLICY_CANDIDATE_R1

import type { paymentProviderAssignmentMessagesVi } from "./messages/vi";

export type PaymentProviderAssignmentMessageKey =
  keyof typeof paymentProviderAssignmentMessagesVi;

export type PaymentProviderAssignmentTranslator = (
  key: PaymentProviderAssignmentMessageKey,
  params?: Readonly<Record<string, string | number>>,
) => string;
