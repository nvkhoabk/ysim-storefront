// F07A-3N_PAYMENT_SANDBOX_APPROVAL_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createPaymentSandboxApprovalCandidateTranslator,
  normalizePaymentSandboxApprovalCandidateView,
} from "@/i18n/payment-sandbox-approval-candidate/payment-sandbox-approval-candidate.registry";
import type { PaymentSandboxApprovalCandidateMessageKey } from "@/i18n/payment-sandbox-approval-candidate/payment-sandbox-approval-candidate.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  createPaymentSandboxApprovalCandidate,
  auditPaymentSandboxApprovalCandidate,
} from "@/lib/payments/payment-sandbox-approval-candidate";
import { createPaymentSandboxApprovalReviewHandoff } from "@/lib/payments/payment-sandbox-approval-review-handoff";
import { createPaymentSandboxReviewDecision } from "@/lib/payments/payment-sandbox-review-decision";
import { createPaymentSandboxReviewDecisionIssuance } from "@/lib/payments/payment-sandbox-review-decision-issuance";
import { createPaymentSandboxReviewerAssignment } from "@/lib/payments/payment-sandbox-reviewer-assignment";
import { createPaymentSandboxReviewerAttestation } from "@/lib/payments/payment-sandbox-reviewer-attestation";
import type {
  PaymentSandboxApprovalCandidateStatus,
  PaymentSandboxApprovalCandidateView,
} from "@/lib/payments/payment-sandbox-approval-candidate.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentSandboxApprovalCandidateView[] = [
  "approval",
  "eligibility",
  "approval-envelope",
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

