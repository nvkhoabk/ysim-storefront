// F07A-3F_PAYMENT_OPERATIONAL_EVIDENCE_MANIFEST_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createPaymentOperationalEvidenceTranslator,
  normalizePaymentOperationalEvidenceView,
} from "@/i18n/payment-operational-evidence/payment-operational-evidence.registry";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  auditPaymentOperationalEvidence,
  createPaymentOperationalEvidence,
} from "@/lib/payments/payment-operational-evidence";
import type {
  PaymentOperationalEvidenceKey,
  PaymentOperationalEvidenceRecordStatus,
  PaymentOperationalEvidenceSourceKind,
  PaymentOperationalEvidenceStatus,
  PaymentOperationalEvidenceView,
} from "@/lib/payments/payment-operational-evidence.types";
import type { ProviderAdapterState } from "@/lib/payments/payment-provider-assignment.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentOperationalEvidenceView[] = [
  "evidence",
  "matrix",
  "approval-draft",
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

export default async function PaymentOperationalEvidencePage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentOperationalEvidenceView(params.view);
  const t = createPaymentOperationalEvidenceTranslator(shell.locale);
  const result = createPaymentOperationalEvidence(shell.locale);
  const audit = auditPaymentOperationalEvidence(result);
  const assignment = result.readiness.providerAssignmentPolicy;

  const yesNo = (value: boolean): string =>
    value ? t("common.yes") : t("common.no");
  const adapterLabel = (state: ProviderAdapterState): string => {
    if (state === "runtime-registered") return t("common.runtimeRegistered");
    if (state === "adapter-disabled") return t("common.adapterDisabled");
    return t("common.adapterMissing");
  };
  const evidenceStatusLabel = (
    status: PaymentOperationalEvidenceStatus,
  ): string => {
    if (status === "blocked-evidence-verification") {
      return t("status.blockedVerification");
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
    if (status === "captured-unverified") return t("record.capturedUnverified");
    if (status === "blocked-adapter-disabled") {
      return t("record.blockedDisabled");
    }
    return t("record.blockedMissing");
  };
  const sourceLabel = (source: PaymentOperationalEvidenceSourceKind): string =>
    source === "candidate-reference"
      ? t("source.candidateReference")
      : t("source.adapterBlocker");

  const auditRows = [
    ["audit.readinessMatched", audit.checks.readinessAuditMatched],
    ["audit.providerMatches", audit.checks.providerKeyMatches],
    ["audit.adapterMatches", audit.checks.adapterStateMatches],
    ["audit.currencyMatches", audit.checks.providerCurrencyMatches],
    ["audit.amountMatches", audit.checks.providerAmountMatches],
    ["audit.snapshotMatches", audit.checks.snapshotFingerprintMatches],
    ["audit.readinessStatusMatches", audit.checks.readinessStatusMatches],
    ["audit.evidenceStatusMatches", audit.checks.evidenceStatusMatches],
    ["audit.keySetMatches", audit.checks.requiredEvidenceKeySetMatches],
    ["audit.sandboxScoped", audit.checks.recordsAreSandboxScoped],
    ["audit.noSecrets", audit.checks.recordsContainNoSecrets],
    ["audit.fingerprintsMatch", audit.checks.evidenceFingerprintsMatch],
    [
      "audit.verificationPending",
      audit.checks.evidenceVerificationRemainsPending,
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
          previewPath: "/ui-preview/payment-operational-evidence",
        }}
        homeHref={`/ui-preview/payment-operational-evidence?locale=${shell.locale}&view=${view}`}
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
                    <dt className="text-emerald-200">
                      {t("summary.evidenceStatus")}
                    </dt>
                    <dd className="font-bold">
                      {evidenceStatusLabel(result.evidenceStatus)}
                    </dd>
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
                      href={`/ui-preview/payment-operational-evidence?locale=${locale}&view=${view}`}
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
                  href={`/ui-preview/payment-operational-evidence?locale=${shell.locale}&view=${candidate}`}
                  aria-current={view === candidate ? "page" : undefined}
                  className={`rounded-full px-5 py-3 text-sm font-bold ${
                    view === candidate
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {candidate === "evidence"
                    ? t("tabs.evidence")
                    : candidate === "matrix"
                      ? t("tabs.matrix")
                      : candidate === "approval-draft"
                        ? t("tabs.approvalDraft")
                        : t("tabs.audit")}
                </Link>
              ))}
            </nav>
          </section>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {view === "evidence" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("evidence.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("evidence.description")}
                  </p>
                  <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {result.records.map((record) => (
                      <article
                        key={record.key}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <h3 className="text-xl font-bold text-slate-950">
                          {keyLabel(record.key)}
                        </h3>
                        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                          <Row
                            label={t("evidence.environment")}
                            value={t("common.sandbox")}
                          />
                          <Row
                            label={t("evidence.status")}
                            value={recordStatusLabel(record.status)}
                          />
                          <Row
                            label={t("evidence.source")}
                            value={sourceLabel(record.sourceKind)}
                          />
                          <Row
                            label={t("evidence.referenceId")}
                            value={
                              record.referenceId ?? t("common.notAssigned")
                            }
                          />
                          <Row
                            label={t("evidence.fingerprint")}
                            value={
                              record.referenceFingerprint ??
                              t("common.notAssigned")
                            }
                          />
                          <Row
                            label={t("evidence.containsSecret")}
                            value={yesNo(record.containsSecret)}
                          />
                          <Row
                            label={t("evidence.verificationApproved")}
                            value={yesNo(record.verificationApproved)}
                          />
                        </dl>
                      </article>
                    ))}
                  </div>
                </div>
              ) : view === "matrix" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("matrix.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("matrix.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Row
                      label={t("matrix.readinessStatus")}
                      value={result.readinessStatus}
                    />
                    <Row
                      label={t("matrix.adapterState")}
                      value={adapterLabel(result.adapterState)}
                    />
                    <Row
                      label={t("matrix.bundleFingerprint")}
                      value={result.bundleFingerprint}
                    />
                    <Row
                      label={t("matrix.blockerCount")}
                      value={String(result.blockers.length)}
                    />
                  </dl>
                  <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          <th className="p-4">{t("matrix.gate")}</th>
                          <th className="p-4">{t("matrix.gateStatus")}</th>
                          <th className="p-4">{t("matrix.recordStatus")}</th>
                          <th className="p-4">{t("matrix.verification")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.records.map((record) => {
                          const gate = result.readiness.gates.find(
                            (candidate) => candidate.key === record.key,
                          );
                          return (
                            <tr
                              key={record.key}
                              className="border-t border-slate-200"
                            >
                              <td className="p-4 font-bold text-slate-900">
                                {keyLabel(record.key)}
                              </td>
                              <td className="p-4">
                                {gate?.status ?? t("common.notAssigned")}
                              </td>
                              <td className="p-4">
                                {recordStatusLabel(record.status)}
                              </td>
                              <td className="p-4">
                                {record.sourceKind === "candidate-reference"
                                  ? t("matrix.pending")
                                  : t("matrix.notApplicable")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {t("matrix.blockers")}: {result.blockers.join(", ")}
                  </p>
                </div>
              ) : view === "approval-draft" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("approval.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("approval.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Row
                      label={t("approval.manifestId")}
                      value={result.manifestId}
                    />
                    <Row
                      label={t("approval.status")}
                      value={result.approvalDraft.status}
                    />
                    <Row
                      label={t("approval.created")}
                      value={yesNo(result.approvalDraft.approvalCreated)}
                    />
                    <Row
                      label={t("approval.tokenCreated")}
                      value={yesNo(result.approvalDraft.approvalTokenCreated)}
                    />
                    <Row
                      label={t("approval.activationToken")}
                      value={yesNo(result.approvalDraft.activationTokenCreated)}
                    />
                    <Row
                      label={t("approval.providerRequest")}
                      value={yesNo(result.approvalDraft.providerRequestCreated)}
                    />
                    <Row
                      label={t("approval.settlement")}
                      value={yesNo(
                        result.approvalDraft.settlementInstructionCreated,
                      )}
                    />
                    <Row
                      label={t("approval.registryMutation")}
                      value={yesNo(
                        result.approvalDraft.registryMutationCreated,
                      )}
                    />
                    <Row
                      label={t("approval.productionEligible")}
                      value={yesNo(result.approvalDraft.productionEligible)}
                    />
                    <Row
                      label={t("approval.executionEligible")}
                      value={yesNo(result.approvalDraft.executionEligible)}
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
