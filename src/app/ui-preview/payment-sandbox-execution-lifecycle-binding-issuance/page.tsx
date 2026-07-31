// F07A-3Y_PAYMENT_SANDBOX_EXECUTION_LIFECYCLE_BINDING_ISSUANCE_R1

import Link from "next/link";
import { PageShell } from "@/components/layout";
import {
  createPaymentSandboxExecutionLifecycleBindingIssuanceTranslator,
  normalizePaymentSandboxExecutionLifecycleBindingIssuanceView,
} from "@/i18n/payment-sandbox-execution-lifecycle-binding-issuance/payment-sandbox-execution-lifecycle-binding-issuance.registry";
import type { PaymentSandboxExecutionLifecycleBindingIssuanceMessageKey } from "@/i18n/payment-sandbox-execution-lifecycle-binding-issuance/payment-sandbox-execution-lifecycle-binding-issuance.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { createPaymentSandboxActivationCandidate } from "@/lib/payments/payment-sandbox-activation-candidate";
import { createPaymentSandboxActivationToken } from "@/lib/payments/payment-sandbox-activation-token";
import { createPaymentSandboxApprovalCandidate } from "@/lib/payments/payment-sandbox-approval-candidate";
import { createPaymentSandboxApprovalIssuance } from "@/lib/payments/payment-sandbox-approval-issuance";
import { createPaymentSandboxApprovalReviewHandoff } from "@/lib/payments/payment-sandbox-approval-review-handoff";
import { createPaymentSandboxApprovalToken } from "@/lib/payments/payment-sandbox-approval-token";
import {
  auditPaymentSandboxExecutionLifecycleBindingIssuance,
  createPaymentSandboxExecutionLifecycleBindingIssuance,
} from "@/lib/payments/payment-sandbox-execution-lifecycle-binding-issuance";
import { createPaymentSandboxExecutionLifecycleBinding } from "@/lib/payments/payment-sandbox-execution-lifecycle-binding";
import { createPaymentSandboxProviderExecutionBoundary } from "@/lib/payments/payment-sandbox-provider-execution-boundary";
import { createPaymentSandboxProviderRequest } from "@/lib/payments/payment-sandbox-provider-request";
import { createPaymentSandboxProviderRequestIssuance } from "@/lib/payments/payment-sandbox-provider-request-issuance";
import { createPaymentSandboxProviderResponseReceipt } from "@/lib/payments/payment-sandbox-provider-response-receipt";
import { createPaymentSandboxProviderSubmissionGate } from "@/lib/payments/payment-sandbox-provider-submission-gate";
import { createPaymentSandboxReviewDecision } from "@/lib/payments/payment-sandbox-review-decision";
import { createPaymentSandboxReviewDecisionIssuance } from "@/lib/payments/payment-sandbox-review-decision-issuance";
import { createPaymentSandboxReviewerAssignment } from "@/lib/payments/payment-sandbox-reviewer-assignment";
import { createPaymentSandboxReviewerAttestation } from "@/lib/payments/payment-sandbox-reviewer-attestation";
import type {
  PaymentSandboxExecutionLifecycleBindingIssuanceStatus,
  PaymentSandboxExecutionLifecycleBindingIssuanceView,
} from "@/lib/payments/payment-sandbox-execution-lifecycle-binding-issuance.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentSandboxExecutionLifecycleBindingIssuanceView[] = [
  "binding",
  "lifecycle",
  "binding-envelope",
  "audit",
];

async function loadSandboxApprovalRequest(locale: string): Promise<unknown> {
  const approvalRequestModule =
    await import("@/lib/payments/payment-sandbox-approval-request");
  const factoryEntry = Object.entries(approvalRequestModule).find(
    ([name, value]) =>
      typeof value === "function" &&
      /^createPaymentSandboxApprovalRequest/u.test(name),
  );
  if (!factoryEntry) {
    throw new Error("F07A_3H_PAYMENT_SANDBOX_APPROVAL_REQUEST_FACTORY_MISSING");
  }
  const factory = factoryEntry[1] as (localeInput: unknown) => unknown;
  return factory(locale);
}