export default async function PaymentSandboxApprovalCandidatePage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentSandboxApprovalCandidateView(params.view);
  const t = createPaymentSandboxApprovalCandidateTranslator(shell.locale);

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
  const upstreamIssuance = createPaymentSandboxReviewDecisionIssuance(
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const result = createPaymentSandboxApprovalCandidate(
    upstreamIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const audit = auditPaymentSandboxApprovalCandidate(
    result,
    upstreamIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const yesNo = (value: boolean): string =>
    value ? t("common.yes") : t("common.no");

  const itemLabel = (key: (typeof result.items)[number]["key"]): string => {
    if (key === "request-identity") return t("item.requestIdentity");
    if (key === "verification-binding") return t("item.verificationBinding");
    if (key === "approval-prerequisites") {
      return t("item.approvalPrerequisites");
    }
    return t("item.noExecutionGuardrails");
  };

  const statusLabel = (
    status: PaymentSandboxApprovalCandidateStatus,
  ): string => {
    if (status === "prepared-not-created") return t("status.prepared");
    if (status === "blocked-issuance-not-prepared") {
      return t("status.issuanceNotPrepared");
    }
    if (status === "blocked-adapter-disabled") {
      return t("status.adapterDisabled");
    }
    return t("status.adapterMissing");
  };

  const tabLabel = (candidate: PaymentSandboxApprovalCandidateView): string => {
    if (candidate === "approval") return t("tabs.approval");
    if (candidate === "eligibility") return t("tabs.eligibility");
    if (candidate === "approval-envelope") {
      return t("tabs.approvalEnvelope");
    }
    return t("tabs.audit");
  };

  const eligibilityRows = [
    ["eligibility.issuanceAudit", result.eligibility.issuanceAuditMatched],
    ["eligibility.environment", result.eligibility.environmentSandbox],
    ["eligibility.issuancePrepared", result.eligibility.issuancePrepared],
    ["eligibility.issuanceUnsigned", result.eligibility.issuanceUnsigned],
    [
      "eligibility.issuanceNotSubmitted",
      result.eligibility.issuanceNotSubmitted,
    ],
    [
      "eligibility.issuanceNotPersisted",
      result.eligibility.issuanceNotPersisted,
    ],
    ["eligibility.decisionNotIssued", result.eligibility.decisionNotIssued],
    [
      "eligibility.decisionNotPersisted",
      result.eligibility.decisionNotPersisted,
    ],
    ["eligibility.aliasOpaque", result.eligibility.reviewerAliasOpaque],
    ["eligibility.itemSet", result.eligibility.requiredItemSetComplete],
    ["eligibility.guardrails", result.eligibility.noExecutionGuardrailsIntact],
    ["eligibility.result", result.eligibility.eligibleForPreviewApproval],
  ] as const satisfies readonly (readonly [
    PaymentSandboxApprovalCandidateMessageKey,
    boolean,
  ])[];

  const auditRows = [
    ["audit.schema", audit.checks.schemaMatches],
    ["audit.environment", audit.checks.environmentSandbox],
    ["audit.issuanceAudit", audit.checks.issuanceAuditMatched],
    ["audit.upstreamFingerprint", audit.checks.upstreamFingerprintMatches],
    ["audit.approvalCandidateId", audit.checks.approvalCandidateIdMatches],
    ["audit.itemSet", audit.checks.requiredItemSetMatches],
    ["audit.aliasOpaque", audit.checks.reviewerAliasOpaque],
    ["audit.noPii", audit.checks.reviewerPiiAbsent],
    ["audit.noCredential", audit.checks.reviewerCredentialAbsent],
    ["audit.issuanceUnsigned", audit.checks.issuanceUnsigned],
    ["audit.issuanceNotSubmitted", audit.checks.issuanceNotSubmitted],
    ["audit.issuanceNotPersisted", audit.checks.issuanceNotPersisted],
    ["audit.decisionNotIssued", audit.checks.decisionNotIssued],
    ["audit.decisionNotPersisted", audit.checks.decisionNotPersisted],
    ["audit.approvalNotCreated", audit.checks.approvalNotCreated],
    ["audit.approvalNotPersisted", audit.checks.approvalNotPersisted],
    ["audit.envelopeUnsigned", audit.checks.envelopeUnsigned],
    ["audit.noSecret", audit.checks.envelopeContainsNoSecret],
    ["audit.envelopeNoPii", audit.checks.envelopeContainsNoPii],
    ["audit.notSubmitted", audit.checks.envelopeNotSubmitted],
    ["audit.noActivation", audit.checks.activationArtifactAbsent],
    [
      "audit.noProviderSettlement",
      audit.checks.providerAndSettlementArtifactsAbsent,
    ],
    ["audit.noRegistryMutation", audit.checks.registryMutationAbsent],
    ["audit.executionBlocked", audit.checks.productionAndExecutionBlocked],
  ] as const satisfies readonly (readonly [
    PaymentSandboxApprovalCandidateMessageKey,
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
          previewPath: "/ui-preview/payment-sandbox-approval-candidate",
        }}
        homeHref={`/ui-preview/payment-sandbox-approval-candidate?locale=${shell.locale}&view=${view}`}
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
                    value={statusLabel(result.approvalStatus)}
                  />
                  <Row
                    label={t("summary.approvalCandidateId")}
                    value={result.approvalCandidateId}
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
                      href={`/ui-preview/payment-sandbox-approval-candidate?locale=${locale}&view=${view}`}
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
                  href={`/ui-preview/payment-sandbox-approval-candidate?locale=${shell.locale}&view=${candidate}`}
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
              {view === "approval" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("approval.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("approval.description")}
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
                            label={t("field.reviewerAlias")}
                            value={item.reviewerAlias ?? t("common.notCreated")}
                          />
                          <Row
                            label={t("field.issuanceId")}
                            value={item.issuanceId}
                          />
                          <Row
                            label={t("field.approvalPrepared")}
                            value={yesNo(item.approvalPrepared)}
                          />
                          <Row
                            label={t("field.approvalCreated")}
                            value={yesNo(item.approvalCreated)}
                          />
                          <Row
                            label={t("field.approvalPersisted")}
                            value={yesNo(item.approvalPersisted)}
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
                    {eligibilityRows.map(([key, value]) => (
                      <Row key={key} label={t(key)} value={yesNo(value)} />
                    ))}
                  </dl>
                </div>
              ) : null}

              {view === "approval-envelope" ? (
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
                      value={result.approvalEnvelope.mediaType}
                    />
                    <Row
                      label={t("envelope.signed")}
                      value={yesNo(result.approvalEnvelope.signed)}
                    />
                    <Row
                      label={t("envelope.containsSecret")}
                      value={yesNo(result.approvalEnvelope.containsSecret)}
                    />
                    <Row
                      label={t("envelope.containsPii")}
                      value={yesNo(result.approvalEnvelope.containsPii)}
                    />
                    <Row
                      label={t("envelope.submitted")}
                      value={yesNo(result.approvalEnvelope.submitted)}
                    />
                    <Row
                      label={t("envelope.persisted")}
                      value={yesNo(result.approvalEnvelope.persisted)}
                    />
                  </dl>
                  <h3 className="mt-8 text-xl font-bold text-slate-950">
                    {t("envelope.body")}
                  </h3>
                  <pre className="mt-4 overflow-x-auto rounded-3xl bg-slate-950 p-6 text-sm text-emerald-100">
                    {JSON.stringify(result.approvalEnvelope.body, null, 2)}
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
