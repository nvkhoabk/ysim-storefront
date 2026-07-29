// F07A-2B_GLOBAL_SHELL_LOCALIZATION_R2

import Link from "next/link";

import { PageShell } from "@/components/layout";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { createShellTranslator } from "@/i18n/shell/shell.registry";

interface LocalizedShellPreviewProps {
  readonly searchParams: Promise<{ readonly locale?: string }>;
}

export default async function LocalizedShellPreviewPage({
  searchParams,
}: LocalizedShellPreviewProps) {
  const { locale } = await searchParams;
  const shell = createLocalizedShellBundle(locale);
  const t = createShellTranslator(shell.locale);

  return (
    <div lang={shell.htmlLang} dir={shell.direction}>
      <PageShell headerConfig={shell.navigation} footerConfig={shell.footer}>
        <section className="bg-[var(--ysim-color-surface-subtle)] py-10 sm:py-14">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] sm:p-8">
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--ysim-color-brand-700)] uppercase">
                F07A-2B R2 · {shell.marketId} · {shell.currency}
              </p>
              <h1 className="mt-3 text-3xl font-bold text-[var(--ysim-color-text)]">
                {t("preview.title")}
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-[var(--ysim-color-text-muted)]">
                {t("preview.description")}
              </p>
              <p className="mt-4 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-warning-subtle,#fff7ed)] px-4 py-3 text-sm font-semibold text-[var(--ysim-color-text)]">
                {t("preview.candidate")}
              </p>
              <nav
                aria-label={shell.labels.languageSelect}
                className="mt-6 flex flex-wrap gap-2"
              >
                {(["vi", "en", "lo"] as const).map((candidate) => (
                  <Link
                    key={candidate}
                    href={`/ui-preview/localized-shell?locale=${candidate}`}
                    className="rounded-[var(--ysim-radius-pill)] border border-[var(--ysim-color-border)] px-4 py-2 text-sm font-bold hover:bg-[var(--ysim-color-brand-50)]"
                  >
                    {candidate.toUpperCase()}
                  </Link>
                ))}
              </nav>
              <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] p-4">
                  <dt className="text-xs font-bold text-[var(--ysim-color-text-muted)] uppercase">
                    Locale
                  </dt>
                  <dd className="mt-2 font-bold">{shell.locale}</dd>
                </div>
                <div className="rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] p-4">
                  <dt className="text-xs font-bold text-[var(--ysim-color-text-muted)] uppercase">
                    Currency
                  </dt>
                  <dd className="mt-2 font-bold">{shell.currency}</dd>
                </div>
                <div className="rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] p-4">
                  <dt className="text-xs font-bold text-[var(--ysim-color-text-muted)] uppercase">
                    HTML lang
                  </dt>
                  <dd className="mt-2 font-bold">{shell.htmlLang}</dd>
                </div>
                <div className="rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] p-4">
                  <dt className="text-xs font-bold text-[var(--ysim-color-text-muted)] uppercase">
                    Route sample
                  </dt>
                  <dd className="mt-2 font-bold break-all">
                    {shell.navigation.mainItems[0]?.href}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </PageShell>
    </div>
  );
}
