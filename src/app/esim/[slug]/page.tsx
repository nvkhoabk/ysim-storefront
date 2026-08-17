/* YSIM_PACKAGE_27_ACTIVATION:product-detail */
import { notFound } from "next/navigation";

import LegacyProductDetailPage from "./legacy-page";

import {
  ProductDetailCandidateClient,
  ProductDetailRouteCandidatePage,
} from "@/components/product/refactor/integration";

import {
  createLocalizedProductDetailGateway,
  loadProductDetailRouteCandidate,
} from "@/lib/storefront/integration/product-detail";

import { getProductionRouteMode } from "@/lib/storefront/integration/route-flags";
import { getProductBySlug } from "@/lib/woocommerce/products";
import {
  getStorefrontLocaleRequest,
} from "@/i18n/runtime/runtime.server";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import { generateMetadata as generateLegacyMetadata } from "./legacy-page";

const PRODUCT_LOCALES: readonly ShellLocale[] = ["vi", "en", "lo"];

export async function generateMetadata(props: ProductDetailPageProps) {
  const [{ slug }, metadata, request] = await Promise.all([
    props.params,
    generateLegacyMetadata(props),
    getStorefrontLocaleRequest(),
  ]);

  if (!request.localized) {
    return metadata;
  }

  const resolvedProducts = await Promise.all(
    PRODUCT_LOCALES.map((locale) => getProductBySlug(slug, locale)),
  );
  const localizedHref = (locale: ShellLocale, productSlug: string) =>
    localizeShellHref(`/esim/${productSlug}`, locale);
  const fallbackSlug =
    resolvedProducts.find(Boolean)?.slug || slug;
  const localizedSlugs = Object.fromEntries(
    PRODUCT_LOCALES.map((locale, index) => [
      locale,
      resolvedProducts[index]?.slug || fallbackSlug,
    ]),
  ) as Record<ShellLocale, string>;

  return {
    ...metadata,
    alternates: {
      canonical: localizedHref(
        request.shell.locale,
        localizedSlugs[request.shell.locale],
      ),
      languages: {
        vi: localizedHref("vi", localizedSlugs.vi),
        en: localizedHref("en", localizedSlugs.en),
        lo: localizedHref("lo", localizedSlugs.lo),
        "x-default": localizedHref("vi", localizedSlugs.vi),
      },
    },
  };
}

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function textValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
}

export default async function ProductDetailPage(props: ProductDetailPageProps) {
  const request = await getStorefrontLocaleRequest();
  const mode = getProductionRouteMode("product-detail");

  if (mode === "legacy" && !request.localized) {
    return <LegacyProductDetailPage {...props} />;
  }

  const params = await props.params;

  const query = props.searchParams ? await props.searchParams : {};

  const slug = textValue(params?.slug);

  if (!slug) {
    notFound();
  }

  const locale =
    (request.localized ? request.shell.locale : undefined) ||
    textValue(query?.locale) ||
    process.env.YSIM_PRODUCT_LOCALE?.trim() ||
    "vi";

  const relatedLimit = Math.max(
    1,
    Math.min(12, Number(process.env.YSIM_PRODUCT_DETAIL_RELATED_LIMIT || 6)),
  );

  const candidate = await loadProductDetailRouteCandidate({
    slug,
    locale,
    productionGateway: createLocalizedProductDetailGateway({
      relatedLimit,
    }),
  });

  if (!candidate) {
    notFound();
  }

  if (mode === "candidate") {
    return <ProductDetailRouteCandidatePage candidate={candidate} />;
  }

  return (
    <ProductDetailCandidateClient
      candidate={candidate}
      showDiagnostics={false}
    />
  );
}
