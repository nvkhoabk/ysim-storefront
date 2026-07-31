// F07A-3R_PAYMENT_SANDBOX_ACTIVATION_TOKEN_R1

import Link from "next/link";
import { PageShell } from "@/components/layout";
import {
  createPaymentSandboxActivationTokenTranslator,
  normalizePaymentSandboxActivationTokenView,
} from "@/i18n/payment-sandbox-activation-token/payment-sandbox-activation-token.registry";
import type { PaymentSandboxActivationTokenMessageKey } from "@/i18n/payment-sandbox-activation-token/payment-sandbox-activation-token.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { createPaymentSandboxApprovalCandidate } from "@/lib/payments/payment-sandbox-approval-candidate";
import { createPaymentSandboxApprovalIssuance } from "@/lib/payments/payment-sandbox-approval-issuance";
import { createPaymentSandboxApprovalReviewHandoff } from "@/lib/payments/payment-sandbox-approval-review-handoff";
import { createPaymentSandboxApprovalToken } from "@/lib/payments/payment-sandbox-approval-token";
import { createPaymentSandboxActivationCandidate } from "@/lib/payments/payment-sandbox-activation-candidate";
import {
  auditPaymentSandboxActivationToken,
  createPaymentSandboxActivationToken,
} from "@/lib/payments/payment-sandbox-activation-token";
import { createPaymentSandboxReviewDecision } from "@/lib/payments/payment-sandbox-review-decision";
import { createPaymentSandboxReviewDecisionIssuance } from "@/lib/payments/payment-sandbox-review-decision-issuance";
import { createPaymentSandboxReviewerAssignment } from "@/lib/payments/payment-sandbox-reviewer-assignment";
import { createPaymentSandboxReviewerAttestation } from "@/lib/payments/payment-sandbox-reviewer-attestation";
import type {
  PaymentSandboxActivationTokenStatus,
  PaymentSandboxActivationTokenView,
} from "@/lib/payments/payment-sandbox-activation-token.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}
const VIEWS: readonly PaymentSandboxActivationTokenView[] = [
  "token",
  "eligibility",
  "token-envelope",
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

export default async function PaymentSandboxActivationTokenPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizePaymentSandboxActivationTokenView(params.view);
  const t = createPaymentSandboxActivationTokenTranslator(shell.locale);
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
  const result = createPaymentSandboxActivationToken(
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
  const audit = auditPaymentSandboxActivationToken(
    result,
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
  const statusLabel = (status: PaymentSandboxActivationTokenStatus): string =>
    status === "prepared-not-created"
      ? t("status.prepared")
      : status === "blocked-activation-not-prepared"
        ? t("status.activationNotPrepared")
        : status === "blocked-adapter-disabled"
          ? t("status.adapterDisabled")
          : t("status.adapterMissing");
  const tabLabel = (candidate: PaymentSandboxActivationTokenView): string =>
    candidate === "token"
      ? t("tabs.token")
      : candidate === "eligibility"
        ? t("tabs.eligibility")
        : candidate === "token-envelope"
          ? t("tabs.tokenEnvelope")
          : t("tabs.audit");
  const eligibilityRows = [
    ["eligibility.activationAudit", result.eligibility.activationAuditMatched],
    ["eligibility.environment", result.eligibility.environmentSandbox],
    ["eligibility.activationPrepared", result.eligibility.activationPrepared],
    [
      "eligibility.activationNotCreated",
      result.eligibility.activationNotCreated,
    ],
    [
      "eligibility.activationNotPersisted",
      result.eligibility.activationNotPersisted,
    ],
    [
      "eligibility.approvalTokenNotCreated",
      result.eligibility.approvalTokenNotCreated,
    ],
    [
      "eligibility.approvalTokenUnsigned",
      result.eligibility.approvalTokenUnsigned,
    ],
    [
      "eligibility.approvalTokenNotPersisted",
      result.eligibility.approvalTokenNotPersisted,
    ],
    ["eligibility.aliasOpaque", result.eligibility.reviewerAliasOpaque],
    ["eligibility.itemSet", result.eligibility.requiredItemSetComplete],
    ["eligibility.guardrails", result.eligibility.noExecutionGuardrailsIntact],
    ["eligibility.result", result.eligibility.eligibleForPreviewToken],
  ] as const satisfies readonly (readonly [
    PaymentSandboxActivationTokenMessageKey,
    boolean,
  ])[];
  const auditRows = [
    ["audit.schema", audit.checks.schemaMatches],
    ["audit.environment", audit.checks.environmentSandbox],
    ["audit.activationAudit", audit.checks.activationAuditMatched],
    ["audit.upstreamFingerprint", audit.checks.upstreamFingerprintMatches],
    [
      "audit.activationTokenCandidateId",
      audit.checks.activationTokenCandidateIdMatches,
    ],
    ["audit.itemSet", audit.checks.requiredItemSetMatches],
    ["audit.aliasOpaque", audit.checks.reviewerAliasOpaque],
    ["audit.noPii", audit.checks.reviewerPiiAbsent],
    ["audit.noCredential", audit.checks.reviewerCredentialAbsent],
    ["audit.activationNotCreated", audit.checks.activationNotCreated],
    ["audit.activationNotPersisted", audit.checks.activationNotPersisted],
    ["audit.approvalTokenNotCreated", audit.checks.approvalTokenNotCreated],
    ["audit.approvalTokenUnsigned", audit.checks.approvalTokenUnsigned],
    ["audit.approvalTokenNotPersisted", audit.checks.approvalTokenNotPersisted],
    ["audit.activationTokenNotCreated", audit.checks.activationTokenNotCreated],
    ["audit.activationTokenUnsigned", audit.checks.activationTokenUnsigned],
    [
      "audit.activationTokenNotPersisted",
      audit.checks.activationTokenNotPersisted,
    ],
    ["audit.envelopeUnsigned", audit.checks.envelopeUnsigned],
    ["audit.noSecret", audit.checks.envelopeContainsNoSecret],
    ["audit.envelopeNoPii", audit.checks.envelopeContainsNoPii],
    ["audit.notSubmitted", audit.checks.envelopeNotSubmitted],
    [
      "audit.noProviderSettlement",
      audit.checks.providerAndSettlementArtifactsAbsent,
    ],
    ["audit.noRegistryMutation", audit.checks.registryMutationAbsent],
    ["audit.executionBlocked", audit.checks.productionAndExecutionBlocked],
  ] as const satisfies readonly (readonly [
    PaymentSandboxActivationTokenMessageKey,
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
          previewPath: "/ui-preview/payment-sandbox-activation-token",
        }}
        homeHref={`/ui-preview/payment-sandbox-activation-token?locale=${shell.locale}&view=${view}`}
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
                    value={statusLabel(result.tokenStatus)}
                  />
                  <Row
                    label={t("summary.activationTokenCandidateId")}
                    value={result.activationTokenCandidateId}
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
                      href={`/ui-preview/payment-sandbox-activation-token?locale=${locale}&view=${view}`}
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
                  href={`/ui-preview/payment-sandbox-activation-token?locale=${shell.locale}&view=${candidate}`}
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
              {view === "token" ? (
                <div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("token.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("token.description")}
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
                            label={t("field.activationCandidateId")}
                            value={item.activationCandidateId}
                          />
                          <Row
                            label={t("field.tokenPrepared")}
                            value={yesNo(item.tokenPrepared)}
                          />
                          <Row
                            label={t("field.tokenCreated")}
                            value={yesNo(item.tokenCreated)}
                          />
                          <Row
                            label={t("field.tokenSigned")}
                            value={yesNo(item.tokenSigned)}
                          />
                          <Row
                            label={t("field.tokenPersisted")}
                            value={yesNo(item.tokenPersisted)}
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
              {view === "token-envelope" ? (
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
                      value={result.tokenEnvelope.mediaType}
                    />
                    <Row
                      label={t("envelope.signed")}
                      value={yesNo(result.tokenEnvelope.signed)}
                    />
                    <Row
                      label={t("envelope.containsSecret")}
                      value={yesNo(result.tokenEnvelope.containsSecret)}
                    />
                    <Row
                      label={t("envelope.containsPii")}
                      value={yesNo(result.tokenEnvelope.containsPii)}
                    />
                    <Row
                      label={t("envelope.submitted")}
                      value={yesNo(result.tokenEnvelope.submitted)}
                    />
                    <Row
                      label={t("envelope.persisted")}
                      value={yesNo(result.tokenEnvelope.persisted)}
                    />
                  </dl>
                  <h3 className="mt-8 text-xl font-bold text-slate-950">
                    {t("envelope.body")}
                  </h3>
                  <pre className="mt-4 overflow-x-auto rounded-3xl bg-slate-950 p-6 text-sm text-emerald-100">
                    {JSON.stringify(result.tokenEnvelope.body, null, 2)}
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
