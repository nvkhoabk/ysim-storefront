// F07A-2C-3_LOCALIZED_DETAIL_CANDIDATE_R4

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createLocalizedDetailBundle,
  relatedProductHref,
} from "@/i18n/detail/detail.config";
import {
  createDetailTranslator,
  normalizeDetailView,
} from "@/i18n/detail/detail.registry";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";

interface LocalizedDetailPreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

export default async function LocalizedDetailsPreviewPage({
  searchParams,
}: LocalizedDetailPreviewProps) {
  const params = await searchParams;
  const detail = createLocalizedDetailBundle(params.locale);
  const shell = createLocalizedShellBundle(detail.locale);
  const t = createDetailTranslator(detail.locale);
  const view = normalizeDetailView(params.view);

  return (
    <div lang={detail.htmlLang} dir={detail.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/localized-details",
        }}
        homeHref={`/ui-preview/localized-details?locale=${detail.locale}&view=${view}`}
      >
        <article aria-label={t("labels.preview")}>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  F07A-2C-3 · {detail.marketId} · {detail.currency}
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
                  {t("preview.dynamicBoundary")}
                </p>
                <p className="mt-4 text-sm leading-6 text-emerald-50">
                  {t("preview.currencyPending", { currency: detail.currency })}
                </p>
                <nav
                  aria-label={t("labels.localeNavigation")}
                  className="mt-6 flex gap-2"
                >
                  {(["vi", "en", "lo"] as const).map((candidate) => (
                    <Link
                      key={candidate}
                      href={`/ui-preview/localized-details?locale=${candidate}&view=${view}`}
                      aria-current={
                        candidate === detail.locale ? "page" : undefined
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

          <section className="border-b border-slate-200 bg-white">
            <nav
              aria-label={t("labels.tabs")}
              className="mx-auto flex w-full max-w-7xl gap-2 px-4 py-5 sm:px-6 lg:px-8"
            >
              <Link
                href={detail.routes.previewProduct}
                aria-current={view === "product" ? "page" : undefined}
                className={`rounded-full px-5 py-3 text-sm font-bold ${
                  view === "product"
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {t("tabs.product")}
              </Link>
              <Link
                href={detail.routes.previewDestination}
                aria-current={view === "destination" ? "page" : undefined}
                className={`rounded-full px-5 py-3 text-sm font-bold ${
                  view === "destination"
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {t("tabs.destination")}
              </Link>
            </nav>
          </section>

          {view === "product" ? (
            <>
              <section className="bg-slate-50 py-12 sm:py-16">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  <nav
                    aria-label={t("labels.breadcrumb")}
                    className="text-sm text-slate-600"
                  >
                    <Link
                      href={detail.routes.productionProductListing}
                      className="font-semibold text-emerald-700"
                    >
                      {t("product.breadcrumbCatalog")}
                    </Link>
                    <span aria-hidden="true" className="px-2">
                      /
                    </span>
                    <span aria-current="page">
                      {t("product.breadcrumbCurrent")}
                    </span>
                  </nav>

                  <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                    <section
                      aria-label={t("labels.productOverview")}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                    >
                      <div className="rounded-3xl bg-gradient-to-br from-emerald-100 via-cyan-50 to-sky-100 p-8">
                        <p className="text-xs font-bold tracking-[0.12em] text-emerald-800 uppercase">
                          {t("product.eyebrow")} · {detail.product.sku}
                        </p>
                        <h2 className="mt-4 text-3xl font-bold text-slate-950">
                          {t("product.sourceTitle", {
                            title: detail.product.sourceTitle,
                          })}
                        </h2>
                        <p className="mt-4 leading-7 text-slate-700">
                          {t("product.sourceDescription", {
                            description: detail.product.sourceDescription,
                          })}
                        </p>
                      </div>

                      <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                        {t("product.sourceNotice")}
                      </p>

                      <section
                        aria-label={t("labels.productMeta")}
                        className="mt-8"
                      >
                        <h3 className="text-xl font-bold">
                          {t("product.overviewTitle")}
                        </h3>
                        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                          {[
                            [
                              t("product.destinationLabel"),
                              detail.product.sourceDestination,
                            ],
                            [
                              t("product.networkLabel"),
                              detail.product.sourceNetwork,
                            ],
                            [
                              t("product.dataLabel"),
                              detail.product.dataSummary,
                            ],
                            [
                              t("product.durationLabel"),
                              t("common.days", {
                                count: detail.product.durationDays,
                              }),
                            ],
                            [
                              t("product.activationLabel"),
                              detail.product.sourceActivationPolicy,
                            ],
                            [
                              t("product.hotspotLabel"),
                              detail.product.sourceHotspot,
                            ],
                            [
                              t("product.phoneNumberLabel"),
                              detail.product.sourcePhoneNumber,
                            ],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-2xl border border-slate-200 p-4"
                            >
                              <dt className="text-sm font-semibold text-slate-500">
                                {label}
                              </dt>
                              <dd className="mt-1 font-bold text-slate-900">
                                {value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    </section>

                    <aside
                      aria-label={t("labels.productActions")}
                      className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                    >
                      <h2 className="text-2xl font-bold">
                        {t("product.purchaseTitle")}
                      </h2>
                      <p className="mt-3 leading-7 text-slate-600">
                        {t("product.purchaseDescription")}
                      </p>
                      <p className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">
                        {t("product.pricePending")}
                      </p>
                      <label className="mt-6 block text-sm font-semibold text-slate-700">
                        <span className="mb-2 block">
                          {t("product.quantityLabel")}
                        </span>
                        <select
                          disabled
                          defaultValue="1"
                          className="h-11 w-full rounded-xl border border-slate-300 px-3 disabled:bg-slate-100"
                        >
                          <option value="1">1</option>
                        </select>
                      </label>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <button
                          disabled
                          type="button"
                          className="h-12 rounded-full bg-emerald-700 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {t("product.addToCart")}
                        </button>
                        <button
                          disabled
                          type="button"
                          className="h-12 rounded-full border border-emerald-700 px-5 font-bold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {t("product.buyNow")}
                        </button>
                      </div>
                      <p className="mt-5 text-xs leading-5 text-slate-500">
                        {t("states.noInventoryMutation")}
                      </p>
                    </aside>
                  </div>
                </div>
              </section>

              <section className="bg-white py-12 sm:py-16">
                <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                  <div className="rounded-3xl border border-slate-200 p-6">
                    <h2 className="text-xl font-bold">
                      {t("product.deliveryTitle")}
                    </h2>
                    <p className="mt-3 leading-7 text-slate-600">
                      {t("product.deliveryDescription")}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-6">
                    <h2 className="text-xl font-bold">
                      {t("product.compatibilityTitle")}
                    </h2>
                    <p className="mt-3 leading-7 text-slate-600">
                      {t("product.compatibilityDescription")}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-slate-50 py-12 sm:py-16">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl font-bold">
                    {t("product.relatedTitle")}
                  </h2>
                  <p className="mt-3 text-slate-600">
                    {t("product.relatedDescription")}
                  </p>
                  <ul
                    aria-label={t("labels.relatedProducts")}
                    className="mt-6 grid gap-5 lg:grid-cols-3"
                  >
                    {detail.product.relatedSourceTitles.map(
                      (sourceTitle, index) => (
                        <li
                          key={sourceTitle}
                          className="rounded-3xl border border-slate-200 bg-white p-6"
                        >
                          <p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                            {t("common.catalogSource")}
                          </p>
                          <h3 className="mt-3 text-lg font-bold">
                            {sourceTitle}
                          </h3>
                          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                            {t("states.sourceOnly")}
                          </p>
                          <Link
                            href={relatedProductHref(detail.locale, index)}
                            className="mt-5 inline-flex text-sm font-bold text-emerald-700"
                          >
                            {t("product.relatedAction")}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="bg-slate-50 py-12 sm:py-16">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  <nav
                    aria-label={t("labels.breadcrumb")}
                    className="text-sm text-slate-600"
                  >
                    <Link
                      href={detail.routes.productionDestinationListing}
                      className="font-semibold text-emerald-700"
                    >
                      {t("destination.breadcrumbCatalog")}
                    </Link>
                    <span aria-hidden="true" className="px-2">
                      /
                    </span>
                    <span aria-current="page">
                      {t("destination.breadcrumbCurrent")}
                    </span>
                  </nav>

                  <section
                    aria-label={t("labels.destinationOverview")}
                    className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div
                      role="img"
                      aria-label={detail.destination.sourceHeroAlt}
                      className="min-h-64 bg-gradient-to-br from-rose-100 via-sky-100 to-emerald-100 p-8 sm:p-12"
                    >
                      <p className="text-sm font-bold tracking-[0.12em] text-emerald-800 uppercase">
                        {t("destination.eyebrow")} · {detail.destination.code}
                      </p>
                      <h2 className="mt-4 max-w-3xl text-4xl font-bold text-slate-950">
                        {t("destination.sourceTitle", {
                          title: detail.destination.sourceTitle,
                        })}
                      </h2>
                      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
                        {t("destination.sourceDescription", {
                          description: detail.destination.sourceDescription,
                        })}
                      </p>
                    </div>
                    <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
                      <div className="rounded-2xl border border-slate-200 p-5">
                        <p className="text-sm font-semibold text-slate-500">
                          {t("destination.regionLabel")}
                        </p>
                        <p className="mt-2 text-xl font-bold">
                          {detail.destination.sourceRegion}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-5">
                        <p className="text-sm font-semibold text-slate-500">
                          {t("destination.overviewTitle")}
                        </p>
                        <p className="mt-2 text-xl font-bold">
                          {t("destination.catalogCountLabel", {
                            count: detail.destination.catalogCount,
                          })}
                        </p>
                      </div>
                      <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900 sm:col-span-2">
                        {t("destination.sourceNotice")}
                      </p>
                    </div>
                  </section>
                </div>
              </section>

              <section className="bg-white py-12 sm:py-16">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl font-bold">
                    {t("destination.plansTitle")}
                  </h2>
                  <p className="mt-3 max-w-3xl text-slate-600">
                    {t("destination.plansDescription")}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    {t("states.noPrice")}
                  </p>
                  <ul
                    aria-label={t("labels.destinationProducts")}
                    className="mt-6 grid gap-5 lg:grid-cols-3"
                  >
                    {detail.destination.productSourceTitles.map(
                      (sourceTitle, index) => (
                        <li
                          key={sourceTitle}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                        >
                          <p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                            {t("common.catalogSource")}
                          </p>
                          <h3 className="mt-3 text-lg font-bold">
                            {sourceTitle}
                          </h3>
                          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                            {t("states.sourceOnly")}
                          </p>
                          <Link
                            href={relatedProductHref(detail.locale, index)}
                            className="mt-5 inline-flex text-sm font-bold text-emerald-700"
                          >
                            {t("destination.viewPlan")}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                  <Link
                    href={detail.routes.productionDestinationListing}
                    className="mt-8 inline-flex rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-700"
                  >
                    {t("common.backToListings")}
                  </Link>
                </div>
              </section>
            </>
          )}
        </article>
      </PageShell>
    </div>
  );
}
