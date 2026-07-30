// F07A-3C_CURRENCY_TRANSACTION_BINDING_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  createCurrencyTransactionBindingTranslator,
  normalizeCurrencyTransactionBindingView,
} from "@/i18n/currency-transaction-binding/currency-transaction-binding.registry";
import {
  auditCurrencyTransactionBinding,
  createCurrencyTransactionBinding,
} from "@/lib/currency/currency-transaction-binding";
import type { CurrencyTransactionBindingView } from "@/lib/currency/currency-transaction-binding.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const VIEWS: readonly CurrencyTransactionBindingView[] = [
  "checkout-lock",
  "payment-draft",
  "order-record",
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

export default async function CurrencyTransactionBindingPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const shell = createLocalizedShellBundle(params.locale);
  const view = normalizeCurrencyTransactionBindingView(params.view);
  const t = createCurrencyTransactionBindingTranslator(shell.locale);
  const binding = createCurrencyTransactionBinding(shell.locale);
  const audit = auditCurrencyTransactionBinding(binding);
  const presentation = binding.lockedPresentation;

  const context = {
    "checkout-lock": {
      heading: t("checkout.heading"),
      description: t("checkout.description"),
      note: t("checkout.note"),
      action: t("checkout.action"),
    },
    "payment-draft": {
      heading: t("payment.heading"),
      description: t("payment.description"),
      note: t("payment.note"),
      action: t("payment.action"),
    },
    "order-record": {
      heading: t("order.heading"),
      description: t("order.description"),
      note: t("order.note"),
      action: t("order.action"),
    },
    audit: {
      heading: t("audit.heading"),
      description: t("audit.description"),
      note: t("audit.note"),
      action: t("audit.action"),
    },
  }[view];

  const localeHref = (locale: "vi" | "en" | "lo") =>
    `/ui-preview/currency-transaction-binding?locale=${locale}&view=${view}`;
  const viewHref = (candidate: CurrencyTransactionBindingView) =>
    `/ui-preview/currency-transaction-binding?locale=${shell.locale}&view=${candidate}`;

  return (
    <div lang={shell.htmlLang} dir={shell.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/currency-transaction-binding",
        }}
        homeHref={localeHref(shell.locale)}
      >
        <article aria-label={t("labels.preview")}>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  F07A-3C · {shell.marketId} · {shell.currency}
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
                <p className="text-sm leading-6 text-emerald-50">
                  {t("preview.sourceAuthority")}
                </p>
                <nav
                  aria-label={t("labels.localeNavigation")}
                  className="mt-6 flex gap-2"
                >
                  {(["vi", "en", "lo"] as const).map((locale) => (
                    <Link
                      key={locale}
                      href={localeHref(locale)}
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
                  href={viewHref(candidate)}
                  aria-current={candidate === view ? "page" : undefined}
                  className={`rounded-full px-5 py-3 text-sm font-bold ${
                    candidate === view
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {t(`tabs.${candidate}`)}
                </Link>
              ))}
            </nav>
          </section>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
              <section
                aria-label={t("labels.contextCard")}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-3xl font-bold text-slate-950">
                  {context.heading}
                </h2>
                <p className="mt-4 leading-7 text-slate-600">
                  {context.description}
                </p>
                <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  {context.note}
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-8 cursor-not-allowed rounded-full bg-slate-300 px-6 py-3 font-bold text-slate-600"
                >
                  {context.action}
                </button>
              </section>

              <section
                aria-label={t("labels.detailsCard")}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-100 p-6">
                    <p className="text-sm font-semibold text-slate-500">
                      {t("common.sourcePrice")}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {presentation.formattedSource}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-emerald-100 p-6">
                    <p className="text-sm font-semibold text-emerald-800">
                      {t("common.presentedPrice")}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-950">
                      {presentation.formattedTarget}
                    </p>
                  </div>
                </div>

                <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                  <Row
                    label={t("common.bindingId")}
                    value={binding.bindingId}
                  />
                  <Row
                    label={t("common.presentationId")}
                    value={presentation.presentationId}
                  />
                  <Row
                    label={t("common.quoteId")}
                    value={presentation.quoteId}
                  />
                  <Row
                    label={t("common.snapshotFingerprint")}
                    value={presentation.snapshot.fingerprint}
                  />
                  <Row
                    label={t("common.sourceCurrency")}
                    value={binding.sourceCurrency}
                  />
                  <Row
                    label={t("common.presentedCurrency")}
                    value={binding.presentedCurrency}
                  />
                  <Row
                    label={t("common.productionEligible")}
                    value={t("common.no")}
                  />
                  <Row
                    label={t("common.purpose")}
                    value={t("common.previewOnly")}
                  />

                  {view === "checkout-lock" ? (
                    <>
                      <Row
                        label={t("checkout.lockStatus")}
                        value={binding.checkoutLock.status}
                      />
                      <Row
                        label={t("common.lockedAt")}
                        value={binding.checkoutLock.lockedAt}
                      />
                      <Row
                        label={t("checkout.immutable")}
                        value={t("common.yes")}
                      />
                    </>
                  ) : null}

                  {view === "payment-draft" ? (
                    <>
                      <Row
                        label={t("payment.providerStatus")}
                        value={binding.paymentDraft.status}
                      />
                      <Row
                        label={t("payment.providerId")}
                        value={t("common.none")}
                      />
                      <Row
                        label={t("payment.requestedCurrency")}
                        value={t("common.none")}
                      />
                      <Row
                        label={t("payment.requestedAmount")}
                        value={t("common.none")}
                      />
                      <Row
                        label={t("payment.settlementInstruction")}
                        value={t("common.notCreated")}
                      />
                    </>
                  ) : null}

                  {view === "order-record" ? (
                    <>
                      <Row
                        label={t("order.recordId")}
                        value={binding.orderRecord.recordId}
                      />
                      <Row
                        label={t("order.orderCode")}
                        value={binding.orderRecord.orderCode}
                      />
                      <Row
                        label={t("order.amountSource")}
                        value={binding.orderRecord.amountSource}
                      />
                      <Row
                        label={t("order.recordImmutable")}
                        value={t("common.yes")}
                      />
                    </>
                  ) : null}

                  {view === "audit" ? (
                    <>
                      <Row
                        label={t("audit.overallStatus")}
                        value={
                          audit.status === "matched"
                            ? t("common.matched")
                            : t("common.mismatch")
                        }
                      />
                      <Row
                        label={t("audit.sourceCurrency")}
                        value={
                          audit.checks.sourceCurrencyMatches
                            ? t("common.yes")
                            : t("common.no")
                        }
                      />
                      <Row
                        label={t("audit.quoteId")}
                        value={
                          audit.checks.quoteIdMatches
                            ? t("common.yes")
                            : t("common.no")
                        }
                      />
                      <Row
                        label={t("audit.presentedCurrency")}
                        value={
                          audit.checks.presentedCurrencyMatches
                            ? t("common.yes")
                            : t("common.no")
                        }
                      />
                      <Row
                        label={t("audit.presentedAmount")}
                        value={
                          audit.checks.presentedAmountMatches
                            ? t("common.yes")
                            : t("common.no")
                        }
                      />
                      <Row
                        label={t("audit.snapshotFingerprint")}
                        value={
                          audit.checks.snapshotFingerprintMatches
                            ? t("common.yes")
                            : t("common.no")
                        }
                      />
                      <Row
                        label={t("audit.productionEligibility")}
                        value={
                          audit.checks.productionEligibilityMatches
                            ? t("common.yes")
                            : t("common.no")
                        }
                      />
                      <Row
                        label={t("audit.paymentDraft")}
                        value={
                          audit.checks.paymentDraftRemainsUnassigned
                            ? t("common.yes")
                            : t("common.no")
                        }
                      />
                    </>
                  ) : null}
                </dl>
              </section>
            </div>
          </section>
        </article>
      </PageShell>
    </div>
  );
}
