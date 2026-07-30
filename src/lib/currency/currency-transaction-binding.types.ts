// F07A-3C_CURRENCY_TRANSACTION_BINDING_CANDIDATE_R1

import type { CurrencyPresentationModel } from "./currency-presentation.types";
import type { SupportedQuoteCurrency } from "./currency-quote.types";

export type CurrencyTransactionBindingView =
  "checkout-lock" | "payment-draft" | "order-record" | "audit";
export type CurrencyTransactionBindingStatus = "preview-locked";
export type CurrencyBindingAuditStatus = "matched" | "mismatch";

export interface CurrencyCheckoutLock {
  readonly status: CurrencyTransactionBindingStatus;
  readonly lockedAt: string;
  readonly immutable: true;
}

export interface CurrencyPaymentDraft {
  readonly status: "unassigned";
  readonly providerId: null;
  readonly requestedCurrency: null;
  readonly requestedAmountMinor: null;
  readonly settlementInstructionCreated: false;
}

export interface CurrencyOrderRecordPreview {
  readonly recordId: string;
  readonly orderCode: "YSIM-F07A-3C-PREVIEW";
  readonly amountSource: "locked-presentation-snapshot";
  readonly immutable: true;
  readonly productionEligible: false;
}

export interface CurrencyTransactionBinding {
  readonly schemaVersion: "f07a-3c-r1";
  readonly bindingId: string;
  readonly purpose: "ui-preview-only";
  readonly productionEligible: false;
  readonly sourceCurrency: "VND";
  readonly presentedCurrency: SupportedQuoteCurrency;
  readonly lockedPresentation: CurrencyPresentationModel;
  readonly checkoutLock: CurrencyCheckoutLock;
  readonly paymentDraft: CurrencyPaymentDraft;
  readonly orderRecord: CurrencyOrderRecordPreview;
}

export interface CurrencyBindingObservation {
  readonly quoteId: string;
  readonly presentedCurrency: SupportedQuoteCurrency;
  readonly presentedAmountMinor: bigint;
  readonly snapshotFingerprint: string;
  readonly productionEligible: boolean;
}

export interface CurrencyBindingAuditChecks {
  readonly sourceCurrencyMatches: boolean;
  readonly quoteIdMatches: boolean;
  readonly presentedCurrencyMatches: boolean;
  readonly presentedAmountMatches: boolean;
  readonly snapshotFingerprintMatches: boolean;
  readonly productionEligibilityMatches: boolean;
  readonly paymentDraftRemainsUnassigned: boolean;
}

export interface CurrencyBindingAudit {
  readonly auditId: string;
  readonly bindingId: string;
  readonly status: CurrencyBindingAuditStatus;
  readonly checks: CurrencyBindingAuditChecks;
}
