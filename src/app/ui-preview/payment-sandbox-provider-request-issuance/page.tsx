// F07A-3T_PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_R1

import Link from "next/link";
import { PageShell } from "@/components/layout";
import {
  createPaymentSandboxProviderRequestIssuanceTranslator,
  normalizePaymentSandboxProviderRequestIssuanceView,
} from "@/i18n/payment-sandbox-provider-request-issuance/payment-sandbox-provider-request-issuance.registry";
import type { PaymentSandboxProviderRequestIssuanceMessageKey } from "@/i18n/payment-sandbox-provider-request-issuance/payment-sandbox-provider-request-issuance.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { createPaymentSandboxActivationCandidate } from "@/lib/payments/payment-sandbox-activation-candidate";
import { createPaymentSandboxActivationToken } from "@/lib/payments/payment-sandbox-activation-token";
import { createPaymentSandboxApprovalCandidate } from "@/lib/payments/payment-sandbox-approval-candidate";
import { createPaymentSandboxApprovalIssuance } from "@/lib/payments/payment-sandbox-approval-issuance";
import { createPaymentSandboxApprovalReviewHandoff } from "@/lib/payments/payment-sandbox-approval-review-handoff";
import { createPaymentSandboxApprovalToken } from "@/lib/payments/payment-sandbox-approval-token";
import { createPaymentSandboxProviderRequest } from "@/lib/payments/payment-sandbox-provider-request";
import {
  auditPaymentSandboxProviderRequestIssuance,
  createPaymentSandboxProviderRequestIssuance,
} from "@/lib/payments/payment-sandbox-provider-request-issuance";
import { createPaymentSandboxReviewDecision } from "@/lib/payments/payment-sandbox-review-decision";
import { createPaymentSandboxReviewDecisionIssuance } from "@/lib/payments/payment-sandbox-review-decision-issuance";
import { createPaymentSandboxReviewerAssignment } from "@/lib/payments/payment-sandbox-reviewer-assignment";
import { createPaymentSandboxReviewerAttestation } from "@/lib/payments/payment-sandbox-reviewer-attestation";
import type {
  PaymentSandboxProviderRequestIssuanceStatus,
  PaymentSandboxProviderRequestIssuanceView,
} from "@/lib/payments/payment-sandbox-provider-request-issuance.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}
const VIEWS: readonly PaymentSandboxProviderRequestIssuanceView[] = [
  "issuance",
  "eligibility",
  "issuance-envelope",
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

export default async function PaymentSandboxProviderRequestIssuancePage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentSandboxProviderRequestIssuanceView(params.view);
  const t = createPaymentSandboxProviderRequestIssuanceTranslator(shell.locale);
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
  const result = createPaymentSandboxProviderRequestIssuance(
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
  const audit = auditPaymentSandboxProviderRequestIssuance(
    result,
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
    status: PaymentSandboxProviderRequestIssuanceStatus,
  ): string =>
    status === "prepared-not-issued"
      ? t("status.prepared")
      : status === "blocked-provider-request-not-prepared"
        ? t("status.providerRequestNotPrepared")
        : status === "blocked-adapter-disabled"
          ? t("status.adapterDisabled")
          : t("status.adapterMissing");
  const tabLabel = (
    candidate: PaymentSandboxProviderRequestIssuanceView,
  ): string =>
    candidate === "issuance"
      ? t("tabs.issuance")
      : candidate === "eligibility"
        ? t("tabs.eligibility")
        : candidate === "issuance-envelope"
          ? t("tabs.issuanceEnvelope")
          : t("tabs.audit");
  const eligibilityRows = [
    [
      "eligibility.providerRequestAudit",
      result.eligibility.providerRequestAuditMatched,
    ],
    ["eligibility.environment", result.eligibility.environmentSandbox],
    [
      "eligibility.providerRequestPrepared",
      result.eligibility.providerRequestPrepared,
    ],
    [
      "eligibility.providerRequestNotCreated",
      result.eligibility.providerRequestNotCreated,
    ],
    [
      "eligibility.providerRequestNotSubmitted",
      result.eligibility.providerRequestNotSubmitted,
    ],
    [
      "eligibility.providerRequestNotPersisted",
      result.eligibility.providerRequestNotPersisted,
    ],
    [
      "eligibility.activationTokenNotCreated",
      result.eligibility.activationTokenNotCreated,
    ],
    [
      "eligibility.activationTokenUnsigned",
      result.eligibility.activationTokenUnsigned,
    ],
    [
      "eligibility.activationTokenNotPersisted",
      result.eligibility.activationTokenNotPersisted,
    ],
    ["eligibility.aliasOpaque", result.eligibility.reviewerAliasOpaque],
    ["eligibility.itemSet", result.eligibility.requiredItemSetComplete],
    ["eligibility.guardrails", result.eligibility.noExecutionGuardrailsIntact],
    ["eligibility.result", result.eligibility.eligibleForPreviewIssuance],
  ] as const satisfies readonly (readonly [
    PaymentSandboxProviderRequestIssuanceMessageKey,
    boolean,
  ])[];
  const auditRows = [
    ["audit.schema", audit.checks.schemaMatches],
    ["audit.environment", audit.checks.environmentSandbox],
    ["audit.providerRequestAudit", audit.checks.providerRequestAuditMatched],
    ["audit.upstreamFingerprint", audit.checks.upstreamFingerprintMatches],
    [
      "audit.issuanceCandidateId",
      audit.checks.providerRequestIssuanceCandidateIdMatches,
    ],
    ["audit.itemSet", audit.checks.requiredItemSetMatches],
    ["audit.aliasOpaque", audit.checks.reviewerAliasOpaque],
    ["audit.noPii", audit.checks.reviewerPiiAbsent],
    ["audit.noCredential", audit.checks.reviewerCredentialAbsent],
    ["audit.providerRequestNotCreated", audit.checks.providerRequestNotCreated],
    [
      "audit.providerRequestNotSubmitted",
      audit.checks.providerRequestNotSubmitted,
    ],
    [
      "audit.providerRequestNotPersisted",
      audit.checks.providerRequestNotPersisted,
    ],
    ["audit.issuanceNotIssued", audit.checks.issuanceNotIssued],
    ["audit.issuanceUnsigned", audit.checks.issuanceUnsigned],
    ["audit.issuanceNotSubmitted", audit.checks.issuanceNotSubmitted],
    ["audit.issuanceNotPersisted", audit.checks.issuanceNotPersisted],
    ["audit.envelopeUnsigned", audit.checks.envelopeUnsigned],
    ["audit.noSecret", audit.checks.envelopeContainsNoSecret],
    ["audit.envelopeNoPii", audit.checks.envelopeContainsNoPii],
    ["audit.notSubmitted", audit.checks.envelopeNotSubmitted],
    ["audit.noSettlement", audit.checks.settlementArtifactAbsent],
    ["audit.noRegistryMutation", audit.checks.registryMutationAbsent],
    ["audit.executionBlocked", audit.checks.productionAndExecutionBlocked],
  ] as const satisfies readonly (readonly [
    PaymentSandboxProviderRequestIssuanceMessageKey,
    boolean,
  ])[];

  return (
    <div lang={shell.htmlLang} dir={shell.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/payment-sandbox-provider-request-issuance",
        }}
        homeHref={`/ui-preview/payment-sandbox-provider-request-issuance?locale=${shell.locale}&view=${view}`}
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
                    value={statusLabel(result.issuanceStatus)}
                  />
                  <Row
                    label={t("summary.issuanceCandidateId")}
                    value={result.providerRequestIssuanceCandidateId}
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
                      href={`/ui-preview/payment-sandbox-provider-request-issuance?locale=${locale}&view=${view}`}
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
                  href={`/ui-preview/payment-sandbox-provider-request-issuance?locale=${shell.locale}&view=${candidate}`}
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
              {view === "issuance" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("issuance.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("issuance.description")}
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
                            label={t("field.providerRequestCandidateId")}
                            value={item.providerRequestCandidateId}
                          />
                          <Row
                            label={t("field.reviewerAlias")}
                            value={item.reviewerAlias ?? t("common.notCreated")}
                          />
                          <Row
                            label={t("field.issuancePrepared")}
                            value={yesNo(item.issuancePrepared)}
                          />
                          <Row
                            label={t("field.issuanceIssued")}
                            value={yesNo(item.issuanceIssued)}
                          />
                          <Row
                            label={t("field.issuanceSigned")}
                            value={yesNo(item.issuanceSigned)}
                          />
                          <Row
                            label={t("field.issuanceSubmitted")}
                            value={yesNo(item.issuanceSubmitted)}
                          />
                          <Row
                            label={t("field.issuancePersisted")}
                            value={yesNo(item.issuancePersisted)}
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
              {view === "eligibility" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("eligibility.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("eligibility.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2">
                    {eligibilityRows.map(([k, v]) => (
                      <Row key={k} label={t(k)} value={yesNo(v)} />
                    ))}
                  </dl>
                </div>
              ) : null}
              {view === "issuance-envelope" ? (
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
                      value={result.issuanceEnvelope.mediaType}
                    />
                    <Row
                      label={t("envelope.signed")}
                      value={yesNo(result.issuanceEnvelope.signed)}
                    />
                    <Row
                      label={t("envelope.containsSecret")}
                      value={yesNo(result.issuanceEnvelope.containsSecret)}
                    />
                    <Row
                      label={t("envelope.containsPii")}
                      value={yesNo(result.issuanceEnvelope.containsPii)}
                    />
                    <Row
                      label={t("envelope.submitted")}
                      value={yesNo(result.issuanceEnvelope.submitted)}
                    />
                    <Row
                      label={t("envelope.persisted")}
                      value={yesNo(result.issuanceEnvelope.persisted)}
                    />
                  </dl>
                  <h3 className="mt-8 text-xl font-bold text-slate-950">
                    {t("envelope.body")}
                  </h3>
                  <pre className="mt-4 overflow-x-auto rounded-3xl bg-slate-950 p-6 text-sm text-emerald-100">
                    {JSON.stringify(result.issuanceEnvelope.body, null, 2)}
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
                    {auditRows.map(([k, v]) => (
                      <Row key={k} label={t(k)} value={yesNo(v)} />
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
