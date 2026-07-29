// F07A-2A_STATIC_LOCALIZATION_R1

import type { Metadata } from "next";
import Link from "next/link";
import { getMarketByLocale } from "@/lib/market/market.registry";
import { I18nProvider } from "@/i18n/I18nProvider";
import { loadMessages } from "@/i18n/i18n.loader";
import { SUPPORTED_LOCALES } from "@/i18n/i18n.registry";
import { createTranslator } from "@/i18n/i18n.translate";
import { LocalizationClientSample } from "./LocalizationClientSample";

export const metadata: Metadata = {
  title: "Localization Runtime Preview",
  robots: { index: false, follow: false },
};

interface LocalizationPreviewPageProps {
  readonly searchParams: Promise<{
    readonly locale?: string | string[];
  }>;
}

export default async function LocalizationPreviewPage({
  searchParams,
}: LocalizationPreviewPageProps) {
  const query = await searchParams;
  const requestedLocale = Array.isArray(query.locale)
    ? query.locale[0]
    : query.locale;
  const { locale, messages } = await loadMessages(requestedLocale);
  const market = getMarketByLocale(locale);
  if (!market)
    throw new Error(`LOCALIZATION_PREVIEW_MARKET_NOT_FOUND:${locale}`);

  const t = createTranslator({ locale, messages, mode: "production" });
  const serverGreeting = t("common.greeting.welcome", { brand: "YSim" });

  return (
    <I18nProvider locale={locale} messages={messages}>
      <main
        lang={market.htmlLang}
        dir={market.direction}
        className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900"
      >
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-700 to-green-500 p-8 text-white shadow-lg md:p-12">
            <div className="text-sm font-semibold tracking-[0.18em] text-emerald-100 uppercase">
              F07A-2A
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              {t("market.previewTitle")}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-emerald-50">
              {t("market.previewDescription")}
            </p>
          </div>

          <nav
            className="mt-6 flex flex-wrap gap-3"
            aria-label={t("market.selectorLabel")}
          >
            {SUPPORTED_LOCALES.map((candidateLocale) => {
              const candidateMarket = getMarketByLocale(candidateLocale);
              return (
                <Link
                  key={candidateLocale}
                  href={`/ui-preview/localization?locale=${candidateLocale}`}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    candidateLocale === locale
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500"
                  }`}
                >
                  {candidateMarket?.nativeLabel ?? candidateLocale}
                </Link>
              );
            })}
          </nav>

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-500">
                {t("market.currentMarket")}
              </div>
              <div className="mt-2 text-xl font-bold">{market.nativeLabel}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-500">
                {t("market.language")}
              </div>
              <div className="mt-2 text-xl font-bold">{market.htmlLang}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-500">
                {t("market.currency")}
              </div>
              <div className="mt-2 text-xl font-bold">{market.currency}</div>
            </div>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Server Component</h2>
              <p className="mt-3 text-lg">{serverGreeting}</p>
              <p className="mt-3 text-sm text-slate-600">
                {t("common.itemCount", { count: 3 })}
              </p>
            </div>
            <LocalizationClientSample serverGreeting={serverGreeting} />
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Navigation namespace</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "home",
                "esim",
                "destinations",
                "offers",
                "guides",
                "support",
                "cart",
                "checkout",
              ].map((key) => (
                <span
                  key={key}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm"
                >
                  {t(`navigation.${key}`)}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Actions and status</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white">
                  {t("common.actions.continue")}
                </button>
                <button className="rounded-xl border border-slate-300 px-4 py-2 font-semibold">
                  {t("common.actions.cancel")}
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                {t("common.status.ready")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Validation namespace</h2>
              <ul className="mt-4 space-y-2 text-sm text-rose-700">
                <li>{t("validation.required")}</li>
                <li>{t("validation.invalidEmail")}</li>
                <li>{t("validation.minLength", { min: 6 })}</li>
              </ul>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Production fallback sample</h2>
            <p className="mt-3 text-sm text-slate-600">
              {t("preview.key.that.does.not.exist")}
            </p>
          </section>
        </div>
      </main>
    </I18nProvider>
  );
}
