"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPinned, PackageSearch } from "lucide-react";

import { EsimQuickProductCatalog } from "@/components/catalog/EsimQuickProductCatalog";
import type { EsimQuickFilterSelection } from "@/types/view-models/esim-quick-filter";
import type { SecondaryProductViewModel } from "@/types/view-models/secondary-routes";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createListingTranslator } from "@/i18n/listing/listing.registry";
import { localizeShellHref } from "@/i18n/shell/shell.href";

export interface DestinationProductsFallbackPageProps {
  products: readonly SecondaryProductViewModel[];
  selection: EsimQuickFilterSelection;
  matchingProductCount: number;
}

export function DestinationProductsFallbackPage({
  products,
  selection,
  matchingProductCount,
}: DestinationProductsFallbackPageProps) {
  const router = useRouter();
  const { locale } = useStorefrontLocale();
  const t = createListingTranslator(locale);
  const fullCatalogHref = localizeShellHref(
    `/esim?destination=${encodeURIComponent(selection.id)}`,
    locale,
  );
  const destinationsHref = localizeShellHref("/destinations", locale);

  return (
    <>
      <section className="border-b border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)]">
        <div className="mx-auto w-full max-w-[var(--ysim-container-wide)] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Link
            href={destinationsHref}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface)] px-4 py-2 text-sm font-bold text-[var(--ysim-color-brand-700)] transition hover:border-[var(--ysim-color-brand-300)] hover:bg-[var(--ysim-color-brand-50)]"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {t("ordinary.viewAll")}
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="text-sm font-extrabold tracking-[0.16em] text-[var(--ysim-color-brand-700)] uppercase">
                {t("ordinary.destinationPlansEyebrow")}
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--ysim-color-text-strong)] sm:text-4xl lg:text-5xl">
                eSIM {selection.label}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--ysim-color-text-muted)] sm:text-lg">
                {t("ordinary.destinationPlansDescription")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={fullCatalogHref}
                  className="inline-flex items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--ysim-color-brand-800)]"
                >
                  {t("ordinary.fullFilter")}
                </Link>
                <Link
                  href={destinationsHref}
                  className="inline-flex items-center justify-center rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface)] px-5 py-3 text-sm font-extrabold text-[var(--ysim-color-text-strong)] transition hover:border-[var(--ysim-color-brand-300)]"
                >
                  {t("ordinary.chooseAnotherDestination")}
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex items-center gap-3 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface)] p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--ysim-color-brand-100)] text-[var(--ysim-color-brand-700)]">
                  <MapPinned aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-[var(--ysim-color-text-muted)] uppercase">
                    {t("ordinary.selectedDestination")}
                  </p>
                  <p className="mt-1 font-black text-[var(--ysim-color-text-strong)]">
                    {selection.label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface)] p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--ysim-color-brand-100)] text-[var(--ysim-color-brand-700)]">
                  <PackageSearch aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-[var(--ysim-color-text-muted)] uppercase">
                    {t("ordinary.matchingProducts")}
                  </p>
                  <p className="mt-1 font-black text-[var(--ysim-color-text-strong)]">
                    {t("ordinary.planCount", { count: matchingProductCount })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EsimQuickProductCatalog
        products={products}
        selection={selection}
        onClearSelection={() => router.push(destinationsHref)}
      />
    </>
  );
}
