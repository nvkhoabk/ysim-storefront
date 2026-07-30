// F07A-3E_PAYMENT_EXECUTION_READINESS_GATE_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createPaymentExecutionReadinessTranslator,
  normalizePaymentExecutionReadinessView,
} from "@/i18n/payment-execution-readiness/payment-execution-readiness.registry";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  auditPaymentExecutionReadiness,
  createPaymentExecutionReadiness,
} from "@/lib/payments/payment-execution-readiness";
import type {
  PaymentExecutionBlockReason,
  PaymentExecutionEvidenceCode,
  PaymentExecutionGateKey,
  PaymentExecutionGateStatus,
  PaymentExecutionReadinessStatus,
  PaymentExecutionReadinessView,
} from "@/lib/payments/payment-execution-readiness.types";
import type { ProviderAdapterState } from "@/lib/payments/payment-provider-assignment.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentExecutionReadinessView[] = [
  "readiness",
  "blockers",
  "activation-draft",
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

export default async function PaymentExecutionReadinessPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentExecutionReadinessView(params.view);
  const t = createPaymentExecutionReadinessTranslator(shell.locale);
  const result = createPaymentExecutionReadiness(shell.locale);
  const audit = auditPaymentExecutionReadiness(result);
  const assignment = result.providerAssignmentPolicy;

  const yesNo = (value: boolean): string =>
    value ? t("common.yes") : t("common.no");

  const readinessLabel = (status: PaymentExecutionReadinessStatus): string => {
    if (status === "blocked-operational-verification") {
      return t("status.blockedOperational");
    }
    if (status === "blocked-adapter-disabled") {
      return t("status.blockedAdapterDisabled");
    }
    return t("status.blockedAdapterMissing");
  };

  const adapterLabel = (state: ProviderAdapterState): string => {
    if (state === "runtime-registered") return t("status.runtimeRegistered");
    if (state === "adapter-disabled") return t("status.adapterDisabled");
    return t("status.adapterMissing");
  };

  const gateLabel = (key: PaymentExecutionGateKey): string => {
    if (key === "provider-assignment") return t("gate.providerAssignment");
    if (key === "runtime-adapter") return t("gate.runtimeAdapter");
    if (key === "credential-evidence") return t("gate.credentialEvidence");
    if (key === "callback-contract") return t("gate.callbackContract");
    if (key === "idempotency-evidence") return t("gate.idempotencyEvidence");
    if (key === "reconciliation-evidence") {
      return t("gate.reconciliationEvidence");
    }
    return t("gate.manualApproval");
  };

  const gateStatusLabel = (status: PaymentExecutionGateStatus): string => {
    if (status === "passed") return t("gateStatus.passed");
    if (status === "blocked") return t("gateStatus.blocked");
    return t("gateStatus.notEvaluated");
  };

  const evidenceLabel = (evidence: PaymentExecutionEvidenceCode): string => {
    if (evidence === "f07a-3d-assignment-matched") {
      return t("evidence.assignmentMatched");
    }
    if (evidence === "runtime-provider-registered") {
      return t("evidence.runtimeRegistered");
    }
    if (evidence === "adapter-disabled") return t("evidence.adapterDisabled");
    if (evidence === "adapter-missing") return t("evidence.adapterMissing");
    if (evidence === "manual-approval-required") {
      return t("evidence.manualApproval");
    }
    return t("evidence.notEvaluated");
  };

  const blockReasonLabel = (
    reason: PaymentExecutionBlockReason | null,
  ): string => {
    if (reason === null) return t("block.none");
    if (reason === "adapter-disabled") return t("block.adapterDisabled");
    if (reason === "adapter-missing") return t("block.adapterMissing");
    if (reason === "manual-approval-required") {
      return t("block.manualApproval");
    }
    return t("block.operationalEvidence");
  };

  return (
    <div lang={shell.htmlLang} dir={shell.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/payment-execution-readiness",
        }}
        homeHref={`/ui-preview/payment-execution-readiness?locale=${shell.locale}&view=${view}`}
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
                      {t("summary.readiness")}
                    </dt>
                    <dd className="font-bold">
                      {readinessLabel(result.readinessStatus)}
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
                      href={`/ui-preview/payment-execution-readiness?locale=${locale}&view=${view}`}
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
                  href={`/ui-preview/payment-execution-readiness?locale=${shell.locale}&view=${candidate}`}
                  aria-current={view === candidate ? "page" : undefined}
                  className={`rounded-full px-5 py-3 text-sm font-bold ${
                    view === candidate
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {candidate === "readiness"
                    ? t("tabs.readiness")
                    : candidate === "blockers"
                      ? t("tabs.blockers")
                      : candidate === "activation-draft"
                        ? t("tabs.activationDraft")
                        : t("tabs.audit")}
                </Link>
              ))}
            </nav>
          </section>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {view === "readiness" ? (
                <section aria-label={t("labels.readiness")}>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("readiness.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    {t("readiness.description")}
                  </p>
                  <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {result.gates.map((gate) => (
                      <article
                        key={gate.key}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <h3 className="text-xl font-bold text-slate-950">
                          {gateLabel(gate.key)}
                        </h3>
                        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                          <Row
                            label={t("readiness.required")}
                            value={yesNo(gate.required)}
                          />
                          <Row
                            label={t("readiness.status")}
                            value={gateStatusLabel(gate.status)}
                          />
                          <Row
                            label={t("readiness.evidence")}
                            value={evidenceLabel(gate.evidence)}
                          />
                          <Row
                            label={t("readiness.blockReason")}
                            value={blockReasonLabel(gate.blockReason)}
                          />
                        </dl>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {view === "blockers" ? (
                <section aria-label={t("labels.blockers")}>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("blockers.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    {t("blockers.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Row
                      label={t("blockers.count")}
                      value={String(result.blockers.length)}
                    />
                    <Row
                      label={t("blockers.providerKey")}
                      value={assignment.providerAssignment.providerKey}
                    />
                    <Row
                      label={t("blockers.adapterState")}
                      value={adapterLabel(
                        assignment.providerAssignment.adapterState,
                      )}
                    />
                    <Row
                      label={t("blockers.assignmentId")}
                      value={assignment.assignmentId}
                    />
                    <Row
                      label={t("blockers.bindingId")}
                      value={assignment.binding.bindingId}
                    />
                    <Row
                      label={t("blockers.currency")}
                      value={assignment.settlementDraft.providerCurrency}
                    />
                    <Row
                      label={t("blockers.amount")}
                      value={assignment.settlementDraft.providerAmountMinor.toString()}
                    />
                    <Row
                      label={t("blockers.snapshot")}
                      value={
                        assignment.binding.lockedPresentation.snapshot
                          .fingerprint
                      }
                    />
                  </dl>
                  <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    {result.blockers.map((gate) => (
                      <article
                        key={gate.key}
                        className="rounded-3xl border border-amber-200 bg-amber-50 p-6"
                      >
                        <h3 className="font-bold text-amber-950">
                          {gateLabel(gate.key)}
                        </h3>
                        <p className="mt-2 leading-7 text-amber-900">
                          {blockReasonLabel(gate.blockReason)}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {view === "activation-draft" ? (
                <section aria-label={t("labels.activationDraft")}>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("activation.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    {t("activation.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Row
                      label={t("activation.readinessId")}
                      value={result.readinessId}
                    />
                    <Row
                      label={t("activation.status")}
                      value={t("status.blockedPreviewOnly")}
                    />
                    <Row
                      label={t("activation.providerKey")}
                      value={result.activationDraft.providerKey}
                    />
                    <Row
                      label={t("activation.currency")}
                      value={result.activationDraft.providerCurrency}
                    />
                    <Row
                      label={t("activation.amount")}
                      value={result.activationDraft.providerAmountMinor.toString()}
                    />
                    <Row
                      label={t("activation.tokenCreated")}
                      value={yesNo(
                        result.activationDraft.activationTokenCreated,
                      )}
                    />
                    <Row
                      label={t("activation.requestCreated")}
                      value={yesNo(
                        result.activationDraft.providerRequestCreated,
                      )}
                    />
                    <Row
                      label={t("activation.settlementCreated")}
                      value={yesNo(
                        result.activationDraft.settlementInstructionCreated,
                      )}
                    />
                    <Row
                      label={t("activation.registryMutation")}
                      value={yesNo(
                        result.activationDraft.registryMutationCreated,
                      )}
                    />
                    <Row
                      label={t("activation.productionEligible")}
                      value={yesNo(result.activationDraft.productionEligible)}
                    />
                    <Row
                      label={t("activation.executionEligible")}
                      value={yesNo(result.activationDraft.executionEligible)}
                    />
                    <Row
                      label={t("activation.originalDraft")}
                      value={t("status.unassigned")}
                    />
                  </dl>
                </section>
              ) : null}

              {view === "audit" ? (
                <section aria-label={t("labels.audit")}>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("audit.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    {t("audit.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Row label={t("audit.auditId")} value={audit.auditId} />
                    <Row
                      label={t("audit.status")}
                      value={
                        audit.status === "matched"
                          ? t("status.matched")
                          : t("status.mismatch")
                      }
                    />
                    <Row
                      label={t("audit.assignmentMatched")}
                      value={yesNo(audit.checks.providerAssignmentAuditMatched)}
                    />
                    <Row
                      label={t("audit.providerKeyMatches")}
                      value={yesNo(audit.checks.providerKeyMatches)}
                    />
                    <Row
                      label={t("audit.adapterStateMatches")}
                      value={yesNo(audit.checks.adapterStateMatches)}
                    />
                    <Row
                      label={t("audit.currencyMatches")}
                      value={yesNo(audit.checks.providerCurrencyMatches)}
                    />
                    <Row
                      label={t("audit.amountMatches")}
                      value={yesNo(audit.checks.providerAmountMatches)}
                    />
                    <Row
                      label={t("audit.snapshotMatches")}
                      value={yesNo(audit.checks.snapshotFingerprintMatches)}
                    />
                    <Row
                      label={t("audit.readinessMatches")}
                      value={yesNo(audit.checks.readinessStatusMatches)}
                    />
                    <Row
                      label={t("audit.gateSetMatches")}
                      value={yesNo(audit.checks.requiredGateSetMatches)}
                    />
                    <Row
                      label={t("audit.operationalUnverified")}
                      value={yesNo(
                        audit.checks.operationalEvidenceRemainsUnverified,
                      )}
                    />
                    <Row
                      label={t("audit.originalDraftUnassigned")}
                      value={yesNo(
                        audit.checks.originalPaymentDraftRemainsUnassigned,
                      )}
                    />
                    <Row
                      label={t("audit.activationArtifactsAbsent")}
                      value={yesNo(audit.checks.activationArtifactsNotCreated)}
                    />
                    <Row
                      label={t("audit.executionBlocked")}
                      value={yesNo(audit.checks.productionAndExecutionBlocked)}
                    />
                  </dl>
                </section>
              ) : null}

              <button
                type="button"
                disabled
                className="mt-10 cursor-not-allowed rounded-full bg-slate-300 px-6 py-3 font-bold text-slate-600"
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
