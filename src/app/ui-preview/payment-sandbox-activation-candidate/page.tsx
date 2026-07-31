// F07A-3Q_PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createPaymentSandboxActivationCandidateTranslator,
  normalizePaymentSandboxActivationCandidateView,
} from "@/i18n/payment-sandbox-activation-candidate/payment-sandbox-activation-candidate.registry";
import type { PaymentSandboxActivationCandidateMessageKey } from "@/i18n/payment-sandbox-activation-candidate/payment-sandbox-activation-candidate.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  auditPaymentSandboxActivationCandidate,
  createPaymentSandboxActivationCandidate,
} from "@/lib/payments/payment-sandbox-activation-candidate";
import { createPaymentSandboxApprovalCandidate } from "@/lib/payments/payment-sandbox-approval-candidate";
import { createPaymentSandboxApprovalIssuance } from "@/lib/payments/payment-sandbox-approval-issuance";
import { createPaymentSandboxApprovalReviewHandoff } from "@/lib/payments/payment-sandbox-approval-review-handoff";
import { createPaymentSandboxApprovalToken } from "@/lib/payments/payment-sandbox-approval-token";
import { createPaymentSandboxReviewDecision } from "@/lib/payments/payment-sandbox-review-decision";
import { createPaymentSandboxReviewDecisionIssuance } from "@/lib/payments/payment-sandbox-review-decision-issuance";
import { createPaymentSandboxReviewerAssignment } from "@/lib/payments/payment-sandbox-reviewer-assignment";
import { createPaymentSandboxReviewerAttestation } from "@/lib/payments/payment-sandbox-reviewer-attestation";
import type {
  PaymentSandboxActivationCandidateStatus,
  PaymentSandboxActivationCandidateView,
} from "@/lib/payments/payment-sandbox-activation-candidate.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentSandboxActivationCandidateView[] = [
  "activation",
  "eligibility",
  "activation-envelope",
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

