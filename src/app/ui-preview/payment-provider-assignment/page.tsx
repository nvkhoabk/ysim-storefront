// F07A-3D_PAYMENT_PROVIDER_ASSIGNMENT_POLICY_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createPaymentProviderAssignmentTranslator,
  normalizePaymentProviderAssignmentView,
} from "@/i18n/payment-provider-assignment/payment-provider-assignment.registry";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  auditPaymentProviderAssignmentPolicy,
  createPaymentProviderAssignmentPolicy,
  PAYMENT_PROVIDER_POLICY_RULES,
} from "@/lib/payments/payment-provider-assignment";
import type {
  PaymentProviderAssignmentView,
  ProviderAdapterState,
  ProviderCompatibilityStatus,
} from "@/lib/payments/payment-provider-assignment.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentProviderAssignmentView[] = [
  "policy",
  "assignment",
  "settlement-draft",
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

export default async function PaymentProviderAssignmentPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentProviderAssignmentView(params.view);
  const t = createPaymentProviderAssignmentTranslator(shell.locale);
  const result = createPaymentProviderAssignmentPolicy(shell.locale);
  const audit = auditPaymentProviderAssignmentPolicy(result);

  const adapterLabel = (state: ProviderAdapterState): string => {
    if (state === "runtime-registered") return t("status.runtimeRegistered");
    if (state === "adapter-disabled") return t("status.adapterDisabled");
    return t("status.adapterMissing");
  };
  const compatibilityLabel = (status: ProviderCompatibilityStatus): string => {
    if (status === "compatible-preview") return t("status.compatiblePreview");
    if (status === "blocked-adapter-disabled") {
      return t("status.blockedAdapterDisabled");
    }
    return t("status.blockedAdapterMissing");
  };
  const yesNo = (value: boolean): string =>
    value ? t("common.yes") : t("common.no");

  return (
    <div lang={shell.htmlLang} dir={shell.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/payment-provider-assignment",
        }}
        homeHref={`/ui-preview/payment-provider-assignment?locale=${shell.locale}&view=${view}`}
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
                    <dt className="text-emerald-200">
                      {t("assignment.marketId")}
                    </dt>
                    <dd className="font-bold">{result.marketId}</dd>
                  </div>
                  <div>
                    <dt className="text-emerald-200">
                      {t("assignment.providerLabel")}
                    </dt>
                    <dd className="font-bold">
                      {result.providerAssignment.providerLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-emerald-200">
                      {t("assignment.executionEligible")}
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
                      href={`/ui-preview/payment-provider-assignment?locale=${locale}&view=${view}`}
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
                  href={`/ui-preview/payment-provider-assignment?locale=${shell.locale}&view=${candidate}`}
                  aria-current={view === candidate ? "page" : undefined}
                  className={`rounded-full px-5 py-3 text-sm font-bold ${
                    view === candidate
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {candidate === "policy"
                    ? t("tabs.policy")
                    : candidate === "assignment"
                      ? t("tabs.assignment")
                      : candidate === "settlement-draft"
                        ? t("tabs.settlementDraft")
                        : t("tabs.audit")}
                </Link>
              ))}
            </nav>
          </section>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {view === "policy" ? (
                <section aria-label={t("labels.policyGrid")}>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("policy.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    {t("policy.description")}
                  </p>
                  <div className="mt-8 grid gap-5 lg:grid-cols-3">
                    {PAYMENT_PROVIDER_POLICY_RULES.map((rule) => (
                      <article
                        key={rule.marketId}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <h3 className="text-xl font-bold text-slate-950">
                          {rule.providerLabel}
                        </h3>
                        <dl className="mt-5 grid gap-3">
                          <Row
                            label={t("policy.market")}
                            value={rule.marketId}
                          />
                          <Row label={t("policy.locale")} value={rule.locale} />
                          <Row
                            label={t("policy.currency")}
                            value={rule.currency}
                          />
                          <Row label={t("policy.rail")} value={rule.rail} />
                          <Row
                            label={t("policy.runtimeProvider")}
                            value={
                              rule.runtimeProviderId ?? t("common.notAssigned")
                            }
                          />
                          <Row
                            label={t("policy.adapterState")}
                            value={adapterLabel(rule.adapterState)}
                          />
                          <Row
                            label={t("policy.compatibility")}
                            value={compatibilityLabel(rule.compatibility)}
                          />
                          <Row
                            label={t("policy.executionEligible")}
                            value={t("common.no")}
                          />
                        </dl>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {view === "assignment" ? (
                <section aria-label={t("labels.currentAssignment")}>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("assignment.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    {t("assignment.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Row
                      label={t("assignment.assignmentId")}
                      value={result.assignmentId}
                    />
                    <Row
                      label={t("assignment.bindingId")}
                      value={result.binding.bindingId}
                    />
                    <Row
                      label={t("assignment.marketId")}
                      value={result.marketId}
                    />
                    <Row
                      label={t("assignment.presentedCurrency")}
                      value={result.binding.presentedCurrency}
                    />
                    <Row
                      label={t("assignment.presentedAmount")}
                      value={result.binding.lockedPresentation.targetAmountMinor.toString()}
                    />
                    <Row
                      label={t("assignment.providerKey")}
                      value={result.providerAssignment.providerKey}
                    />
                    <Row
                      label={t("assignment.providerLabel")}
                      value={result.providerAssignment.providerLabel}
                    />
                    <Row
                      label={t("assignment.runtimeProviderId")}
                      value={
                        result.providerAssignment.runtimeProviderId ??
                        t("common.notAssigned")
                      }
                    />
                    <Row
                      label={t("assignment.adapterState")}
                      value={adapterLabel(
                        result.providerAssignment.adapterState,
                      )}
                    />
                    <Row
                      label={t("assignment.compatibility")}
                      value={compatibilityLabel(
                        result.providerAssignment.compatibility,
                      )}
                    />
                    <Row
                      label={t("assignment.status")}
                      value={t("status.assignedPreview")}
                    />
                    <Row
                      label={t("assignment.productionEligible")}
                      value={yesNo(result.productionEligible)}
                    />
                    <Row
                      label={t("assignment.executionEligible")}
                      value={yesNo(result.executionEligible)}
                    />
                    <Row
                      label={t("assignment.originalDraftStatus")}
                      value={result.binding.paymentDraft.status}
                    />
                  </dl>
                </section>
              ) : null}

              {view === "settlement-draft" ? (
                <section aria-label={t("labels.settlementDraft")}>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("settlement.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    {t("settlement.description")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Row
                      label={t("settlement.status")}
                      value={t("status.blockedPreviewOnly")}
                    />
                    <Row
                      label={t("settlement.providerCurrency")}
                      value={result.settlementDraft.providerCurrency}
                    />
                    <Row
                      label={t("settlement.providerAmount")}
                      value={result.settlementDraft.providerAmountMinor.toString()}
                    />
                    <Row
                      label={t("settlement.instructionCreated")}
                      value={yesNo(
                        result.settlementDraft.settlementInstructionCreated,
                      )}
                    />
                    <Row
                      label={t("settlement.providerRequestCreated")}
                      value={yesNo(
                        result.settlementDraft.providerRequestCreated,
                      )}
                    />
                    <Row
                      label={t("settlement.blockReason")}
                      value={result.settlementDraft.blockReason}
                    />
                    <Row
                      label={t("settlement.snapshotFingerprint")}
                      value={
                        result.binding.lockedPresentation.snapshot.fingerprint
                      }
                    />
                    <Row
                      label={t("settlement.quoteId")}
                      value={result.binding.lockedPresentation.quoteId}
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
                      label={t("audit.marketRuleMatches")}
                      value={yesNo(audit.checks.marketRuleMatches)}
                    />
                    <Row
                      label={t("audit.bindingCurrencyMatches")}
                      value={yesNo(audit.checks.bindingCurrencyMatches)}
                    />
                    <Row
                      label={t("audit.providerKeyMatches")}
                      value={yesNo(audit.checks.providerKeyMatches)}
                    />
                    <Row
                      label={t("audit.runtimeProviderMatches")}
                      value={yesNo(audit.checks.runtimeProviderMatches)}
                    />
                    <Row
                      label={t("audit.providerCurrencyMatches")}
                      value={yesNo(audit.checks.providerCurrencyMatches)}
                    />
                    <Row
                      label={t("audit.providerAmountMatches")}
                      value={yesNo(audit.checks.providerAmountMatches)}
                    />
                    <Row
                      label={t("audit.snapshotMatches")}
                      value={yesNo(audit.checks.snapshotFingerprintMatches)}
                    />
                    <Row
                      label={t("audit.adapterStateMatches")}
                      value={yesNo(audit.checks.adapterStateMatches)}
                    />
                    <Row
                      label={t("audit.originalDraftUnassigned")}
                      value={yesNo(
                        audit.checks.originalPaymentDraftRemainsUnassigned,
                      )}
                    />
                    <Row
                      label={t("audit.settlementNotCreated")}
                      value={yesNo(
                        audit.checks.settlementInstructionNotCreated,
                      )}
                    />
                    <Row
                      label={t("audit.providerRequestNotCreated")}
                      value={yesNo(audit.checks.providerRequestNotCreated)}
                    />
                    <Row
                      label={t("audit.productionBlocked")}
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
