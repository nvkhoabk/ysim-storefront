// F07A-3G_PAYMENT_EVIDENCE_VERIFICATION_REVIEW_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createPaymentEvidenceVerificationTranslator,
  normalizePaymentEvidenceVerificationView,
} from "@/i18n/payment-evidence-verification/payment-evidence-verification.registry";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  auditPaymentEvidenceVerification,
  createPaymentEvidenceVerification,
} from "@/lib/payments/payment-evidence-verification";
import type {
  PaymentEvidenceVerificationItemStatus,
  PaymentEvidenceVerificationStatus,
  PaymentEvidenceVerificationView,
} from "@/lib/payments/payment-evidence-verification.types";
import type {
  PaymentOperationalEvidenceKey,
  PaymentOperationalEvidenceRecordStatus,
} from "@/lib/payments/payment-operational-evidence.types";
import type { ProviderAdapterState } from "@/lib/payments/payment-provider-assignment.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentEvidenceVerificationView[] = [
  "review-queue",
  "checklist",
  "decision-draft",
  "audit",
];

function Row({
  label,
  value,
}: {
  readonly key?: string;
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

export default async function PaymentEvidenceVerificationPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentEvidenceVerificationView(params.view);
  const t = createPaymentEvidenceVerificationTranslator(shell.locale);
  const result = createPaymentEvidenceVerification(shell.locale);
  const audit = auditPaymentEvidenceVerification(result);
  const assignment = result.evidenceManifest.readiness.providerAssignmentPolicy;

  const yesNo = (value: boolean): string =>
    value ? t("common.yes") : t("common.no");
  const adapterLabel = (state: ProviderAdapterState): string => {
    if (state === "runtime-registered") return t("common.runtimeRegistered");
    if (state === "adapter-disabled") return t("common.adapterDisabled");
    return t("common.adapterMissing");
  };
  const verificationStatusLabel = (
    status: PaymentEvidenceVerificationStatus,
  ): string => {
    if (status === "blocked-pending-independent-review") {
      return t("status.blockedPendingReview");
    }
    if (status === "blocked-adapter-disabled") {
      return t("status.blockedAdapterDisabled");
    }
    return t("status.blockedAdapterMissing");
  };
  const itemStatusLabel = (
    status: PaymentEvidenceVerificationItemStatus,
  ): string => {
    if (status === "pending-independent-review") {
      return t("status.pendingIndependent");
    }
    if (status === "blocked-adapter-disabled") {
      return t("status.blockedAdapterDisabled");
    }
    return t("status.blockedAdapterMissing");
  };
  const keyLabel = (key: PaymentOperationalEvidenceKey): string => {
    if (key === "credential-evidence") return t("key.credential");
    if (key === "callback-contract") return t("key.callback");
    if (key === "idempotency-evidence") return t("key.idempotency");
    return t("key.reconciliation");
  };
  const recordStatusLabel = (
    status: PaymentOperationalEvidenceRecordStatus,
  ): string => {
    if (status === "captured-unverified") {
      return t("record.capturedUnverified");
    }
    if (status === "blocked-adapter-disabled") {
      return t("record.blockedDisabled");
    }
    return t("record.blockedMissing");
  };

  const auditRows = [
    ["audit.evidenceMatched", audit.checks.operationalEvidenceAuditMatched],
    ["audit.providerMatches", audit.checks.providerKeyMatches],
    ["audit.adapterMatches", audit.checks.adapterStateMatches],
    ["audit.currencyMatches", audit.checks.providerCurrencyMatches],
    ["audit.amountMatches", audit.checks.providerAmountMatches],
    ["audit.snapshotMatches", audit.checks.snapshotFingerprintMatches],
    ["audit.bundleMatches", audit.checks.evidenceBundleFingerprintMatches],
    ["audit.verificationStatusMatches", audit.checks.verificationStatusMatches],
    ["audit.keySetMatches", audit.checks.requiredEvidenceKeySetMatches],
    ["audit.referencesPreserved", audit.checks.itemReferencesPreserved],
    ["audit.itemFingerprintsMatch", audit.checks.itemFingerprintsMatch],
    ["audit.sandboxScoped", audit.checks.itemsAreSandboxScoped],
    ["audit.noSecrets", audit.checks.itemsContainNoSecrets],
    ["audit.reviewerAbsent", audit.checks.reviewerIdentityAbsent],
    ["audit.decisionPending", audit.checks.verificationDecisionRemainsPending],
    [
      "audit.evidenceUnverified",
      audit.checks.originalEvidenceRemainsUnverified,
    ],
    ["audit.readinessBlocked", audit.checks.originalReadinessRemainsBlocked],
    [
      "audit.artifactsAbsent",
      audit.checks.approvalAndActivationArtifactsAbsent,
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
          previewPath: "/ui-preview/payment-evidence-verification",
        }}
        homeHref={`/ui-preview/payment-evidence-verification?locale=${shell.locale}&view=${view}`}
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
                      {verificationStatusLabel(result.verificationStatus)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-emerald-200">
                      {t("summary.itemCount")}
                    </dt>
                    <dd className="font-bold">{result.items.length}</dd>
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
                      href={`/ui-preview/payment-evidence-verification?locale=${locale}&view=${view}`}
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
                  href={`/ui-preview/payment-evidence-verification?locale=${shell.locale}&view=${candidate}`}
                  aria-current={view === candidate ? "page" : undefined}
                  className={`rounded-full px-5 py-3 text-sm font-bold ${
                    view === candidate
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {candidate === "review-queue"
                    ? t("tabs.reviewQueue")
                    : candidate === "checklist"
                      ? t("tabs.checklist")
                      : candidate === "decision-draft"
                        ? t("tabs.decisionDraft")
                        : t("tabs.audit")}
                </Link>
              ))}
            </nav>
          </section>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {view === "review-queue" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("queue.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("queue.description")}
                  </p>
                  <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {result.items.map((item) => (
                      <article
                        key={item.key}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <h3 className="text-xl font-bold text-slate-950">
                          {keyLabel(item.key)}
                        </h3>
                        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                          <Row
                            label={t("queue.environment")}
                            value={t("common.sandbox")}
                          />
                          <Row
                            label={t("queue.itemStatus")}
                            value={itemStatusLabel(item.status)}
                          />
                          <Row
                            label={t("queue.evidenceStatus")}
                            value={recordStatusLabel(item.evidenceRecordStatus)}
                          />
                          <Row
                            label={t("queue.referenceId")}
                            value={item.referenceId ?? t("common.notAssigned")}
                          />
                          <Row
                            label={t("queue.referenceFingerprint")}
                            value={
                              item.referenceFingerprint ??
                              t("common.notAssigned")
                            }
                          />
                          <Row
                            label={t("queue.bundleFingerprint")}
                            value={item.evidenceBundleFingerprint}
                          />
                          <Row
                            label={t("queue.reviewMethod")}
                            value={t("review.method")}
                          />
                          <Row
                            label={t("queue.reviewerRole")}
                            value={t("review.role")}
                          />
                          <Row
                            label={t("queue.reviewerId")}
                            value={item.reviewerId ?? t("common.notAssigned")}
                          />
                          <Row
                            label={t("queue.reviewedAt")}
                            value={item.reviewedAt ?? t("common.notAssigned")}
                          />
                          <Row
                            label={t("queue.containsSecret")}
                            value={yesNo(item.containsSecret)}
                          />
                          <Row
                            label={t("queue.verificationApproved")}
                            value={yesNo(item.verificationApproved)}
                          />
                          <Row
                            label={t("queue.rejectionRecorded")}
                            value={yesNo(item.rejectionRecorded)}
                          />
                          <Row
                            label={t("queue.decisionReason")}
                            value={
                              item.decisionReason ?? t("common.notAssigned")
                            }
                          />
                        </dl>
                      </article>
                    ))}
                  </div>
                </div>
              ) : view === "checklist" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("checklist.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("checklist.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Row
                      label={t("checklist.status")}
                      value={verificationStatusLabel(result.verificationStatus)}
                    />
                    <Row
                      label={t("checklist.verificationFingerprint")}
                      value={result.verificationFingerprint}
                    />
                    <Row
                      label={t("summary.provider")}
                      value={assignment.providerAssignment.providerLabel}
                    />
                    <Row
                      label={t("summary.market")}
                      value={assignment.marketId}
                    />
                    <Row
                      label={t("summary.status")}
                      value={adapterLabel(result.adapterState)}
                    />
                  </dl>
                  <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          <th className="p-4">{t("checklist.key")}</th>
                          <th className="p-4">
                            {t("checklist.referencePresent")}
                          </th>
                          <th className="p-4">
                            {t("checklist.fingerprintPresent")}
                          </th>
                          <th className="p-4">{t("checklist.noSecret")}</th>
                          <th className="p-4">
                            {t("checklist.manualReviewRequired")}
                          </th>
                          <th className="p-4">
                            {t("checklist.reviewerAbsent")}
                          </th>
                          <th className="p-4">
                            {t("checklist.decisionPending")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.items.map((item) => (
                          <tr
                            key={item.key}
                            className="border-t border-slate-200"
                          >
                            <td className="p-4 font-bold text-slate-900">
                              {keyLabel(item.key)}
                            </td>
                            <td className="p-4">
                              {yesNo(item.referenceId !== null)}
                            </td>
                            <td className="p-4">
                              {yesNo(item.referenceFingerprint !== null)}
                            </td>
                            <td className="p-4">
                              {yesNo(item.containsSecret === false)}
                            </td>
                            <td className="p-4">
                              {yesNo(
                                item.status === "pending-independent-review",
                              )}
                            </td>
                            <td className="p-4">
                              {yesNo(item.reviewerId === null)}
                            </td>
                            <td className="p-4">
                              {yesNo(
                                item.verificationApproved === false &&
                                  item.rejectionRecorded === false,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {t("checklist.blockers")}: {result.blockers.join(", ")}
                  </p>
                </div>
              ) : view === "decision-draft" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("decision.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("decision.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Row
                      label={t("decision.verificationId")}
                      value={result.verificationId}
                    />
                    <Row
                      label={t("decision.status")}
                      value={result.decisionDraft.status}
                    />
                    <Row
                      label={t("decision.verificationDecision")}
                      value={yesNo(
                        result.decisionDraft.verificationDecisionCreated,
                      )}
                    />
                    <Row
                      label={t("decision.reviewerAttestation")}
                      value={yesNo(
                        result.decisionDraft.reviewerAttestationCreated,
                      )}
                    />
                    <Row
                      label={t("decision.approval")}
                      value={yesNo(result.decisionDraft.approvalCreated)}
                    />
                    <Row
                      label={t("decision.approvalToken")}
                      value={yesNo(result.decisionDraft.approvalTokenCreated)}
                    />
                    <Row
                      label={t("decision.activationToken")}
                      value={yesNo(result.decisionDraft.activationTokenCreated)}
                    />
                    <Row
                      label={t("decision.providerRequest")}
                      value={yesNo(result.decisionDraft.providerRequestCreated)}
                    />
                    <Row
                      label={t("decision.settlement")}
                      value={yesNo(
                        result.decisionDraft.settlementInstructionCreated,
                      )}
                    />
                    <Row
                      label={t("decision.registryMutation")}
                      value={yesNo(
                        result.decisionDraft.registryMutationCreated,
                      )}
                    />
                    <Row
                      label={t("decision.productionEligible")}
                      value={yesNo(result.decisionDraft.productionEligible)}
                    />
                    <Row
                      label={t("decision.executionEligible")}
                      value={yesNo(result.decisionDraft.executionEligible)}
                    />
                  </dl>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("audit.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("audit.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Row label={t("audit.auditId")} value={audit.auditId} />
                    <Row
                      label={t("audit.status")}
                      value={
                        audit.status === "matched"
                          ? t("common.matched")
                          : t("common.mismatch")
                      }
                    />
                    {auditRows.map(([label, value]) => (
                      <Row key={label} label={t(label)} value={yesNo(value)} />
                    ))}
                  </dl>
                </div>
              )}

              <button
                type="button"
                disabled
                className="mt-10 cursor-not-allowed rounded-2xl bg-slate-300 px-6 py-4 font-bold text-slate-600"
              >
                {t("actions.disabled")}
              </button>
            </div>
          </section>
        </article>
      </PageShell>
    </div>
  );
}
