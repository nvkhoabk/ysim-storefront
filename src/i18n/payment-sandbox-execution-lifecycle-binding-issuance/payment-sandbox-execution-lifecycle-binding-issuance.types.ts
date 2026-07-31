// F07A-3Y_PAYMENT_SANDBOX_EXECUTION_LIFECYCLE_BINDING_ISSUANCE_R1

import type { ShellLocale } from "../shell/shell.types";
import type { PaymentSandboxExecutionLifecycleBindingIssuanceView } from "@/lib/payments/payment-sandbox-execution-lifecycle-binding-issuance.types";

export type PaymentSandboxExecutionLifecycleBindingIssuanceMessageKey =
  | "common.yes"
  | "common.no"
  | "common.notCreated"
  | "labels.preview"
  | "labels.tabs"
  | "labels.localeNavigation"
  | "preview.eyebrow"
  | "preview.title"
  | "preview.description"
  | "preview.candidate"
  | "preview.safety"
  | "summary.provider"
  | "summary.status"
  | "summary.bindingCandidateId"
  | "summary.reviewerAlias"
  | "summary.executionEligible"
  | "tabs.binding"
  | "tabs.lifecycle"
  | "tabs.bindingEnvelope"
  | "tabs.audit"
  | "binding.title"
  | "binding.description"
  | "item.requestIdentity"
  | "item.verificationBinding"
  | "item.approvalPrerequisites"
  | "item.noExecutionGuardrails"
  | "status.prepared"
  | "status.receiptNotPrepared"
  | "status.adapterDisabled"
  | "status.adapterMissing"
  | "field.receiptCandidateId"
  | "field.reviewerAlias"
  | "field.bindingPrepared"
  | "field.lifecycleBound"
  | "field.bindingPersisted"
  | "field.transactionMutation"
  | "lifecycle.title"
  | "lifecycle.description"
  | "lifecycle.receiptContract"
  | "lifecycle.environment"
  | "lifecycle.normalizationPrepared"
  | "lifecycle.providerResponseAbsent"
  | "lifecycle.responseReceiptAbsent"
  | "lifecycle.receiptNotPersisted"
  | "lifecycle.boundaryClosed"
  | "lifecycle.executionNotAuthorized"
  | "lifecycle.aliasOpaque"
  | "lifecycle.itemSet"
  | "lifecycle.profilePrepared"
  | "lifecycle.guardrails"
  | "lifecycle.result"
  | "envelope.title"
  | "envelope.description"
  | "envelope.mediaType"
  | "envelope.signed"
  | "envelope.containsSecret"
  | "envelope.containsPii"
  | "envelope.submitted"
  | "envelope.persisted"
  | "envelope.body"
  | "audit.title"
  | "audit.description"
  | "audit.matched"
  | "audit.mismatched"
  | "audit.schema"
  | "audit.environment"
  | "audit.receiptContract"
  | "audit.upstreamFingerprint"
  | "audit.bindingCandidateId"
  | "audit.itemSet"
  | "audit.aliasOpaque"
  | "audit.noPii"
  | "audit.noCredential"
  | "audit.normalizationPrepared"
  | "audit.providerResponseAbsent"
  | "audit.responseReceiptAbsent"
  | "audit.receiptNotPersisted"
  | "audit.bindingPrepared"
  | "audit.lifecycleNotBound"
  | "audit.bindingNotPersisted"
  | "audit.envelopeUnsigned"
  | "audit.noSecret"
  | "audit.envelopeNoPii"
  | "audit.notSubmitted"
  | "audit.noSettlement"
  | "audit.noTransactionMutation"
  | "audit.noRegistryMutation"
  | "audit.executionBlocked"
  | "action.disabled";

export type PaymentSandboxExecutionLifecycleBindingIssuanceMessageCatalog =
  Readonly<
    Record<PaymentSandboxExecutionLifecycleBindingIssuanceMessageKey, string>
  >;

export interface PaymentSandboxExecutionLifecycleBindingIssuanceTranslator {
  (key: PaymentSandboxExecutionLifecycleBindingIssuanceMessageKey): string;
  readonly locale: ShellLocale;
}

export type PaymentSandboxExecutionLifecycleBindingIssuanceMessageRegistry =
  Readonly<
    Record<
      ShellLocale,
      PaymentSandboxExecutionLifecycleBindingIssuanceMessageCatalog
    >
  >;

export interface PaymentSandboxExecutionLifecycleBindingIssuanceTranslatorWithLocale extends PaymentSandboxExecutionLifecycleBindingIssuanceTranslator {
  readonly locale: ShellLocale;
}

export type PaymentSandboxExecutionLifecycleBindingIssuanceViewRegistry =
  readonly PaymentSandboxExecutionLifecycleBindingIssuanceView[];
