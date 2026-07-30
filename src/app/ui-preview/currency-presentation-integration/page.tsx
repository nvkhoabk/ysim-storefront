// F07A-3B_CURRENCY_PRESENTATION_INTEGRATION_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { createCurrencyPresentationTranslator } from "@/i18n/currency-presentation/currency-presentation.registry";
import {
  createCurrencyPresentationModel,
  normalizeCurrencyPresentationContext,
} from "@/lib/currency/currency-presentation";
import type { CurrencyPresentationContext } from "@/lib/currency/currency-presentation.types";

interface PreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const CONTEXTS: readonly CurrencyPresentationContext[] = [
  "home",
  "listing",
  "detail",
  "transaction",
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

export default async function CurrencyPresentationIntegrationPage({
  searchParams,
}: PreviewProps) {
  const params = await searchParams;
  const view = normalizeCurrencyPresentationContext(params.view);
  const model = createCurrencyPresentationModel(params.locale, view);
  const shell = createLocalizedShellBundle(
    model.snapshot.targetCurrency === "VND"
      ? "vi"
      : model.snapshot.targetCurrency === "LAK"
        ? "lo"
        : "en",
  );
  const t = createCurrencyPresentationTranslator(shell.locale);
  const contextHeading = t(`${view}.heading`);
  const contextDescription = t(`${view}.description`);
  const contextNote = t(`${view}.note`);
  const contextAction = t(`${view}.action`);
  const roleLabel =
    model.role === "checkout-preview"
      ? t("common.checkoutPreview")
      : t("common.indicative");

  return (
    <div lang={shell.htmlLang} dir={shell.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/currency-presentation-integration",
        }}
        homeHref={`/ui-preview/currency-presentation-integration?locale=${shell.locale}&view=${view}`}
      >
        <article aria-label={t("labels.preview")}>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  F07A-3B · {model.snapshot.targetCurrency} · {model.context}
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
              <aside
                aria-label={t("labels.safety")}
                className="rounded-3xl border border-white/20 bg-white/10 p-6"
              >
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
                      href={`/ui-preview/currency-presentation-integration?locale=${locale}&view=${view}`}
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
              {CONTEXTS.map((candidate) => (
                <Link
                  key={candidate}
                  href={`/ui-preview/currency-presentation-integration?locale=${shell.locale}&view=${candidate}`}
                  aria-current={candidate === view ? "page" : undefined}
                  className={`rounded-full px-5 py-3 text-sm font-bold ${candidate === view ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  {t(`tabs.${candidate}`)}
                </Link>
              ))}
            </nav>
          </section>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
              <section
                aria-label={t("labels.contextCard")}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-3xl font-bold text-slate-950">
                  {contextHeading}
                </h2>
                <p className="mt-4 leading-7 text-slate-600">
                  {contextDescription}
                </p>
                <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  {contextNote}
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-8 cursor-not-allowed rounded-full bg-slate-300 px-6 py-3 font-bold text-slate-600"
                >
                  {contextAction}
                </button>
              </section>

              <section
                aria-label={t("labels.priceCard")}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-100 p-6">
                    <p className="text-sm font-semibold text-slate-500">
                      {t("common.sourcePrice")}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {model.formattedSource}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-emerald-100 p-6">
                    <p className="text-sm font-semibold text-emerald-800">
                      {t("common.displayPrice")}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-950">
                      {model.formattedTarget}
                    </p>
                  </div>
                </div>
                <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                  <Row label={t("common.context")} value={model.context} />
                  <Row label={t("common.displayRole")} value={roleLabel} />
                  <Row
                    label={t("common.sourceCurrency")}
                    value={model.sourceCurrency}
                  />
                  <Row
                    label={t("common.targetCurrency")}
                    value={model.targetCurrency}
                  />
                  <Row label={t("common.quoteId")} value={model.quoteId} />
                  <Row
                    label={t("common.quoteStatus")}
                    value={t("common.valid")}
                  />
                  <Row
                    label={t("common.snapshotCapturedAt")}
                    value={model.snapshot.capturedAt}
                  />
                  <Row
                    label={t("common.snapshotFingerprint")}
                    value={model.snapshot.fingerprint}
                  />
                  <Row
                    label={t("common.presentationId")}
                    value={model.presentationId}
                  />
                  <Row
                    label={t("common.productionEligible")}
                    value={t("common.no")}
                  />
                </dl>
              </section>
            </div>
          </section>
        </article>
      </PageShell>
    </div>
  );
}
