// F07A-3W_PAYMENT_SANDBOX_PROVIDER_RESPONSE_RECEIPT_R1

import Link from "next/link";
import { PageShell } from "@/components/layout";
import {
  createPaymentSandboxProviderResponseReceiptTranslator,
  normalizePaymentSandboxProviderResponseReceiptView,
} from "@/i18n/payment-sandbox-provider-response-receipt/payment-sandbox-provider-response-receipt.registry";
import type { PaymentSandboxProviderResponseReceiptMessageKey } from "@/i18n/payment-sandbox-provider-response-receipt/payment-sandbox-provider-response-receipt.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { createPaymentSandboxActivationCandidate } from "@/lib/payments/payment-sandbox-activation-candidate";
import { createPaymentSandboxActivationToken } from "@/lib/payments/payment-sandbox-activation-token";
import { createPaymentSandboxApprovalCandidate } from "@/lib/payments/payment-sandbox-approval-candidate";
import { createPaymentSandboxApprovalIssuance } from "@/lib/payments/payment-sandbox-approval-issuance";
import { createPaymentSandboxApprovalReviewHandoff } from "@/lib/payments/payment-sandbox-approval-review-handoff";
import { createPaymentSandboxApprovalToken } from "@/lib/payments/payment-sandbox-approval-token";
import { createPaymentSandboxProviderExecutionBoundary } from "@/lib/payments/payment-sandbox-provider-execution-boundary";
import { createPaymentSandboxProviderRequest } from "@/lib/payments/payment-sandbox-provider-request";
import { createPaymentSandboxProviderRequestIssuance } from "@/lib/payments/payment-sandbox-provider-request-issuance";
import {
  auditPaymentSandboxProviderResponseReceipt,
  createPaymentSandboxProviderResponseReceipt,
} from "@/lib/payments/payment-sandbox-provider-response-receipt";
import { createPaymentSandboxProviderSubmissionGate } from "@/lib/payments/payment-sandbox-provider-submission-gate";
import { createPaymentSandboxReviewDecision } from "@/lib/payments/payment-sandbox-review-decision";
import { createPaymentSandboxReviewDecisionIssuance } from "@/lib/payments/payment-sandbox-review-decision-issuance";
import { createPaymentSandboxReviewerAssignment } from "@/lib/payments/payment-sandbox-reviewer-assignment";
import { createPaymentSandboxReviewerAttestation } from "@/lib/payments/payment-sandbox-reviewer-attestation";
import type {
  PaymentSandboxProviderResponseReceiptStatus,
  PaymentSandboxProviderResponseReceiptView,
} from "@/lib/payments/payment-sandbox-provider-response-receipt.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}
const VIEWS: readonly PaymentSandboxProviderResponseReceiptView[] = [
  "receipt",
  "normalization",
  "receipt-envelope",
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
  if (!factoryEntry)
    throw new Error("F07A_3H_PAYMENT_SANDBOX_APPROVAL_REQUEST_FACTORY_MISSING");
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

export default async function PaymentSandboxProviderResponseReceiptPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentSandboxProviderResponseReceiptView(params.view);
  const t = createPaymentSandboxProviderResponseReceiptTranslator(shell.locale);
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
  const result = createPaymentSandboxProviderResponseReceipt(upstreamBoundary);
  const audit = auditPaymentSandboxProviderResponseReceipt(
    result,
    upstreamBoundary,
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
    status: PaymentSandboxProviderResponseReceiptStatus,
  ): string =>
    status === "prepared-no-response"
      ? t("status.prepared")
      : status === "blocked-boundary-not-prepared"
        ? t("status.boundaryNotPrepared")
        : status === "blocked-adapter-disabled"
          ? t("status.adapterDisabled")
          : t("status.adapterMissing");
  const tabLabel = (
    candidate: PaymentSandboxProviderResponseReceiptView,
  ): string =>
    candidate === "receipt"
      ? t("tabs.receipt")
      : candidate === "normalization"
        ? t("tabs.normalization")
        : candidate === "receipt-envelope"
          ? t("tabs.receiptEnvelope")
          : t("tabs.audit");
  const normalizationRows = [
    [
      "normalization.boundaryContract",
      result.eligibility.providerExecutionBoundaryContractValid,
    ],
    ["normalization.environment", result.eligibility.environmentSandbox],
    ["normalization.boundaryPrepared", result.eligibility.boundaryPrepared],
    ["normalization.boundaryClosed", result.eligibility.boundaryClosed],
    [
      "normalization.executionNotAuthorized",
      result.eligibility.executionNotAuthorized,
    ],
    [
      "normalization.credentialNotResolved",
      result.eligibility.credentialResolutionNotAttempted,
    ],
    [
      "normalization.providerCallNotAttempted",
      result.eligibility.providerCallNotAttempted,
    ],
    [
      "normalization.providerResponseAbsent",
      result.eligibility.providerResponseAbsent,
    ],
    ["normalization.aliasOpaque", result.eligibility.reviewerAliasOpaque],
    ["normalization.itemSet", result.eligibility.requiredItemSetComplete],
    [
      "normalization.profilePrepared",
      result.eligibility.normalizationProfilePrepared,
    ],
    [
      "normalization.guardrails",
      result.eligibility.noExecutionGuardrailsIntact,
    ],
    ["normalization.result", result.eligibility.eligibleForPreviewReceipt],
  ] as const satisfies readonly (readonly [
    PaymentSandboxProviderResponseReceiptMessageKey,
    boolean,
  ])[];
  const auditRows = [
    ["audit.schema", audit.checks.schemaMatches],
    ["audit.environment", audit.checks.environmentSandbox],
    [
      "audit.boundaryContract",
      audit.checks.providerExecutionBoundaryContractValid,
    ],
    ["audit.upstreamFingerprint", audit.checks.upstreamFingerprintMatches],
    [
      "audit.receiptCandidateId",
      audit.checks.providerResponseReceiptCandidateIdMatches,
    ],
    ["audit.itemSet", audit.checks.requiredItemSetMatches],
    ["audit.aliasOpaque", audit.checks.reviewerAliasOpaque],
    ["audit.noPii", audit.checks.reviewerPiiAbsent],
    ["audit.noCredential", audit.checks.reviewerCredentialAbsent],
    ["audit.boundaryClosed", audit.checks.boundaryClosed],
    ["audit.executionNotAuthorized", audit.checks.executionNotAuthorized],
    [
      "audit.credentialNotResolved",
      audit.checks.credentialResolutionNotAttempted,
    ],
    ["audit.providerCallNotAttempted", audit.checks.providerCallNotAttempted],
    ["audit.providerResponseAbsent", audit.checks.providerResponseAbsent],
    ["audit.responseNotNormalized", audit.checks.providerResponseNotNormalized],
    ["audit.receiptNotCreated", audit.checks.responseReceiptNotCreated],
    ["audit.receiptNotPersisted", audit.checks.responseReceiptNotPersisted],
    ["audit.providerFieldsAbsent", audit.checks.providerFieldsAbsent],
    ["audit.envelopeUnsigned", audit.checks.envelopeUnsigned],
    ["audit.noSecret", audit.checks.envelopeContainsNoSecret],
    ["audit.envelopeNoPii", audit.checks.envelopeContainsNoPii],
    ["audit.notSubmitted", audit.checks.envelopeNotSubmitted],
    ["audit.noSettlement", audit.checks.settlementArtifactAbsent],
    ["audit.noRegistryMutation", audit.checks.registryMutationAbsent],
    ["audit.executionBlocked", audit.checks.productionAndExecutionBlocked],
  ] as const satisfies readonly (readonly [
    PaymentSandboxProviderResponseReceiptMessageKey,
    boolean,
  ])[];
  const route = "/ui-preview/payment-sandbox-provider-response-receipt";
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
        <article aria-label={t("labels.preview")}>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  {t("preview.eyebrow")}
                </p>
                <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
                  {t("preview.title")}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-emerald-50">
                  {t("preview.description")}
                </p>
                <p className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6">
                  {t("preview.candidate")}
                </p>
              </div>
              <aside className="rounded-3xl border border-white/20 bg-white/10 p-6">
                <dl className="grid gap-3 text-sm">
                  <Row
                    label={t("summary.provider")}
                    value={result.providerKey}
                  />
                  <Row
                    label={t("summary.status")}
                    value={statusLabel(result.receiptStatus)}
                  />
                  <Row
                    label={t("summary.receiptCandidateId")}
                    value={result.providerResponseReceiptCandidateId}
                  />
                  <Row
                    label={t("summary.reviewerAlias")}
                    value={result.reviewerAlias}
                  />
                  <Row
                    label={t("summary.executionEligible")}
                    value={yesNo(result.executionEligible)}
                  />
                </dl>
                <p className="mt-5 text-sm leading-6 text-emerald-50">
                  {t("preview.safety")}
                </p>
                <nav
                  aria-label={t("labels.localeNavigation")}
                  className="mt-6 flex gap-2"
                >
                  {(["vi", "en", "lo"] as const).map((locale) => (
                    <Link
                      key={locale}
                      href={`${route}?locale=${locale}&view=${view}`}
                      aria-current={
                        locale === shell.locale ? "page" : undefined
                      }
                      className="rounded-full border border-white/30 px-3 py-2 text-xs font-bold"
                    >
                      {locale.toUpperCase()}
                    </Link>
                  ))}
                </nav>
              </aside>
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
                  className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap ${candidate === view ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  {tabLabel(candidate)}
                </Link>
              ))}
            </nav>
          </section>
          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {view === "receipt" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("receipt.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("receipt.description")}
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
                            label={t("field.boundaryCandidateId")}
                            value={item.providerExecutionBoundaryCandidateId}
                          />
                          <Row
                            label={t("field.reviewerAlias")}
                            value={item.reviewerAlias ?? t("common.notCreated")}
                          />
                          <Row
                            label={t("field.normalizationPrepared")}
                            value={yesNo(item.normalizationPrepared)}
                          />
                          <Row
                            label={t("field.providerResponseReceived")}
                            value={yesNo(item.providerResponseReceived)}
                          />
                          <Row
                            label={t("field.providerResponseNormalized")}
                            value={yesNo(item.providerResponseNormalized)}
                          />
                          <Row
                            label={t("field.responseReceiptCreated")}
                            value={yesNo(item.responseReceiptCreated)}
                          />
                          <Row
                            label={t("field.responseReceiptPersisted")}
                            value={yesNo(item.responseReceiptPersisted)}
                          />
                          <Row
                            label={t("field.providerReference")}
                            value={
                              item.providerReference ?? t("common.notCreated")
                            }
                          />
                          <Row
                            label={t("field.providerStatus")}
                            value={
                              item.providerStatus ?? t("common.notCreated")
                            }
                          />
                          <Row
                            label={t("field.providerCode")}
                            value={item.providerCode ?? t("common.notCreated")}
                          />
                          <Row
                            label={t("field.receivedAt")}
                            value={item.receivedAt ?? t("common.notCreated")}
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
              {view === "normalization" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("normalization.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("normalization.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2">
                    {normalizationRows.map(([key, value]) => (
                      <Row key={key} label={t(key)} value={yesNo(value)} />
                    ))}
                  </dl>
                </div>
              ) : null}
              {view === "receipt-envelope" ? (
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
                      value={result.receiptEnvelope.mediaType}
                    />
                    <Row
                      label={t("envelope.signed")}
                      value={yesNo(result.receiptEnvelope.signed)}
                    />
                    <Row
                      label={t("envelope.containsSecret")}
                      value={yesNo(result.receiptEnvelope.containsSecret)}
                    />
                    <Row
                      label={t("envelope.containsPii")}
                      value={yesNo(result.receiptEnvelope.containsPii)}
                    />
                    <Row
                      label={t("envelope.submitted")}
                      value={yesNo(result.receiptEnvelope.submitted)}
                    />
                    <Row
                      label={t("envelope.persisted")}
                      value={yesNo(result.receiptEnvelope.persisted)}
                    />
                  </dl>
                  <h3 className="mt-8 text-xl font-bold text-slate-950">
                    {t("envelope.body")}
                  </h3>
                  <pre className="mt-4 overflow-x-auto rounded-3xl bg-slate-950 p-6 text-sm text-emerald-100">
                    {JSON.stringify(result.receiptEnvelope.body, null, 2)}
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
