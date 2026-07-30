// F07A-3H_PAYMENT_SANDBOX_APPROVAL_REQUEST_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createPaymentSandboxApprovalRequestTranslator,
  normalizePaymentSandboxApprovalRequestView,
} from "@/i18n/payment-sandbox-approval-request/payment-sandbox-approval-request.registry";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  auditPaymentSandboxApprovalRequest,
  createPaymentSandboxApprovalRequest,
} from "@/lib/payments/payment-sandbox-approval-request";
import type {
  PaymentSandboxApprovalPrerequisiteKey,
  PaymentSandboxApprovalRequestStatus,
  PaymentSandboxApprovalRequestView,
} from "@/lib/payments/payment-sandbox-approval-request.types";
import type { ProviderAdapterState } from "@/lib/payments/payment-provider-assignment.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentSandboxApprovalRequestView[] = [
  "request",
  "prerequisites",
  "approval-draft",
  "audit",
];

function Row({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <dt className="text-sm font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 font-bold break-all text-slate-900">{value}</dd>
    </div>
  );
}

export default async function PaymentSandboxApprovalRequestPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentSandboxApprovalRequestView(params.view);
  const t = createPaymentSandboxApprovalRequestTranslator(shell.locale);
  const result = createPaymentSandboxApprovalRequest(shell.locale);
  const audit = auditPaymentSandboxApprovalRequest(result);
  const verification = result.verificationReview;
  const evidence = verification.evidenceManifest;
  const assignment = evidence.readiness.providerAssignmentPolicy;

  const yesNo = (value: boolean): string =>
    value ? t("common.yes") : t("common.no");
  const adapterLabel = (state: ProviderAdapterState): string => {
    if (state === "runtime-registered") return t("common.runtimeRegistered");
    if (state === "adapter-disabled") return t("common.adapterDisabled");
    return t("common.adapterMissing");
  };
  const statusLabel = (status: PaymentSandboxApprovalRequestStatus): string => {
    if (status === "blocked-pending-verification-decision") {
      return t("status.blockedVerification");
    }
    if (status === "blocked-adapter-disabled") {
      return t("status.blockedDisabled");
    }
    return t("status.blockedMissing");
  };
  const prerequisiteLabel = (
    key: PaymentSandboxApprovalPrerequisiteKey,
  ): string => {
    if (key === "independent-review-complete") return t("prerequisite.review");
    if (key === "verification-decision-issued")
      return t("prerequisite.decision");
    if (key === "reviewer-attestation-recorded")
      return t("prerequisite.attestation");
    return t("prerequisite.authorization");
  };

  const auditRows = [
    ["audit.verificationMatched", audit.checks.verificationAuditMatched],
    ["audit.providerMatches", audit.checks.providerKeyMatches],
    ["audit.adapterMatches", audit.checks.adapterStateMatches],
    ["audit.currencyMatches", audit.checks.providerCurrencyMatches],
    ["audit.amountMatches", audit.checks.providerAmountMatches],
    ["audit.snapshotMatches", audit.checks.snapshotFingerprintMatches],
    ["audit.evidenceMatches", audit.checks.evidenceBundleFingerprintMatches],
    [
      "audit.verificationFingerprintMatches",
      audit.checks.verificationFingerprintMatches,
    ],
    ["audit.requestStatusMatches", audit.checks.requestStatusMatches],
    ["audit.requestFingerprintMatches", audit.checks.requestFingerprintMatches],
    ["audit.prerequisiteSetMatches", audit.checks.prerequisiteKeySetMatches],
    [
      "audit.prerequisitesUnsatisfied",
      audit.checks.prerequisitesRemainUnsatisfied,
    ],
    ["audit.reviewerAbsent", audit.checks.reviewerIdentityAbsent],
    [
      "audit.verificationDecisionAbsent",
      audit.checks.verificationDecisionAbsent,
    ],
    ["audit.requestNotSubmitted", audit.checks.approvalRequestNotSubmitted],
    ["audit.approvalDecisionAbsent", audit.checks.approvalDecisionAbsent],
    ["audit.approverAbsent", audit.checks.approverIdentityAbsent],
    [
      "audit.artifactsAbsent",
      audit.checks.approvalAndActivationArtifactsAbsent,
    ],
    ["audit.upstreamBlocked", audit.checks.upstreamVerificationRemainsBlocked],
    [
      "audit.paymentDraftUnassigned",
      audit.checks.originalPaymentBindingRemainsUnassigned,
    ],
    ["audit.executionBlocked", audit.checks.productionAndExecutionBlocked],
  ] as const;

  return (
    <div lang={shell.htmlLang} dir={shell.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/payment-sandbox-approval-request",
        }}
        homeHref={`/ui-preview/payment-sandbox-approval-request?locale=${shell.locale}&view=${view}`}
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
                  <div>
                    <dt className="text-emerald-200">{t("summary.market")}</dt>
                    <dd className="font-bold">{assignment.marketId}</dd>
                  </div>
                  <div>
                    <dt className="text-emerald-200">
                      {t("summary.provider")}
                    </dt>
                    <dd className="font-bold">
                      {assignment.providerAssignment.providerLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-emerald-200">{t("summary.status")}</dt>
                    <dd className="font-bold">
                      {statusLabel(result.requestStatus)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-emerald-200">
                      {t("summary.prerequisiteCount")}
                    </dt>
                    <dd className="font-bold">{result.prerequisites.length}</dd>
                  </div>
                  <div>
                    <dt className="text-emerald-200">
                      {t("summary.executionEligible")}
                    </dt>
                    <dd className="font-bold">
                      {yesNo(result.executionEligible)}
                    </dd>
                  </div>
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
                      href={`/ui-preview/payment-sandbox-approval-request?locale=${locale}&view=${view}`}
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
                  href={`/ui-preview/payment-sandbox-approval-request?locale=${shell.locale}&view=${candidate}`}
                  aria-current={view === candidate ? "page" : undefined}
                  className={`rounded-full px-5 py-3 text-sm font-bold ${
                    view === candidate
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {candidate === "request"
                    ? t("tabs.request")
                    : candidate === "prerequisites"
                      ? t("tabs.prerequisites")
                      : candidate === "approval-draft"
                        ? t("tabs.approvalDraft")
                        : t("tabs.audit")}
                </Link>
              ))}
            </nav>
          </section>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {view === "request" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("request.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("request.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Row
                      label={t("request.requestId")}
                      value={result.requestId}
                    />
                    <Row
                      label={t("request.environment")}
                      value={result.environment}
                    />
                    <Row
                      label={t("request.provider")}
                      value={result.providerKey}
                    />
                    <Row
                      label={t("request.adapter")}
                      value={adapterLabel(result.adapterState)}
                    />
                    <Row
                      label={t("request.currency")}
                      value={result.providerCurrency}
                    />
                    <Row
                      label={t("request.amount")}
                      value={result.providerAmountMinor.toString()}
                    />
                    <Row
                      label={t("request.verificationId")}
                      value={verification.verificationId}
                    />
                    <Row
                      label={t("request.verificationStatus")}
                      value={verification.verificationStatus}
                    />
                    <Row
                      label={t("request.verificationFingerprint")}
                      value={verification.verificationFingerprint}
                    />
                    <Row
                      label={t("request.evidenceFingerprint")}
                      value={evidence.bundleFingerprint}
                    />
                    <Row
                      label={t("request.snapshotFingerprint")}
                      value={
                        assignment.binding.lockedPresentation.snapshot
                          .fingerprint
                      }
                    />
                    <Row
                      label={t("request.requestFingerprint")}
                      value={result.requestFingerprint}
                    />
                  </dl>
                  <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
                    <h3 className="font-bold text-amber-950">
                      {t("request.blockers")}
                    </h3>
                    <ul className="mt-3 grid gap-2 text-sm text-amber-900">
                      {result.blockers.map((blocker) => (
                        <li key={blocker}>{blocker}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {view === "prerequisites" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("prerequisites.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("prerequisites.description")}
                  </p>
                  <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    {result.prerequisites.map((item) => (
                      <dl
                        key={item.key}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <Row
                          label={t("prerequisites.key")}
                          value={prerequisiteLabel(item.key)}
                        />
                        <div className="mt-3">
                          <Row
                            label={t("prerequisites.status")}
                            value={item.status}
                          />
                        </div>
                        <div className="mt-3">
                          <Row
                            label={t("prerequisites.satisfied")}
                            value={yesNo(item.satisfied)}
                          />
                        </div>
                        <div className="mt-3">
                          <Row
                            label={t("prerequisites.reason")}
                            value={item.reason}
                          />
                        </div>
                      </dl>
                    ))}
                  </div>
                </div>
              ) : null}

              {view === "approval-draft" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("draft.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("draft.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Row
                      label={t("draft.status")}
                      value={result.approvalDraft.status}
                    />
                    <Row
                      label={t("draft.packetPrepared")}
                      value={yesNo(result.approvalDraft.requestPacketPrepared)}
                    />
                    <Row
                      label={t("draft.requestSubmitted")}
                      value={yesNo(
                        result.approvalDraft.approvalRequestSubmitted,
                      )}
                    />
                    <Row
                      label={t("draft.approvalDecision")}
                      value={yesNo(
                        result.approvalDraft.approvalDecisionCreated,
                      )}
                    />
                    <Row
                      label={t("draft.reviewerAttestation")}
                      value={yesNo(
                        result.approvalDraft.reviewerAttestationCreated,
                      )}
                    />
                    <Row
                      label={t("draft.approverIdentity")}
                      value={yesNo(
                        result.approvalDraft.approverIdentityCreated,
                      )}
                    />
                    <Row
                      label={t("draft.approvalToken")}
                      value={yesNo(result.approvalDraft.approvalTokenCreated)}
                    />
                    <Row
                      label={t("draft.activationToken")}
                      value={yesNo(result.approvalDraft.activationTokenCreated)}
                    />
                    <Row
                      label={t("draft.providerRequest")}
                      value={yesNo(result.approvalDraft.providerRequestCreated)}
                    />
                    <Row
                      label={t("draft.settlementInstruction")}
                      value={yesNo(
                        result.approvalDraft.settlementInstructionCreated,
                      )}
                    />
                    <Row
                      label={t("draft.registryMutation")}
                      value={yesNo(
                        result.approvalDraft.registryMutationCreated,
                      )}
                    />
                    <Row
                      label={t("draft.productionEligible")}
                      value={yesNo(result.approvalDraft.productionEligible)}
                    />
                    <Row
                      label={t("draft.executionEligible")}
                      value={yesNo(result.approvalDraft.executionEligible)}
                    />
                  </dl>
                  <button
                    type="button"
                    disabled
                    className="mt-8 rounded-full bg-slate-300 px-6 py-3 font-bold text-slate-600"
                  >
                    {t("draft.action")}
                  </button>
                </div>
              ) : null}

              {view === "audit" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("audit.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("audit.description")}
                  </p>
                  <p className="mt-6 inline-flex rounded-full bg-emerald-100 px-4 py-2 font-bold text-emerald-800">
                    {t("audit.status")}:{" "}
                    {audit.status === "matched"
                      ? t("common.matched")
                      : t("common.mismatch")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
