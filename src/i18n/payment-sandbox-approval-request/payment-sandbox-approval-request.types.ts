// F07A-3H_PAYMENT_SANDBOX_APPROVAL_REQUEST_CANDIDATE_R1

import type { ShellLocale } from "../shell/shell.types";

export type PaymentSandboxApprovalRequestMessageCatalog = Readonly<
  Record<string, string>
>;

export interface PaymentSandboxApprovalRequestTranslator {
  readonly locale: ShellLocale;
  (key: string): string;
}
