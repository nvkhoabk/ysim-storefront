// F07A-2C-4_LOCALIZED_SECONDARY_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import {
  createLocalizedSecondaryBundle,
  guideSourceHref,
} from "@/i18n/secondary/secondary.config";
import {
  createSecondaryTranslator,
  normalizeSecondaryView,
} from "@/i18n/secondary/secondary.registry";
import type {
  SecondaryTranslator,
  SecondaryView,
} from "@/i18n/secondary/secondary.types";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";

interface LocalizedSecondaryPreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const TABS: readonly SecondaryView[] = [
  "offers",
  "guides",
  "support",
  "device-check",
  "package-assistant",
];

function OffersView({
  t,
  secondary,
}: {
  readonly t: SecondaryTranslator;
  readonly secondary: ReturnType<typeof createLocalizedSecondaryBundle>;
}) {
  const cards = [
    ["offers.card1Title", "offers.card1Description"],
    ["offers.card2Title", "offers.card2Description"],
    ["offers.card3Title", "offers.card3Description"],
  ] as const;
  return (
    <section
      aria-label={t("labels.offers")}
      className="bg-slate-50 py-12 sm:py-16"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
          {t("offers.eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-950">
          {t("offers.title")}
        </h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          {t("offers.description")}
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {cards.map(([titleKey, descriptionKey], index) => (
            <article
              key={titleKey}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {secondary.offers[index]?.badge}
              </span>
              <h3 className="mt-5 text-xl font-bold">{t(titleKey)}</h3>
              <p className="mt-3 leading-7 text-slate-600">
                {t(descriptionKey)}
              </p>
              <code className="mt-5 block rounded-xl bg-slate-100 p-3 text-sm">
                {secondary.offers[index]?.code}
              </code>
            </article>
          ))}
        </div>
        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          {t("offers.featuredDescription")} {t("offers.terms")}
        </p>
        <Link
          href={secondary.routes.production.offers}
          className="mt-6 inline-flex rounded-full bg-emerald-700 px-5 py-3 font-bold text-white"
        >
          {t("offers.action")}
        </Link>
      </div>
    </section>
  );
}

function GuidesView({
  t,
  secondary,
}: {
  readonly t: SecondaryTranslator;
  readonly secondary: ReturnType<typeof createLocalizedSecondaryBundle>;
}) {
  return (
    <section
      aria-label={t("labels.guides")}
      className="bg-white py-12 sm:py-16"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
          {t("guides.eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-bold">{t("guides.title")}</h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          {t("guides.description")}
        </p>
        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          {t("common.sourceNotice")}
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {secondary.guideSources.map((guide) => (
            <article
              key={guide.slug}
              className="rounded-3xl border border-slate-200 p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold">
                {t("guides.sourceTitle", { title: guide.sourceTitle })}
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                {t("guides.sourceSummary", { summary: guide.sourceSummary })}
              </p>
              <Link
                href={guideSourceHref(secondary.locale, guide.slug)}
                className="mt-5 inline-flex font-bold text-emerald-700"
              >
                {t("guides.read")}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportView({
  t,
  secondary,
}: {
  readonly t: SecondaryTranslator;
  readonly secondary: ReturnType<typeof createLocalizedSecondaryBundle>;
}) {
  const faqs = [
    ["support.faq1Question", "support.faq1Answer"],
    ["support.faq2Question", "support.faq2Answer"],
    ["support.faq3Question", "support.faq3Answer"],
  ] as const;
  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
          {t("support.eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-bold">{t("support.title")}</h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          {t("support.description")}
        </p>
        <section
          aria-label={t("labels.supportChannels")}
          className="mt-8 grid gap-5 md:grid-cols-2"
        >
          <article className="rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-bold">{t("support.emailTitle")}</h3>
            <p className="mt-3 text-slate-600">
              {t("support.emailDescription")}
            </p>
            <a
              href="mailto:support@ysim.vn"
              className="mt-5 inline-flex font-bold text-emerald-700"
            >
              support@ysim.vn
            </a>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-bold">{t("support.chatTitle")}</h3>
            <p className="mt-3 text-slate-600">
              {t("support.chatDescription")}
            </p>
            <p className="mt-5 font-bold">
              {t("common.hours")}: {t("support.hoursValue")}
            </p>
          </article>
        </section>
        <section aria-label={t("labels.faq")} className="mt-10">
          <h3 className="text-2xl font-bold">{t("support.faqTitle")}</h3>
          <div className="mt-5 space-y-4">
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <summary className="cursor-pointer font-bold">
                  {t(question)}
                </summary>
                <p className="mt-3 leading-7 text-slate-600">{t(answer)}</p>
              </details>
            ))}
          </div>
        </section>
        <Link
          href={secondary.routes.production.support}
          className="mt-7 inline-flex rounded-full bg-emerald-700 px-5 py-3 font-bold text-white"
        >
          {t("support.action")}
        </Link>
      </div>
    </section>
  );
}

function DeviceView({
  t,
  secondary,
}: {
  readonly t: SecondaryTranslator;
  readonly secondary: ReturnType<typeof createLocalizedSecondaryBundle>;
}) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
          {t("device.eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-bold">{t("device.title")}</h2>
        <p className="mt-4 leading-7 text-slate-600">
          {t("device.description")}
        </p>
        <fieldset
          disabled
          aria-label={t("labels.deviceForm")}
          className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-2"
        >
          <label className="font-semibold">
            {t("device.brandLabel")}
            <input
              placeholder={t("device.brandPlaceholder")}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            />
          </label>
          <label className="font-semibold">
            {t("device.modelLabel")}
            <input
              placeholder={t("device.modelPlaceholder")}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            />
          </label>
          <button
            type="button"
            className="rounded-full bg-emerald-700 px-5 py-3 font-bold text-white md:col-span-2"
          >
            {t("device.check")}
          </button>
        </fieldset>
        <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
          <h3 className="font-bold text-emerald-950">
            {t("device.resultTitle")}
          </h3>
          <p className="mt-2 text-emerald-900">
            {t("device.resultDescription")}
          </p>
        </div>
        <Link
          href={secondary.routes.production["device-check"]}
          className="mt-6 inline-flex font-bold text-emerald-700"
        >
          {t("device.action")}
        </Link>
      </div>
    </section>
  );
}

function AssistantView({
  t,
  secondary,
}: {
  readonly t: SecondaryTranslator;
  readonly secondary: ReturnType<typeof createLocalizedSecondaryBundle>;
}) {
  const steps = [
    ["assistant.step1Title", "assistant.step1Description"],
    ["assistant.step2Title", "assistant.step2Description"],
    ["assistant.step3Title", "assistant.step3Description"],
  ] as const;
  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
          {t("assistant.eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-bold">{t("assistant.title")}</h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          {t("assistant.description")}
        </p>
        <ol
          aria-label={t("labels.assistantSteps")}
          className="mt-8 grid gap-5 lg:grid-cols-3"
        >
          {steps.map(([title, description]) => (
            <li
              key={title}
              className="rounded-3xl border border-slate-200 bg-white p-6"
            >
              <h3 className="text-xl font-bold">{t(title)}</h3>
              <p className="mt-3 leading-7 text-slate-600">{t(description)}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 rounded-3xl bg-emerald-950 p-7 text-white">
          <h3 className="text-2xl font-bold">
            {t("assistant.recommendationTitle")}
          </h3>
          <p className="mt-3 text-emerald-50">
            {t("assistant.recommendationDescription")}
          </p>
          <Link
            href={secondary.routes.production["package-assistant"]}
            className="mt-5 inline-flex rounded-full bg-white px-5 py-3 font-bold text-emerald-950"
          >
            {t("assistant.action")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function LocalizedSecondaryPreviewPage({
  searchParams,
}: LocalizedSecondaryPreviewProps) {
  const params = await searchParams;
  const secondary = createLocalizedSecondaryBundle(params.locale);
  const shell = createLocalizedShellBundle(secondary.locale);
  const t = createSecondaryTranslator(secondary.locale);
  const view = normalizeSecondaryView(params.view);

  return (
    <div lang={secondary.htmlLang} dir={secondary.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/localized-secondary",
        }}
        homeHref={`/ui-preview/localized-secondary?locale=${secondary.locale}&view=${view}`}
      >
        <article aria-label={t("labels.preview")}>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  F07A-2C-4 · {secondary.marketId} · {secondary.currency}
                </p>
                <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
                  {t("preview.title")}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-emerald-50">
                  {t("preview.description")}
                </p>
                <p className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm">
                  {t("preview.candidate")}
                </p>
              </div>
              <aside className="rounded-3xl border border-white/20 bg-white/10 p-6">
                <p className="text-sm leading-6">
                  {t("preview.dynamicBoundary")}
                </p>
                <p className="mt-4 text-sm leading-6">
                  {t("preview.currencyPending", {
                    market: secondary.marketId,
                    currency: secondary.currency,
                  })}
                </p>
                <nav
                  aria-label={t("labels.localeNavigation")}
                  className="mt-6 flex gap-2"
                >
                  {(["vi", "en", "lo"] as const).map((locale) => (
                    <Link
                      key={locale}
                      href={`/ui-preview/localized-secondary?locale=${locale}&view=${view}`}
                      aria-current={
                        locale === secondary.locale ? "page" : undefined
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
                href={secondary.routes.preview[tab]}
                aria-current={tab === view ? "page" : undefined}
                className={`rounded-full px-4 py-3 text-sm font-bold ${tab === view ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {t(
                  `tabs.${tab === "device-check" ? "deviceCheck" : tab === "package-assistant" ? "packageAssistant" : tab}`,
                )}
              </Link>
            ))}
          </nav>
          {view === "offers" ? (
            <OffersView t={t} secondary={secondary} />
          ) : null}
          {view === "guides" ? (
            <GuidesView t={t} secondary={secondary} />
          ) : null}
          {view === "support" ? (
            <SupportView t={t} secondary={secondary} />
          ) : null}
          {view === "device-check" ? (
            <DeviceView t={t} secondary={secondary} />
          ) : null}
          {view === "package-assistant" ? (
            <AssistantView t={t} secondary={secondary} />
          ) : null}
        </article>
      </PageShell>
    </div>
  );
}
