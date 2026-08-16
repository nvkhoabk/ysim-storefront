// F07A-2E-1_DYNAMIC_CONTENT_LOCALIZATION_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import { createLocalizedDynamicContentBundle } from "@/i18n/dynamic-content/dynamic-content.config";
import {
  createDynamicContentTranslator,
  normalizeDynamicContentView,
} from "@/i18n/dynamic-content/dynamic-content.registry";
import type {
  DynamicContentRecord,
  DynamicContentTranslator,
  DynamicContentView,
} from "@/i18n/dynamic-content/dynamic-content.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";

interface LocalizedDynamicContentPreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const TABS: readonly DynamicContentView[] = [
  "product",
  "destination",
  "guide",
  "fallback",
];

function ProvenanceCard({
  record,
  t,
}: {
  readonly record: DynamicContentRecord;
  readonly t: DynamicContentTranslator;
}) {
  return (
    <aside
      aria-label={t("labels.provenance")}
      className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
    >
      <h3 className="text-xl font-bold">{t("common.provenance")}</h3>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          [t("common.sourceSystem"), record.sourceSystem],
          [t("common.entityId"), record.entityId],
          [t("common.slug"), record.slug],
          [t("common.requestedLocale"), record.requestedLocale],
          [t("common.resolvedLocale"), record.resolvedLocale],
          [
            t("common.status"),
            record.status === "localized"
              ? t("common.localized")
              : t("common.fallback"),
          ],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-4">
            <dt className="text-sm font-semibold text-slate-500">{label}</dt>
            <dd className="mt-1 font-bold text-slate-950">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
        {record.fallbackReason
          ? t("fallback.reasonMissing")
          : t("fallback.reasonNone")}
      </p>
    </aside>
  );
}

function ContentCard({
  record,
  t,
}: {
  readonly record: DynamicContentRecord;
  readonly t: DynamicContentTranslator;
}) {
  return (
    <section
      aria-label={t("labels.contentCard")}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="text-xs font-bold tracking-[0.12em] text-emerald-700 uppercase">
        {t("common.textOverlay")}
      </p>
      <h2 className="mt-4 text-3xl font-bold text-slate-950">
        {record.fields.title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-slate-700">
        {record.fields.summary}
      </p>
      <p className="mt-5 leading-7 text-slate-600">
        {record.fields.description}
      </p>
      <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
        <span className="text-sm font-semibold text-emerald-900">
          {t("common.imageAlt")}
        </span>
        <p className="mt-1 text-emerald-950">{record.fields.imageAlt}</p>
      </div>
    </section>
  );
}

function AuthorityCard({
  record,
  t,
}: {
  readonly record: DynamicContentRecord;
  readonly t: DynamicContentTranslator;
}) {
  const authority = record.commerceAuthority;
  if (!authority) return null;
  return (
    <aside
      aria-label={t("labels.authorityCard")}
      className="rounded-3xl bg-emerald-950 p-6 text-white"
    >
      <h3 className="text-xl font-bold">{t("product.authorityHeading")}</h3>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          [t("product.productId"), authority.productId],
          [t("product.sku"), authority.sku],
          [t("product.sourceCurrency"), authority.sourceCurrency],
          [t("product.sourcePrice"), authority.sourcePriceLabel],
          [t("product.stock"), t("product.stockValue")],
          [t("product.variations"), authority.variationCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/10 p-4">
            <dt className="text-sm text-emerald-100">{label}</dt>
            <dd className="mt-1 font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm leading-6 text-emerald-100">
        {t("product.overlayNotice")}
      </p>
    </aside>
  );
}

export default async function LocalizedDynamicContentPreviewPage({
  searchParams,
}: LocalizedDynamicContentPreviewProps) {
  const params = await searchParams;
  const content = createLocalizedDynamicContentBundle(params.locale);
  const shell = createLocalizedShellBundle(content.locale);
  const t = createDynamicContentTranslator(content.locale);
  const view = normalizeDynamicContentView(params.view);
  const record = content.records[view];
  const headingKey = `${view}.heading`;
  const eyebrowKey = `${view}.eyebrow`;

  return (
    <div lang={content.htmlLang} dir={content.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/localized-dynamic-content",
        }}
        homeHref={`/ui-preview/localized-dynamic-content?locale=${content.locale}&view=${view}`}
      >
        <article aria-label={t("labels.preview")}>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  F07A-2E-1 · {content.marketId} · {content.currency}
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
                <p className="text-sm leading-6">{t("preview.policy")}</p>
                <p className="mt-4 text-sm leading-6">
                  {t("preview.authority")}
                </p>
                <p className="mt-4 text-sm leading-6">
                  {t("preview.fallback")}
                </p>
                <nav
                  aria-label={t("labels.localeNavigation")}
                  className="mt-6 flex gap-2"
                >
                  {(["vi", "en", "lo"] as const).map((locale) => (
                    <Link
                      key={locale}
                      href={`/ui-preview/localized-dynamic-content?locale=${locale}&view=${view}`}
                      aria-current={
                        locale === content.locale ? "page" : undefined
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

          <nav
            aria-label={t("labels.tabs")}
            className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 py-5 sm:px-6 lg:px-8"
          >
            {TABS.map((tab) => (
              <Link
                key={tab}
                href={content.routes.preview[tab]}
                aria-current={tab === view ? "page" : undefined}
                className={`rounded-full px-4 py-3 text-sm font-bold ${tab === view ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {t(`views.${tab}`)}
              </Link>
            ))}
          </nav>

          <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
                {t(eyebrowKey)}
              </p>
              <h2 className="mt-3 text-3xl font-bold">{t(headingKey)}</h2>
              <p className="mt-4 max-w-4xl leading-7 text-slate-600">
                {view === "product"
                  ? t("product.overlayNotice")
                  : view === "destination"
                    ? t("destination.notice")
                    : view === "guide"
                      ? t("guide.notice")
                      : t("fallback.notice")}
              </p>
              <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <ContentCard record={record} t={t} />
                <div className="space-y-6">
                  <ProvenanceCard record={record} t={t} />
                  <AuthorityCard record={record} t={t} />
                </div>
              </div>
            </div>
          </section>
        </article>
      </PageShell>
    </div>
  );
}