function Row({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <dt className="text-sm font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 font-bold break-all text-slate-900">{value}</dd>
    </div>
  );
}

export default async function PaymentSandboxExecutionLifecycleBindingIssuancePage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentSandboxExecutionLifecycleBindingIssuanceView(
    params.view,
  );
  const t = createPaymentSandboxExecutionLifecycleBindingIssuanceTranslator(
    shell.locale,
  );

  const upstreamRequest = await loadSandboxApprovalRequest(shell.locale);
  const upstreamHandoff =
    createPaymentSandboxApprovalReviewHandoff(upstreamRequest);
  const upstreamAssignment =
    createPaymentSandboxReviewerAssignment(upstreamHandoff);
  const upstreamAttestation = createPaymentSandboxReviewerAttestation(
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamDecision = createPaymentSandboxReviewDecision(
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamDecisionIssuance = createPaymentSandboxReviewDecisionIssuance(
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamApproval = createPaymentSandboxApprovalCandidate(
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamApprovalIssuance = createPaymentSandboxApprovalIssuance(
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamApprovalToken = createPaymentSandboxApprovalToken(
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamActivation = createPaymentSandboxActivationCandidate(
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamActivationToken = createPaymentSandboxActivationToken(
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamProviderRequest = createPaymentSandboxProviderRequest(
    upstreamActivationToken,
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamIssuance = createPaymentSandboxProviderRequestIssuance(
    upstreamProviderRequest,
    upstreamActivationToken,
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamGate = createPaymentSandboxProviderSubmissionGate(
    upstreamIssuance,
    upstreamProviderRequest,
    upstreamActivationToken,
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamBoundary =
    createPaymentSandboxProviderExecutionBoundary(upstreamGate);
  const upstreamReceipt =
    createPaymentSandboxProviderResponseReceipt(upstreamBoundary);
  const upstreamBinding =
    createPaymentSandboxExecutionLifecycleBinding(upstreamReceipt);
  const result =
    createPaymentSandboxExecutionLifecycleBindingIssuance(upstreamBinding);
  const audit = auditPaymentSandboxExecutionLifecycleBindingIssuance(
    result,
    upstreamBinding,
  );

  const yesNo = (value: boolean): string =>
    value ? t("common.yes") : t("common.no");
  const itemLabel = (key: (typeof result.items)[number]["key"]): string =>
    key === "request-identity"
      ? t("item.requestIdentity")
      : key === "verification-binding"
        ? t("item.verificationBinding")
        : key === "approval-prerequisites"
          ? t("item.approvalPrerequisites")
          : t("item.noExecutionGuardrails");
  const statusLabel = (
    status: PaymentSandboxExecutionLifecycleBindingIssuanceStatus,
  ): string =>
    status === "prepared-unbound"
      ? t("status.prepared")
      : status === "blocked-receipt-not-prepared"
        ? t("status.receiptNotPrepared")
        : status === "blocked-adapter-disabled"
          ? t("status.adapterDisabled")
          : t("status.adapterMissing");
  const tabLabel = (
    candidate: PaymentSandboxExecutionLifecycleBindingIssuanceView,
  ): string =>
    candidate === "binding"
      ? t("tabs.binding")
      : candidate === "lifecycle"
        ? t("tabs.lifecycle")
        : candidate === "binding-envelope"
          ? t("tabs.bindingEnvelope")
          : t("tabs.audit");

  const lifecycleRows: readonly [
    PaymentSandboxExecutionLifecycleBindingIssuanceMessageKey,
    boolean,
  ][] = [
    [
      "lifecycle.receiptContract",
      result.eligibility.providerResponseReceiptContractValid,
    ],
    ["lifecycle.environment", result.eligibility.environmentSandbox],
    [
      "lifecycle.normalizationPrepared",
      result.eligibility.normalizationPrepared,
    ],
    [
      "lifecycle.providerResponseAbsent",
      result.eligibility.providerResponseAbsent,
    ],
    [
      "lifecycle.responseReceiptAbsent",
      result.eligibility.responseReceiptAbsent,
    ],
    [
      "lifecycle.receiptNotPersisted",
      result.eligibility.responseReceiptNotPersisted,
    ],
    ["lifecycle.boundaryClosed", result.eligibility.boundaryClosed],
    [
      "lifecycle.executionNotAuthorized",
      result.eligibility.executionNotAuthorized,
    ],
    ["lifecycle.aliasOpaque", result.eligibility.reviewerAliasOpaque],
    ["lifecycle.itemSet", result.eligibility.requiredItemSetComplete],
    ["lifecycle.profilePrepared", result.eligibility.lifecycleProfilePrepared],
    ["lifecycle.guardrails", result.eligibility.noMutationGuardrailsIntact],
    ["lifecycle.result", result.eligibility.eligibleForPreviewBinding],
  ];

  const auditRows: readonly [
    PaymentSandboxExecutionLifecycleBindingIssuanceMessageKey,
    boolean,
  ][] = [
    ["audit.schema", audit.checks.schemaMatches],
    ["audit.environment", audit.checks.environmentSandbox],
    [
      "audit.receiptContract",
      audit.checks.providerResponseReceiptContractValid,
    ],
    ["audit.upstreamFingerprint", audit.checks.upstreamFingerprintMatches],
    [
      "audit.bindingCandidateId",
      audit.checks.executionLifecycleBindingIssuanceCandidateIdMatches,
    ],
    ["audit.itemSet", audit.checks.requiredItemSetMatches],
    ["audit.aliasOpaque", audit.checks.reviewerAliasOpaque],
    ["audit.noPii", audit.checks.reviewerPiiAbsent],
    ["audit.noCredential", audit.checks.reviewerCredentialAbsent],
    ["audit.normalizationPrepared", audit.checks.normalizationPrepared],
    ["audit.providerResponseAbsent", audit.checks.providerResponseAbsent],
    ["audit.responseReceiptAbsent", audit.checks.responseReceiptAbsent],
    ["audit.receiptNotPersisted", audit.checks.responseReceiptNotPersisted],
    ["audit.bindingPrepared", audit.checks.lifecycleBindingPrepared],
    ["audit.lifecycleNotBound", audit.checks.lifecycleNotBound],
    ["audit.bindingNotPersisted", audit.checks.bindingNotPersisted],
    ["audit.envelopeUnsigned", audit.checks.envelopeUnsigned],
    ["audit.noSecret", audit.checks.envelopeContainsNoSecret],
    ["audit.envelopeNoPii", audit.checks.envelopeContainsNoPii],
    ["audit.notSubmitted", audit.checks.envelopeNotSubmitted],
    ["audit.noSettlement", audit.checks.settlementArtifactAbsent],
    [
      "audit.noTransactionMutation",
      audit.checks.transactionStateMutationAbsent,
    ],
    ["audit.noRegistryMutation", audit.checks.registryMutationAbsent],
    ["audit.executionBlocked", audit.checks.productionAndExecutionBlocked],
  ];

  const route =
    "/ui-preview/payment-sandbox-execution-lifecycle-binding-issuance";

  return (
    <div lang={shell.htmlLang} dir={shell.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{ mode: "preview", previewPath: route }}
        homeHref={`${route}?locale=${shell.locale}&view=${view}`}
      >
        <article>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-sm font-bold tracking-[0.18em] text-emerald-300 uppercase">
                {t("preview.eyebrow")}
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black sm:text-5xl">
                {t("preview.title")}
              </h1>
              <p className="mt-5 max-w-3xl text-lg text-emerald-100">
                {t("preview.description")}
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <Row label={t("summary.provider")} value={result.providerKey} />
                <Row
                  label={t("summary.status")}
                  value={statusLabel(result.bindingStatus)}
                />
                <Row
                  label={t("summary.bindingCandidateId")}
                  value={result.executionLifecycleBindingIssuanceCandidateId}
                />
                <Row
                  label={t("summary.reviewerAlias")}
                  value={result.reviewerAlias}
                />
                <Row
                  label={t("summary.executionEligible")}
                  value={yesNo(result.executionEligible)}
                />
              </div>
              <p className="mt-6 text-sm font-semibold text-emerald-200">
                {t("preview.candidate")}
              </p>
              <p className="mt-2 text-sm text-emerald-100">
                {t("preview.safety")}
              </p>
            </div>
          </section>

          <section className="border-b border-slate-200 bg-white">
            <nav
              aria-label={t("labels.tabs")}
              className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8"
            >
              {VIEWS.map((candidate) => (
                <Link
                  key={candidate}
                  href={`${route}?locale=${shell.locale}&view=${candidate}`}
                  aria-current={candidate === view ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap ${
                    candidate === view
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tabLabel(candidate)}
                </Link>
              ))}
            </nav>
          </section>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {view === "binding" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("binding.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("binding.description")}
                  </p>
                  <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {result.items.map((item) => (
                      <section
                        key={item.key}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <h3 className="text-xl font-bold text-slate-950">
                          {itemLabel(item.key)}
                        </h3>
                        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                          <Row
                            label={t("field.receiptCandidateId")}
                            value={item.providerResponseReceiptCandidateId}
                          />
                          <Row
                            label={t("field.reviewerAlias")}
                            value={item.reviewerAlias ?? t("common.notCreated")}
                          />
                          <Row
                            label={t("field.bindingPrepared")}
                            value={yesNo(item.lifecycleBindingPrepared)}
                          />
                          <Row
                            label={t("field.lifecycleBound")}
                            value={yesNo(item.lifecycleBound)}
                          />
                          <Row
                            label={t("field.bindingPersisted")}
                            value={yesNo(item.bindingPersisted)}
                          />
                          <Row
                            label={t("field.transactionMutation")}
                            value={yesNo(item.transactionStateMutationCreated)}
                          />
                        </dl>
                      </section>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled
                    className="mt-8 cursor-not-allowed rounded-full bg-slate-300 px-6 py-3 font-bold text-slate-600"
                  >
                    {t("action.disabled")}
                  </button>
                </div>
              ) : null}

              {view === "lifecycle" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("lifecycle.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("lifecycle.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2">
                    {lifecycleRows.map(([key, value]) => (
                      <Row key={key} label={t(key)} value={yesNo(value)} />
                    ))}
                  </dl>
                </div>
              ) : null}

              {view === "binding-envelope" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("envelope.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("envelope.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2">
                    <Row
                      label={t("envelope.mediaType")}
                      value={result.bindingEnvelope.mediaType}
                    />
                    <Row
                      label={t("envelope.signed")}
                      value={yesNo(result.bindingEnvelope.signed)}
                    />
                    <Row
                      label={t("envelope.containsSecret")}
                      value={yesNo(result.bindingEnvelope.containsSecret)}
                    />
                    <Row
                      label={t("envelope.containsPii")}
                      value={yesNo(result.bindingEnvelope.containsPii)}
                    />
                    <Row
                      label={t("envelope.submitted")}
                      value={yesNo(result.bindingEnvelope.submitted)}
                    />
                    <Row
                      label={t("envelope.persisted")}
                      value={yesNo(result.bindingEnvelope.persisted)}
                    />
                  </dl>
                  <h3 className="mt-8 text-xl font-bold text-slate-950">
                    {t("envelope.body")}
                  </h3>
                  <pre className="mt-4 overflow-x-auto rounded-3xl bg-slate-950 p-6 text-sm text-emerald-100">
                    {JSON.stringify(result.bindingEnvelope.body, null, 2)}
                  </pre>
                </div>
              ) : null}

              {view === "audit" ? (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-950">
                        {t("audit.title")}
                      </h2>
                      <p className="mt-3 max-w-3xl text-slate-600">
                        {t("audit.description")}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
                      {audit.status === "matched"
                        ? t("audit.matched")
                        : t("audit.mismatched")}
                    </span>
                  </div>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2">
                    {auditRows.map(([key, value]) => (
                      <Row key={key} label={t(key)} value={yesNo(value)} />
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>
          </section>
        </article>
      </PageShell>
    </div>
  );
}
