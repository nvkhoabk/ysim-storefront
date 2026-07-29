// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createCurrencyTranslator,
  normalizeCurrencyLocale,
  normalizeCurrencyQuoteView,
} from "@/i18n/currency/currency.registry";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  createCurrencyQuoteResult,
  PREVIEW_EXPIRED_AT,
  PREVIEW_VALID_AT,
} from "@/lib/currency/currency-quote";
import {
  createPriceDisplaySnapshot,
  validatePriceDisplaySnapshot,
} from "@/lib/currency/currency-snapshot";

interface CurrencyQuoteSnapshotPreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

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
      <dd className="mt-1 font-bold break-all text-slate-950">{value}</dd>
    </div>
  );
}

export default async function CurrencyQuoteSnapshotPreviewPage({
  searchParams,
}: CurrencyQuoteSnapshotPreviewProps) {
  const params = await searchParams;
  const locale = normalizeCurrencyLocale(params.locale);
  const shell = createLocalizedShellBundle(locale);
  const view = normalizeCurrencyQuoteView(params.view);
  const t = createCurrencyTranslator(shell.locale);
  const evaluatedAt =
    view === "expired" ? PREVIEW_EXPIRED_AT : PREVIEW_VALID_AT;
  const result = createCurrencyQuoteResult(shell.locale, evaluatedAt);
  const snapshot = createPriceDisplaySnapshot(result);
  validatePriceDisplaySnapshot(snapshot);
  const statusLabel =
    result.status === "valid" ? t("common.valid") : t("common.expired");

  return (
    <div lang={shell.htmlLang} dir={shell.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/currency-quote-snapshot",
        }}
        homeHref={`/ui-preview/currency-quote-snapshot?locale=${shell.locale}&view=${view}`}
      >
        <article aria-label={t("labels.preview")}>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  F07A-3A · {result.marketId} · {result.quote.targetCurrency}
                </p>
                <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
                  {t("preview.title")}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-emerald-50">
                  {t("preview.description")}
                </p>
                <p className="mt-5 rounded-2xl border border-amber-200/30 bg-amber-100/10 p-4 text-sm leading-6 text-amber-50">
                  {t("preview.fixtureWarning")}
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
                      href={`/ui-preview/currency-quote-snapshot?locale=${locale}&view=${view}`}
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
              {(["quote", "rounding", "snapshot", "expired"] as const).map(
                (candidate) => (
                  <Link
                    key={candidate}
                    href={`/ui-preview/currency-quote-snapshot?locale=${shell.locale}&view=${candidate}`}
                    aria-current={candidate === view ? "page" : undefined}
                    className={`rounded-full px-5 py-3 text-sm font-bold ${candidate === view ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    {t(`views.${candidate}`)}
                  </Link>
                ),
              )}
            </nav>
          </section>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {view === "quote" ? (
                <section
                  aria-label={t("labels.quoteCard")}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("quote.heading")}
                  </h2>
                  <p className="mt-3 leading-7 text-slate-600">
                    {t("quote.notice")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Row
                      label={t("common.sourceAmount")}
                      value={result.formattedSource}
                    />
                    <Row
                      label={t("common.targetAmount")}
                      value={result.formattedTarget}
                    />
                    <Row label={t("common.market")} value={result.marketId} />
                    <Row
                      label={t("common.sourceCurrency")}
                      value={result.quote.sourceCurrency}
                    />
                    <Row
                      label={t("common.targetCurrency")}
                      value={result.quote.targetCurrency}
                    />
                    <Row label={t("common.status")} value={statusLabel} />
                  </dl>
                </section>
              ) : null}

              {view === "rounding" ? (
                <section
                  aria-label={t("labels.calculationCard")}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("rounding.heading")}
                  </h2>
                  <p className="mt-3 leading-7 text-slate-600">
                    {t("rounding.formula")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Row
                      label={t("common.sourceMinor")}
                      value={result.sourceAmountMinor.toString()}
                    />
                    <Row
                      label={t("common.numerator")}
                      value={result.quote.rate.numerator.toString()}
                    />
                    <Row
                      label={t("common.denominator")}
                      value={result.quote.rate.denominator.toString()}
                    />
                    <Row
                      label={t("common.targetMinor")}
                      value={result.targetAmountMinor.toString()}
                    />
                    <Row
                      label={t("common.roundingMode")}
                      value={t("common.halfAway")}
                    />
                    <Row
                      label={t("common.targetAmount")}
                      value={result.formattedTarget}
                    />
                  </dl>
                  <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                    {t("rounding.result")}
                  </p>
                </section>
              ) : null}

              {view === "snapshot" ? (
                <section
                  aria-label={t("labels.snapshotCard")}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("snapshot.heading")}
                  </h2>
                  <p className="mt-3 leading-7 text-slate-600">
                    {t("snapshot.notice")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Row label={t("common.quoteId")} value={snapshot.quoteId} />
                    <Row
                      label={t("common.provider")}
                      value={snapshot.providerId}
                    />
                    <Row
                      label={t("common.rateVersion")}
                      value={snapshot.rateVersion}
                    />
                    <Row
                      label={t("common.effectiveAt")}
                      value={snapshot.rateEffectiveAt}
                    />
                    <Row
                      label={t("common.quotedAt")}
                      value={snapshot.quotedAt}
                    />
                    <Row
                      label={t("common.expiresAt")}
                      value={snapshot.expiresAt}
                    />
                    <Row label={t("common.purpose")} value={snapshot.purpose} />
                    <Row
                      label={t("common.fingerprint")}
                      value={snapshot.fingerprint}
                    />
                  </dl>
                </section>
              ) : null}

              {view === "expired" ? (
                <section
                  aria-label={t("labels.expiredCard")}
                  className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="text-3xl font-bold text-slate-950">
                    {t("expired.heading")}
                  </h2>
                  <p className="mt-3 leading-7 text-slate-600">
                    {t("expired.notice")}
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Row label={t("common.status")} value={statusLabel} />
                    <Row
                      label={t("common.evaluatedAt")}
                      value={result.evaluatedAt}
                    />
                    <Row
                      label={t("common.expiresAt")}
                      value={result.quote.expiresAt}
                    />
                    <Row
                      label={t("common.quoteId")}
                      value={result.quote.quoteId}
                    />
                  </dl>
                  <button
                    type="button"
                    disabled
                    className="mt-8 cursor-not-allowed rounded-full bg-slate-300 px-6 py-3 font-bold text-slate-600"
                  >
                    {t("expired.action")}
                  </button>
                </section>
              ) : null}
            </div>
          </section>
        </article>
      </PageShell>
    </div>
  );
}
