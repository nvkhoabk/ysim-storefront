// F07A-3I_PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_CANDIDATE_R3

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createPaymentSandboxApprovalReviewHandoffTranslator,
  normalizePaymentSandboxApprovalReviewHandoffView,
} from "@/i18n/payment-sandbox-approval-review-handoff/payment-sandbox-approval-review-handoff.registry";
import type { PaymentSandboxApprovalReviewHandoffMessageKey } from "@/i18n/payment-sandbox-approval-review-handoff/payment-sandbox-approval-review-handoff.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  auditPaymentSandboxApprovalReviewHandoff,
  createPaymentSandboxApprovalReviewHandoff,
} from "@/lib/payments/payment-sandbox-approval-review-handoff";
import type {
  PaymentSandboxApprovalReviewHandoffItemKey,
  PaymentSandboxApprovalReviewHandoffItemStatus,
  PaymentSandboxApprovalReviewHandoffView,
} from "@/lib/payments/payment-sandbox-approval-review-handoff.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly PaymentSandboxApprovalReviewHandoffView[] = [
  "handoff",
  "checklist",
  "export-envelope",
  "audit",
];

async function loadSandboxApprovalRequest(locale: string): Promise<unknown> {
  const approvalRequestModule = await import(
    "@/lib/payments/payment-sandbox-approval-request"
  );
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

export default async function PaymentSandboxApprovalReviewHandoffPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentSandboxApprovalReviewHandoffView(params.view);
  const t = createPaymentSandboxApprovalReviewHandoffTranslator(shell.locale);
  const upstreamRequest = await loadSandboxApprovalRequest(shell.locale);
  const result = createPaymentSandboxApprovalReviewHandoff(upstreamRequest);
  const audit = auditPaymentSandboxApprovalReviewHandoff(result);

  const yesNo = (value: boolean): string =>
    value ? t("common.yes") : t("common.no");
  const itemLabel = (
    key: PaymentSandboxApprovalReviewHandoffItemKey,
  ): string => {
    if (key === "request-identity") return t("item.requestIdentity");
    if (key === "verification-binding") return t("item.verificationBinding");
    if (key === "approval-prerequisites") {
      return t("item.approvalPrerequisites");
    }
    return t("item.noExecutionGuardrails");
  };
  const statusLabel = (
    status: PaymentSandboxApprovalReviewHandoffItemStatus,
  ): string => {
    if (status === "pending-manual-review") return t("status.pendingReview");
    if (status === "blocked-adapter-disabled") {
      return t("status.adapterDisabled");
    }
    return t("status.adapterMissing");
  };
  const tabLabel = (candidate: PaymentSandboxApprovalReviewHandoffView): string => {
    if (candidate === "handoff") return t("tabs.handoff");
    if (candidate === "checklist") return t("tabs.checklist");
    if (candidate === "export-envelope") return t("tabs.exportEnvelope");
    return t("tabs.audit");
  };

  const checklist = [
    "checklist.upstreamBound",
    "checklist.safeSummaryOnly",
    "checklist.unsigned",
    "checklist.nonSecret",
    "checklist.noDecision",
    "checklist.noExecution",
  ] as const satisfies readonly PaymentSandboxApprovalReviewHandoffMessageKey[];

  const auditRows = [
    ["audit.schema", audit.checks.schemaMatches],
    ["audit.environment", audit.checks.environmentSandbox],
    ["audit.upstreamFingerprint", audit.checks.upstreamFingerprintMatches],
    ["audit.itemSet", audit.checks.requiredItemSetMatches],
    ["audit.itemStatuses", audit.checks.itemStatusesMatchAdapterState],
    ["audit.reviewerAbsent", audit.checks.reviewerIdentityAbsent],
    ["audit.decisionAbsent", audit.checks.reviewDecisionAbsent],
    ["audit.unsigned", audit.checks.exportEnvelopeUnsigned],
    ["audit.noSecret", audit.checks.exportEnvelopeContainsNoSecret],
    ["audit.notSubmitted", audit.checks.exportEnvelopeNotSubmitted],
    [
      "audit.approvalArtifactsAbsent",
      audit.checks.approvalAndActivationArtifactsAbsent,
    ],
    [
      "audit.providerArtifactsAbsent",
      audit.checks.providerAndSettlementArtifactsAbsent,
    ],
    ["audit.registryMutationAbsent", audit.checks.registryMutationAbsent],
    ["audit.executionBlocked", audit.checks.productionAndExecutionBlocked],
  ] as const satisfies readonly (readonly [
    PaymentSandboxApprovalReviewHandoffMessageKey,
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
          previewPath: "/ui-preview/payment-sandbox-approval-review-handoff",
        }}
        homeHref={`/ui-preview/payment-sandbox-approval-review-handoff?locale=${shell.locale}&view=${view}`}
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
                  <Row label={t("summary.provider")} value={result.upstreamSummary.providerKey} />
                  <Row label={t("summary.status")} value={result.handoffStatus} />
                  <Row label={t("summary.fingerprint")} value={result.upstreamRequestFingerprint} />
                  <Row label={t("summary.itemCount")} value={String(result.items.length)} />
                  <Row label={t("summary.executionEligible")} value={yesNo(result.executionEligible)} />
                </dl>
                <p className="mt-5 text-sm leading-6 text-emerald-50">
                  {t("preview.safety")}
                </p>
                <nav aria-label={t("labels.localeNavigation")} className="mt-6 flex gap-2">
                  {(["vi", "en", "lo"] as const).map((locale) => (
                    <Link
                      key={locale}
                      href={`/ui-preview/payment-sandbox-approval-review-handoff?locale=${locale}&view=${view}`}
                      aria-current={locale === shell.locale ? "page" : undefined}
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
            <nav aria-label={t("labels.tabs")} className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 py-5 sm:px-6 lg:px-8">
              {VIEWS.map((candidate) => (
                <Link
                  key={candidate}
                  href={`/ui-preview/payment-sandbox-approval-review-handoff?locale=${shell.locale}&view=${candidate}`}
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
              {view === "handoff" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">{t("handoff.title")}</h2>
                  <p className="mt-3 max-w-3xl text-slate-600">{t("handoff.description")}</p>
                  <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {result.items.map((item) => (
                      <article key={item.key} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-950">{itemLabel(item.key)}</h3>
                        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                          <Row label={t("field.status")} value={statusLabel(item.status)} />
                          <Row label={t("field.reviewerRole")} value={t("review.role")} />
                          <Row label={t("field.reviewMethod")} value={t("review.method")} />
                          <Row label={t("field.reviewerId")} value={t("common.notAssigned")} />
                          <Row label={t("field.reviewedAt")} value={t("common.notAssigned")} />
                          <Row label={t("field.decision")} value={t("common.notAssigned")} />
                        </dl>
                      </article>
                    ))}
                  </div>
                </div>
              ) : view === "checklist" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">{t("checklist.title")}</h2>
                  <p className="mt-3 max-w-3xl text-slate-600">{t("checklist.description")}</p>
                  <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    {checklist.map((key) => (
                      <div key={key} className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-5">
                        <span aria-hidden="true" className="mt-0.5 text-emerald-700">✓</span>
                        <p className="font-semibold text-slate-900">{t(key)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : view === "export-envelope" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">{t("export.title")}</h2>
                  <p className="mt-3 max-w-3xl text-slate-600">{t("export.description")}</p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                    <Row label={t("export.mediaType")} value={result.exportEnvelope.mediaType} />
                    <Row label={t("export.signed")} value={yesNo(result.exportEnvelope.signed)} />
                    <Row label={t("export.containsSecret")} value={yesNo(result.exportEnvelope.containsSecret)} />
                    <Row label={t("export.submitted")} value={yesNo(result.exportEnvelope.submitted)} />
                  </dl>
                  <h3 className="mt-8 text-lg font-bold text-slate-950">{t("export.body")}</h3>
                  <pre className="mt-3 overflow-x-auto rounded-3xl bg-slate-950 p-6 text-sm text-emerald-100">
                    {JSON.stringify(result.exportEnvelope.body, null, 2)}
                  </pre>
                  <button type="button" disabled className="mt-5 cursor-not-allowed rounded-full bg-slate-300 px-5 py-3 font-bold text-slate-600">
                    {t("export.submitted")}: {t("common.no")}
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">{t("audit.title")}</h2>
                  <p className="mt-3 max-w-3xl text-slate-600">{t("audit.description")}</p>
                  <p className="mt-6 inline-flex rounded-full bg-emerald-100 px-4 py-2 font-bold text-emerald-900">
                    {audit.status === "matched" ? t("audit.matched") : t("audit.mismatched")}
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
