// F07A-3J_PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createPaymentSandboxReviewerAssignmentTranslator,
  normalizePaymentSandboxReviewerAssignmentView,
} from "@/i18n/payment-sandbox-reviewer-assignment/payment-sandbox-reviewer-assignment.registry";
import type { PaymentSandboxReviewerAssignmentMessageKey } from "@/i18n/payment-sandbox-reviewer-assignment/payment-sandbox-reviewer-assignment.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { createPaymentSandboxApprovalReviewHandoff } from "@/lib/payments/payment-sandbox-approval-review-handoff";
import {
  auditPaymentSandboxReviewerAssignment,
  createPaymentSandboxReviewerAssignment,
} from "@/lib/payments/payment-sandbox-reviewer-assignment";
import type {
  PaymentSandboxReviewerAssignmentItemStatus,
  PaymentSandboxReviewerAssignmentView,
} from "@/lib/payments/payment-sandbox-reviewer-assignment.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentSandboxReviewerAssignmentView[] = [
  "assignment",
  "eligibility",
  "assignment-envelope",
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
  readonly key?: string;
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

export default async function PaymentSandboxReviewerAssignmentPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentSandboxReviewerAssignmentView(params.view);
  const t = createPaymentSandboxReviewerAssignmentTranslator(shell.locale);
  const upstreamRequest = await loadSandboxApprovalRequest(shell.locale);
  const upstreamHandoff =
    createPaymentSandboxApprovalReviewHandoff(upstreamRequest);
  const result = createPaymentSandboxReviewerAssignment(upstreamHandoff);
  const audit = auditPaymentSandboxReviewerAssignment(result, upstreamHandoff);

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
    status: PaymentSandboxReviewerAssignmentItemStatus,
  ): string => {
    if (status === "assigned-preview-only") return t("status.prepared");
    if (status === "blocked-adapter-disabled") {
      return t("status.adapterDisabled");
    }
    return t("status.adapterMissing");
  };
  const tabLabel = (
    candidate: PaymentSandboxReviewerAssignmentView,
  ): string => {
    if (candidate === "assignment") return t("tabs.assignment");
    if (candidate === "eligibility") return t("tabs.eligibility");
    if (candidate === "assignment-envelope") {
      return t("tabs.assignmentEnvelope");
    }
    return t("tabs.audit");
  };

  const eligibilityRows = [
    ["eligibility.upstreamAudit", result.eligibility.upstreamAuditMatched],
    ["eligibility.environment", result.eligibility.environmentSandbox],
    ["eligibility.adapter", result.eligibility.adapterEligible],
    ["eligibility.handoff", result.eligibility.handoffPendingManualReview],
    ["eligibility.itemSet", result.eligibility.requiredItemSetComplete],
    ["eligibility.guardrails", result.eligibility.noExecutionGuardrailsIntact],
    ["eligibility.result", result.eligibility.eligibleForPreviewAssignment],
  ] as const satisfies readonly (readonly [
    PaymentSandboxReviewerAssignmentMessageKey,
    boolean,
  ])[];

  const auditRows = [
    ["audit.schema", audit.checks.schemaMatches],
    ["audit.environment", audit.checks.environmentSandbox],
    ["audit.upstreamAudit", audit.checks.upstreamAuditMatched],
    ["audit.upstreamFingerprint", audit.checks.upstreamFingerprintMatches],
    ["audit.assignmentId", audit.checks.assignmentIdMatches],
    ["audit.itemSet", audit.checks.requiredItemSetMatches],
    ["audit.itemStatuses", audit.checks.itemStatusesMatchEligibility],
    ["audit.aliasOpaque", audit.checks.reviewerAliasOpaque],
    ["audit.noPii", audit.checks.reviewerPiiAbsent],
    ["audit.noCredential", audit.checks.reviewerCredentialAbsent],
    ["audit.notPersisted", audit.checks.assignmentNotPersisted],
    ["audit.unsigned", audit.checks.envelopeUnsigned],
    ["audit.noSecret", audit.checks.envelopeContainsNoSecret],
    ["audit.envelopeNoPii", audit.checks.envelopeContainsNoPii],
    ["audit.notSubmitted", audit.checks.envelopeNotSubmitted],
    ["audit.noDecisionAttestation", audit.checks.decisionAndAttestationAbsent],
    [
      "audit.noApprovalActivation",
      audit.checks.approvalAndActivationArtifactsAbsent,
    ],
    [
      "audit.noProviderSettlement",
      audit.checks.providerAndSettlementArtifactsAbsent,
    ],
    ["audit.noRegistryMutation", audit.checks.registryMutationAbsent],
    ["audit.executionBlocked", audit.checks.productionAndExecutionBlocked],
  ] as const satisfies readonly (readonly [
    PaymentSandboxReviewerAssignmentMessageKey,
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
          previewPath: "/ui-preview/payment-sandbox-reviewer-assignment",
        }}
        homeHref={`/ui-preview/payment-sandbox-reviewer-assignment?locale=${shell.locale}&view=${view}`}
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
                    value={result.assignmentStatus}
                  />
                  <Row
                    label={t("summary.assignmentId")}
                    value={result.assignmentId}
                  />
                  <Row
                    label={t("summary.reviewerAlias")}
                    value={result.reviewerCandidate.alias}
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
                      href={`/ui-preview/payment-sandbox-reviewer-assignment?locale=${locale}&view=${view}`}
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
              className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 py-5 sm:px-6 lg:px-8"
            >
              {VIEWS.map((candidate) => (
                <Link
                  key={candidate}
                  href={`/ui-preview/payment-sandbox-reviewer-assignment?locale=${shell.locale}&view=${candidate}`}
                  aria-current={view === candidate ? "page" : undefined}
                  className={`rounded-full px-5 py-3 text-sm font-bold ${
                    view === candidate
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
              {view === "assignment" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("assignment.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("assignment.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                    <Row
                      label={t("field.reviewerRole")}
                      value={t("review.role")}
                    />
                    <Row
                      label={t("field.reviewerQueue")}
                      value={t("review.queue")}
                    />
                    <Row
                      label={t("field.reviewerAlias")}
                      value={result.reviewerCandidate.alias}
                    />
                  </dl>
                  <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {result.items.map((item) => (
                      <article
                        key={item.key}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <h3 className="text-xl font-bold text-slate-950">
                          {itemLabel(item.key)}
                        </h3>
                        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                          <Row
                            label={t("field.status")}
                            value={statusLabel(item.status)}
                          />
                          <Row
                            label={t("field.reviewerAlias")}
                            value={item.reviewerAlias ?? t("common.notCreated")}
                          />
                          <Row
                            label={t("field.assignmentPrepared")}
                            value={yesNo(item.assignmentPrepared)}
                          />
                          <Row
                            label={t("field.assignmentPersisted")}
                            value={yesNo(item.assignmentPersisted)}
                          />
                          <Row
                            label={t("field.decision")}
                            value={t("common.notCreated")}
                          />
                        </dl>
                      </article>
                    ))}
                  </div>
                </div>
              ) : view === "eligibility" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("eligibility.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("eligibility.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 lg:grid-cols-2">
                    {eligibilityRows.map(([key, value]) => (
                      <Row key={key} label={t(key)} value={yesNo(value)} />
                    ))}
                  </dl>
                </div>
              ) : view === "assignment-envelope" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("envelope.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("envelope.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                    <Row
                      label={t("envelope.mediaType")}
                      value={result.assignmentEnvelope.mediaType}
                    />
                    <Row
                      label={t("envelope.signed")}
                      value={yesNo(result.assignmentEnvelope.signed)}
                    />
                    <Row
                      label={t("envelope.containsSecret")}
                      value={yesNo(result.assignmentEnvelope.containsSecret)}
                    />
                    <Row
                      label={t("envelope.containsPii")}
                      value={yesNo(result.assignmentEnvelope.containsPii)}
                    />
                    <Row
                      label={t("envelope.submitted")}
                      value={yesNo(result.assignmentEnvelope.submitted)}
                    />
                    <Row
                      label={t("envelope.persisted")}
                      value={yesNo(result.assignmentEnvelope.persisted)}
                    />
                  </dl>
                  <h3 className="mt-8 text-lg font-bold text-slate-950">
                    {t("envelope.body")}
                  </h3>
                  <pre className="mt-3 overflow-x-auto rounded-3xl bg-slate-950 p-6 text-sm text-emerald-100">
                    {JSON.stringify(result.assignmentEnvelope.body, null, 2)}
                  </pre>
                  <button
                    type="button"
                    disabled
                    className="mt-5 cursor-not-allowed rounded-full bg-slate-300 px-5 py-3 font-bold text-slate-600"
                  >
                    {t("envelope.submitted")}: {t("common.no")}
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("audit.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("audit.description")}
                  </p>
                  <p className="mt-6 inline-flex rounded-full bg-emerald-100 px-4 py-2 font-bold text-emerald-900">
                    {audit.status === "matched"
                      ? t("audit.matched")
                      : t("audit.mismatched")}
                  </p>
                  <dl className="mt-8 grid gap-4 lg:grid-cols-2">
                    {auditRows.map(([key, value]) => (
                      <Row key={key} label={t(key)} value={yesNo(value)} />
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </section>
        </article>
      </PageShell>
    </div>
  );
}
