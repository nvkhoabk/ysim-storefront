// F07A-2C-1_LOCALIZED_HOME_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import { createLocalizedHomeBundle } from "@/i18n/home/home.config";
import { createHomeTranslator } from "@/i18n/home/home.registry";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";

interface LocalizedHomePreviewProps {
  readonly searchParams: Promise<{ readonly locale?: string }>;
}

const destinationKeys = [
  "destinations.japan",
  "destinations.korea",
  "destinations.thailand",
  "destinations.singapore",
] as const;

const whyItems = [
  ["why.instantTitle", "why.instantDescription"],
  ["why.coverageTitle", "why.coverageDescription"],
  ["why.supportTitle", "why.supportDescription"],
] as const;

const steps = [
  ["steps.chooseTitle", "steps.chooseDescription"],
  ["steps.scanTitle", "steps.scanDescription"],
  ["steps.connectTitle", "steps.connectDescription"],
] as const;

const guides = [
  ["guides.installTitle", "guides.installDescription"],
  ["guides.roamingTitle", "guides.roamingDescription"],
  ["guides.deviceTitle", "guides.deviceDescription"],
] as const;

export default async function LocalizedHomePreviewPage({
  searchParams,
}: LocalizedHomePreviewProps) {
  const { locale } = await searchParams;
  const home = createLocalizedHomeBundle(locale);
  const shell = createLocalizedShellBundle(home.locale);
  const t = createHomeTranslator(home.locale);
  const previewHref = `/ui-preview/localized-home?locale=${home.locale}`;

  return (
    <div lang={home.htmlLang} dir={home.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/localized-home",
        }}
        homeHref={previewHref}
      >
        <article aria-label={t("labels.homePreview")}>
          <section className="bg-[var(--ysim-color-brand-950,#052e2b)] py-16 text-white sm:py-24">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.14em] text-emerald-200 uppercase">
                  {t("hero.eyebrow")}
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-bold sm:text-6xl">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50">
                  {t("hero.description")}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={home.routes.browseEsim}
                    className="rounded-full bg-white px-5 py-3 text-sm font-bold text-emerald-950"
                  >
                    {t("hero.primary")}
                  </Link>
                  <Link
                    href={home.routes.packageAssistant}
                    className="rounded-full border border-white/50 px-5 py-3 text-sm font-bold text-white"
                  >
                    {t("hero.secondary")}
                  </Link>
                </div>
              </div>
              <aside className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <p className="text-xs font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  F07A-2C-1 · {home.marketId} · {home.currency}
                </p>
                <h2 className="mt-3 text-2xl font-bold">
                  {t("preview.title")}
                </h2>
                <p className="mt-4 leading-7 text-emerald-50">
                  {t("preview.description")}
                </p>
                <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-6">
                  {t("preview.candidate")}
                </p>
                <nav
                  aria-label={t("labels.localeNavigation")}
                  className="mt-5 flex gap-2"
                >
                  {(["vi", "en", "lo"] as const).map((candidate) => (
                    <Link
                      key={candidate}
                      href={`/ui-preview/localized-home?locale=${candidate}`}
                      aria-current={
                        candidate === home.locale ? "page" : undefined
                      }
                      className="rounded-full border border-white/30 px-3 py-2 text-xs font-bold"
                    >
                      {candidate.toUpperCase()}
                    </Link>
                  ))}
                </nav>
              </aside>
            </div>
          </section>

          <section className="py-14 sm:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                {t("destinations.eyebrow")}
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold">
                    {t("destinations.title")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("destinations.description")}
                  </p>
                </div>
                <Link
                  href={home.routes.destinations}
                  className="text-sm font-bold text-emerald-700"
                >
                  {t("destinations.viewAll")}
                </Link>
              </div>
              <ul
                aria-label={t("labels.destinationGrid")}
                className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {destinationKeys.map((key) => (
                  <li
                    key={key}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <p className="text-xl font-bold">{t(key)}</p>
                    <Link
                      href={home.routes.destinations}
                      className="mt-5 inline-flex text-sm font-bold text-emerald-700"
                    >
                      {t("destinations.cardAction")}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-slate-50 py-14 sm:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                {t("products.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-bold">{t("products.title")}</h2>
              <p className="mt-3 max-w-3xl text-slate-600">
                {t("products.description")}
              </p>
              <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6">
                {t("preview.dynamicContent")} {t("preview.currencyPending")}
              </p>
              <ul
                aria-label={t("labels.productGrid")}
                className="mt-8 grid gap-5 lg:grid-cols-2"
              >
                {home.catalogProducts.map((product) => (
                  <li
                    key={product.sku}
                    className="rounded-3xl border border-slate-200 bg-white p-6"
                  >
                    <p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                      SKU · {product.sku}
                    </p>
                    <p className="mt-3 text-lg font-bold">
                      {t("products.sourceLabel", {
                        title: product.sourceTitle,
                      })}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {t("products.sourcePending")}
                    </p>
                  </li>
                ))}
              </ul>
              <Link
                href={home.routes.browseEsim}
                className="mt-7 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
              >
                {t("products.viewAll")}
              </Link>
            </div>
          </section>

          <section className="py-14 sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
              <div className="rounded-3xl bg-emerald-700 p-8 text-white">
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-100 uppercase">
                  {t("assistant.eyebrow")}
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  {t("assistant.title")}
                </h2>
                <p className="mt-4 leading-7 text-emerald-50">
                  {t("assistant.description")}
                </p>
                <Link
                  href={home.routes.packageAssistant}
                  className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-emerald-800"
                >
                  {t("assistant.action")}
                </Link>
              </div>
              <div className="rounded-3xl border border-slate-200 p-8">
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                  {t("device.eyebrow")}
                </p>
                <h2 className="mt-3 text-3xl font-bold">{t("device.title")}</h2>
                <p className="mt-4 leading-7 text-slate-600">
                  {t("device.description")}
                </p>
                <Link
                  href={home.routes.deviceCheck}
                  className="mt-6 inline-flex rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-700"
                >
                  {t("device.action")}
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 py-14 sm:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                {t("why.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-bold">{t("why.title")}</h2>
              <p className="mt-3 max-w-3xl text-slate-600">
                {t("why.description")}
              </p>
              <ul
                aria-label={t("labels.whyGrid")}
                className="mt-8 grid gap-5 md:grid-cols-3"
              >
                {whyItems.map(([titleKey, descriptionKey]) => (
                  <li
                    key={titleKey}
                    className="rounded-3xl border border-slate-200 bg-white p-6"
                  >
                    <h3 className="text-xl font-bold">{t(titleKey)}</h3>
                    <p className="mt-3 leading-7 text-slate-600">
                      {t(descriptionKey)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="py-14 sm:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                {t("steps.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-bold">{t("steps.title")}</h2>
              <p className="mt-3 max-w-3xl text-slate-600">
                {t("steps.description")}
              </p>
              <ol
                aria-label={t("labels.stepsList")}
                className="mt-8 grid gap-5 md:grid-cols-3"
              >
                {steps.map(([titleKey, descriptionKey], index) => (
                  <li
                    key={titleKey}
                    className="rounded-3xl border border-slate-200 p-6"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                      {index + 1}
                    </span>
                    <h3 className="mt-5 text-xl font-bold">{t(titleKey)}</h3>
                    <p className="mt-3 leading-7 text-slate-600">
                      {t(descriptionKey)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                {t("reviews.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-bold">{t("reviews.title")}</h2>
              <p className="mx-auto mt-3 max-w-3xl text-emerald-50">
                {t("reviews.description")}
              </p>
              <blockquote className="mx-auto mt-8 max-w-3xl text-2xl leading-10 font-semibold">
                “{t("reviews.quote")}”
              </blockquote>
              <p className="mt-5 text-sm font-bold text-emerald-200">
                {t("reviews.author", { name: "Mai" })}
              </p>
            </div>
          </section>

          <section className="py-14 sm:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                {t("guides.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-bold">{t("guides.title")}</h2>
              <p className="mt-3 max-w-3xl text-slate-600">
                {t("guides.description")}
              </p>
              <ul
                aria-label={t("labels.guideGrid")}
                className="mt-8 grid gap-5 lg:grid-cols-3"
              >
                {guides.map(([titleKey, descriptionKey]) => (
                  <li
                    key={titleKey}
                    className="rounded-3xl border border-slate-200 p-6"
                  >
                    <h3 className="text-xl font-bold">{t(titleKey)}</h3>
                    <p className="mt-3 leading-7 text-slate-600">
                      {t(descriptionKey)}
                    </p>
                    <Link
                      href={home.routes.guides}
                      className="mt-5 inline-flex text-sm font-bold text-emerald-700"
                    >
                      {t("guides.read")}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-emerald-50 py-14 sm:py-20">
            <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                {t("cta.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-bold">{t("cta.title")}</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
                {t("cta.description")}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href={home.routes.browseEsim}
                  className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
                >
                  {t("cta.primary")}
                </Link>
                <Link
                  href={home.routes.support}
                  className="rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-700"
                >
                  {t("cta.secondary")}
                </Link>
              </div>
            </div>
          </section>
        </article>
      </PageShell>
    </div>
  );
}
