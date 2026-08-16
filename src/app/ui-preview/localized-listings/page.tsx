// F07A-2C-2_LOCALIZED_LISTING_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  createLocalizedListingBundle,
  destinationHref,
  productHref,
} from "@/i18n/listing/listing.config";
import {
  createListingTranslator,
  normalizeListingView,
} from "@/i18n/listing/listing.registry";

interface LocalizedListingPreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
    readonly q?: string;
    readonly destination?: string;
    readonly data?: string;
    readonly duration?: string;
    readonly region?: string;
    readonly sort?: string;
  }>;
}

function normalizedText(value: string | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase();
}

export default async function LocalizedListingsPreviewPage({
  searchParams,
}: LocalizedListingPreviewProps) {
  const params = await searchParams;
  const listing = createLocalizedListingBundle(params.locale);
  const shell = createLocalizedShellBundle(listing.locale);
  const t = createListingTranslator(listing.locale);
  const view = normalizeListingView(params.view);
  const query = normalizedText(params.q);
  const destination = params.destination ?? "all";
  const data = params.data ?? "all";
  const duration = params.duration ?? "all";
  const region = params.region ?? "all";
  const sort = params.sort ?? "recommended";

  const products = listing.products
    .filter(
      (product) =>
        !query ||
        product.sourceTitle.toLocaleLowerCase().includes(query) ||
        product.sku.toLocaleLowerCase().includes(query),
    )
    .filter((product) =>
      destination === "all" ? true : product.destinationCode === destination,
    )
    .filter((product) => (data === "all" ? true : product.dataCode === data))
    .filter((product) =>
      duration === "short"
        ? product.durationDays <= 7
        : duration === "medium"
          ? product.durationDays >= 8 && product.durationDays <= 15
          : true,
    )
    .toSorted((left, right) =>
      sort === "shortest" ? left.durationDays - right.durationDays : 0,
    );

  const destinations = listing.destinations
    .filter(
      (item) =>
        !query ||
        item.sourceTitle.toLocaleLowerCase().includes(query) ||
        item.code.toLocaleLowerCase().includes(query),
    )
    .filter((item) => (region === "all" ? true : item.regionCode === region))
    .toSorted((left, right) =>
      sort === "most-plans" ? right.catalogCount - left.catalogCount : 0,
    );

  return (
    <div lang={listing.htmlLang} dir={listing.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/localized-listings",
        }}
        homeHref={`/ui-preview/localized-listings?locale=${listing.locale}&view=${view}`}
      >
        <article aria-label={t("labels.preview")}>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  F07A-2C-2 · {listing.marketId} · {listing.currency}
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
                  {t("preview.currencyPending", { currency: listing.currency })}
                </p>
                <nav
                  aria-label={t("labels.localeNavigation")}
                  className="mt-6 flex gap-2"
                >
                  {(["vi", "en", "lo"] as const).map((candidate) => (
                    <Link
                      key={candidate}
                      href={`/ui-preview/localized-listings?locale=${candidate}&view=${view}`}
                      aria-current={
                        candidate === listing.locale ? "page" : undefined
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
                href={listing.routes.previewEsim}
                aria-current={view === "esim" ? "page" : undefined}
                className={`rounded-full px-5 py-3 text-sm font-bold ${view === "esim" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {t("tabs.esim")}
              </Link>
              <Link
                href={listing.routes.previewDestinations}
                aria-current={view === "destinations" ? "page" : undefined}
                className={`rounded-full px-5 py-3 text-sm font-bold ${view === "destinations" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {t("tabs.destinations")}
              </Link>
            </nav>
          </section>

          {view === "esim" ? (
            <section className="bg-slate-50 py-12 sm:py-16">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                  {t("esim.eyebrow")}
                </p>
                <h2 className="mt-3 text-3xl font-bold">{t("esim.title")}</h2>
                <p className="mt-3 max-w-3xl text-slate-600">
                  {t("esim.description")}
                </p>

                <form
                  method="get"
                  aria-label={t("labels.esimFilters")}
                  className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-2 lg:grid-cols-5"
                >
                  <input type="hidden" name="locale" value={listing.locale} />
                  <input type="hidden" name="view" value="esim" />
                  <label className="text-sm font-semibold text-slate-700 lg:col-span-2">
                    <span className="mb-2 block">{t("esim.searchLabel")}</span>
                    <input
                      name="q"
                      type="search"
                      defaultValue={params.q ?? ""}
                      placeholder={t("esim.searchPlaceholder")}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    <span className="mb-2 block">
                      {t("esim.destinationFilter")}
                    </span>
                    <select
                      name="destination"
                      defaultValue={destination}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3"
                    >
                      <option value="all">{t("filters.destinationAll")}</option>
                      <option value="JP">
                        {t("filters.destinationJapan")}
                      </option>
                      <option value="ASIA">
                        {t("filters.destinationAsia")}
                      </option>
                      <option value="TH">
                        {t("filters.destinationThailand")}
                      </option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    <span className="mb-2 block">{t("esim.dataFilter")}</span>
                    <select
                      name="data"
                      defaultValue={data}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3"
                    >
                      <option value="all">{t("filters.dataAll")}</option>
                      <option value="daily">{t("filters.dataDaily")}</option>
                      <option value="total">{t("filters.dataTotal")}</option>
                      <option value="unlimited">
                        {t("filters.dataUnlimited")}
                      </option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    <span className="mb-2 block">
                      {t("esim.durationFilter")}
                    </span>
                    <select
                      name="duration"
                      defaultValue={duration}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3"
                    >
                      <option value="all">{t("filters.durationAll")}</option>
                      <option value="short">
                        {t("filters.durationShort")}
                      </option>
                      <option value="medium">
                        {t("filters.durationMedium")}
                      </option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    <span className="mb-2 block">{t("esim.sortLabel")}</span>
                    <select
                      name="sort"
                      defaultValue={sort}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3"
                    >
                      <option value="recommended">
                        {t("esim.sortRecommended")}
                      </option>
                      <option value="shortest">{t("esim.sortShortest")}</option>
                    </select>
                  </label>
                  <div className="flex items-end gap-2 lg:col-span-4">
                    <button
                      type="submit"
                      className="h-11 rounded-full bg-emerald-700 px-5 text-sm font-bold text-white"
                    >
                      {t("common.apply")}
                    </button>
                    <Link
                      href={listing.routes.previewEsim}
                      className="h-11 rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-700"
                    >
                      {t("esim.clearFilters")}
                    </Link>
                  </div>
                </form>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-bold">
                    {t("esim.resultSummary", { count: products.length })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {t("states.noPrices")}
                  </p>
                </div>

                {products.length > 0 ? (
                  <ul
                    aria-label={t("labels.esimResults")}
                    className="mt-6 grid gap-5 lg:grid-cols-3"
                  >
                    {products.map((product) => (
                      <li
                        key={product.sku}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                          SKU · {product.sku}
                        </p>
                        <h3 className="mt-3 text-xl font-bold">
                          {t("esim.sourceTitle", {
                            title: product.sourceTitle,
                          })}
                        </h3>
                        <p className="mt-3 text-sm text-slate-600">
                          {t("esim.sourceDestination", {
                            destination: product.sourceDestination,
                          })}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {t("esim.dataAllowance", {
                            data: product.dataSummary,
                          })}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {t("esim.duration", { days: product.durationDays })}
                        </p>
                        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                          {t("states.sourceOnly")}
                        </p>
                        <Link
                          href={productHref(listing.locale, product.slug)}
                          className="mt-5 inline-flex text-sm font-bold text-emerald-700"
                        >
                          {t("esim.cardAction")}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <h3 className="text-xl font-bold">
                      {t("esim.noResultsTitle")}
                    </h3>
                    <p className="mt-3 text-slate-600">
                      {t("esim.noResultsDescription")}
                    </p>
                    <Link
                      href={listing.routes.previewEsim}
                      className="mt-5 inline-flex text-sm font-bold text-emerald-700"
                    >
                      {t("esim.clearFilters")}
                    </Link>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="bg-slate-50 py-12 sm:py-16">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                  {t("destinations.eyebrow")}
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  {t("destinations.title")}
                </h2>
                <p className="mt-3 max-w-3xl text-slate-600">
                  {t("destinations.description")}
                </p>

                <form
                  method="get"
                  aria-label={t("labels.destinationFilters")}
                  className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-2 lg:grid-cols-4"
                >
                  <input type="hidden" name="locale" value={listing.locale} />
                  <input type="hidden" name="view" value="destinations" />
                  <label className="text-sm font-semibold text-slate-700 lg:col-span-2">
                    <span className="mb-2 block">
                      {t("destinations.searchLabel")}
                    </span>
                    <input
                      name="q"
                      type="search"
                      defaultValue={params.q ?? ""}
                      placeholder={t("destinations.searchPlaceholder")}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    <span className="mb-2 block">
                      {t("destinations.regionFilter")}
                    </span>
                    <select
                      name="region"
                      defaultValue={region}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3"
                    >
                      <option value="all">{t("filters.regionAll")}</option>
                      <option value="asia">{t("filters.regionAsia")}</option>
                      <option value="europe">
                        {t("filters.regionEurope")}
                      </option>
                      <option value="global">
                        {t("filters.regionGlobal")}
                      </option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    <span className="mb-2 block">
                      {t("destinations.sortLabel")}
                    </span>
                    <select
                      name="sort"
                      defaultValue={sort}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3"
                    >
                      <option value="recommended">
                        {t("destinations.sortRecommended")}
                      </option>
                      <option value="most-plans">
                        {t("destinations.sortMostPlans")}
                      </option>
                    </select>
                  </label>
                  <div className="flex items-end gap-2 lg:col-span-4">
                    <button
                      type="submit"
                      className="h-11 rounded-full bg-emerald-700 px-5 text-sm font-bold text-white"
                    >
                      {t("common.apply")}
                    </button>
                    <Link
                      href={listing.routes.previewDestinations}
                      className="h-11 rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-700"
                    >
                      {t("destinations.clearFilters")}
                    </Link>
                  </div>
                </form>

                <p className="mt-8 font-bold">
                  {t("destinations.resultSummary", {
                    count: destinations.length,
                  })}
                </p>
                {destinations.length > 0 ? (
                  <ul
                    aria-label={t("labels.destinationResults")}
                    className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {destinations.map((item) => (
                      <li
                        key={item.code}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                          {item.code}
                        </p>
                        <h3 className="mt-3 text-xl font-bold">
                          {t("destinations.sourceTitle", {
                            title: item.sourceTitle,
                          })}
                        </h3>
                        <p className="mt-3 text-sm text-slate-600">
                          {t("destinations.region", {
                            region: item.regionCode,
                          })}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {t("destinations.planCount", {
                            count: item.catalogCount,
                          })}
                        </p>
                        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                          {t("states.sourceOnly")}
                        </p>
                        <Link
                          href={destinationHref(listing.locale, item.slug)}
                          className="mt-5 inline-flex text-sm font-bold text-emerald-700"
                        >
                          {t("destinations.cardAction")}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <h3 className="text-xl font-bold">
                      {t("destinations.noResultsTitle")}
                    </h3>
                    <p className="mt-3 text-slate-600">
                      {t("destinations.noResultsDescription")}
                    </p>
                    <Link
                      href={listing.routes.previewDestinations}
                      className="mt-5 inline-flex text-sm font-bold text-emerald-700"
                    >
                      {t("destinations.clearFilters")}
                    </Link>
                  </div>
                )}
              </div>
            </section>
          )}
        </article>
      </PageShell>
    </div>
  );
}