export default async function PaymentSandboxActivationCandidatePage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentSandboxActivationCandidateView(params.view);
  const t = createPaymentSandboxActivationCandidateTranslator(shell.locale);

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
  const upstreamToken = createPaymentSandboxApprovalToken(
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const result = createPaymentSandboxActivationCandidate(
    upstreamToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const audit = auditPaymentSandboxActivationCandidate(
    result,
    upstreamToken,
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

  const itemLabel = (key: (typeof result.items)[number]["key"]): string => {
    if (key === "request-identity") return t("item.requestIdentity");
    if (key === "verification-binding") return t("item.verificationBinding");
    if (key === "approval-prerequisites")
      return t("item.approvalPrerequisites");
    return t("item.noExecutionGuardrails");
  };

  const statusLabel = (
    status: PaymentSandboxActivationCandidateStatus,
  ): string => {
    if (status === "prepared-not-created") return t("status.prepared");
    if (status === "blocked-token-not-prepared") {
      return t("status.tokenNotPrepared");
    }
    if (status === "blocked-adapter-disabled") {
      return t("status.adapterDisabled");
    }
    return t("status.adapterMissing");
  };

  const tabLabel = (
    candidate: PaymentSandboxActivationCandidateView,
  ): string => {
    if (candidate === "activation") return t("tabs.activation");
    if (candidate === "eligibility") return t("tabs.eligibility");
    if (candidate === "activation-envelope") {
      return t("tabs.activationEnvelope");
    }
    return t("tabs.audit");
  };

  const eligibilityRows = [
    ["eligibility.tokenAudit", result.eligibility.tokenAuditMatched],
    ["eligibility.environment", result.eligibility.environmentSandbox],
    ["eligibility.tokenPrepared", result.eligibility.tokenPrepared],
    ["eligibility.tokenNotCreated", result.eligibility.tokenNotCreated],
    ["eligibility.tokenUnsigned", result.eligibility.tokenUnsigned],
    ["eligibility.tokenNotPersisted", result.eligibility.tokenNotPersisted],
    ["eligibility.approvalNotCreated", result.eligibility.approvalNotCreated],
    [
      "eligibility.approvalNotPersisted",
      result.eligibility.approvalNotPersisted,
    ],
    ["eligibility.aliasOpaque", result.eligibility.reviewerAliasOpaque],
    ["eligibility.itemSet", result.eligibility.requiredItemSetComplete],
    ["eligibility.guardrails", result.eligibility.noExecutionGuardrailsIntact],
    ["eligibility.result", result.eligibility.eligibleForPreviewActivation],
  ] as const satisfies readonly (readonly [
    PaymentSandboxActivationCandidateMessageKey,
    boolean,
  ])[];

  const auditRows = [
    ["audit.schema", audit.checks.schemaMatches],
    ["audit.environment", audit.checks.environmentSandbox],
    ["audit.tokenAudit", audit.checks.tokenAuditMatched],
    ["audit.upstreamFingerprint", audit.checks.upstreamFingerprintMatches],
    ["audit.activationCandidateId", audit.checks.activationCandidateIdMatches],
    ["audit.itemSet", audit.checks.requiredItemSetMatches],
    ["audit.aliasOpaque", audit.checks.reviewerAliasOpaque],
    ["audit.noPii", audit.checks.reviewerPiiAbsent],
    ["audit.noCredential", audit.checks.reviewerCredentialAbsent],
    ["audit.tokenNotCreated", audit.checks.tokenNotCreated],
    ["audit.tokenUnsigned", audit.checks.tokenUnsigned],
    ["audit.tokenNotPersisted", audit.checks.tokenNotPersisted],
    ["audit.approvalNotCreated", audit.checks.approvalNotCreated],
    ["audit.approvalNotPersisted", audit.checks.approvalNotPersisted],
    ["audit.activationNotCreated", audit.checks.activationNotCreated],
    ["audit.activationNotPersisted", audit.checks.activationNotPersisted],
    ["audit.envelopeUnsigned", audit.checks.envelopeUnsigned],
    ["audit.noSecret", audit.checks.envelopeContainsNoSecret],
    ["audit.envelopeNoPii", audit.checks.envelopeContainsNoPii],
    ["audit.notSubmitted", audit.checks.envelopeNotSubmitted],
    ["audit.noActivationToken", audit.checks.activationTokenAbsent],
    [
      "audit.noProviderSettlement",
      audit.checks.providerAndSettlementArtifactsAbsent,
    ],
    ["audit.noRegistryMutation", audit.checks.registryMutationAbsent],
    ["audit.executionBlocked", audit.checks.productionAndExecutionBlocked],
  ] as const satisfies readonly (readonly [
    PaymentSandboxActivationCandidateMessageKey,
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
          previewPath: "/ui-preview/payment-sandbox-activation-candidate",
        }}
        homeHref={`/ui-preview/payment-sandbox-activation-candidate?locale=${shell.locale}&view=${view}`}
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
                    value={statusLabel(result.activationStatus)}
                  />
                  <Row
                    label={t("summary.activationCandidateId")}
                    value={result.activationCandidateId}
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
                      href={`/ui-preview/payment-sandbox-activation-candidate?locale=${locale}&view=${view}`}
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
                  href={`/ui-preview/payment-sandbox-activation-candidate?locale=${shell.locale}&view=${candidate}`}
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
              {view === "activation" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("activation.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("activation.description")}
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
                            label={t("field.approvalTokenCandidateId")}
                            value={item.approvalTokenCandidateId}
                          />
                          <Row
                            label={t("field.activationPrepared")}
                            value={yesNo(item.activationPrepared)}
                          />
                          <Row
                            label={t("field.activationCreated")}
                            value={yesNo(item.activationCreated)}
                          />
                          <Row
                            label={t("field.activationPersisted")}
                            value={yesNo(item.activationPersisted)}
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

              {view === "activation-envelope" ? (
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
                      value={result.activationEnvelope.mediaType}
                    />
                    <Row
                      label={t("envelope.signed")}
                      value={yesNo(result.activationEnvelope.signed)}
                    />
                    <Row
                      label={t("envelope.containsSecret")}
                      value={yesNo(result.activationEnvelope.containsSecret)}
                    />
                    <Row
                      label={t("envelope.containsPii")}
                      value={yesNo(result.activationEnvelope.containsPii)}
                    />
                    <Row
                      label={t("envelope.submitted")}
                      value={yesNo(result.activationEnvelope.submitted)}
                    />
                    <Row
                      label={t("envelope.persisted")}
                      value={yesNo(result.activationEnvelope.persisted)}
                    />
                  </dl>
                  <h3 className="mt-8 text-xl font-bold text-slate-950">
                    {t("envelope.body")}
                  </h3>
                  <pre className="mt-4 overflow-x-auto rounded-3xl bg-slate-950 p-6 text-sm text-emerald-100">
                    {JSON.stringify(result.activationEnvelope.body, null, 2)}
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
