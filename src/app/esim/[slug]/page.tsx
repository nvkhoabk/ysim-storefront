/* YSIM_PACKAGE_27_ACTIVATION:product-detail */
import {
  notFound,
} from "next/navigation";

import LegacyProductDetailPage from "./legacy-page";

import {
  ProductDetailCandidateClient,
  ProductDetailRouteCandidatePage,
} from "@/components/product/refactor/integration";

import {
  createLocalizedProductDetailGateway,
  loadProductDetailRouteCandidate,
} from "@/lib/storefront/integration/product-detail";

import {
  getProductionRouteMode,
} from "@/lib/storefront/integration/route-flags";

export { generateMetadata } from "./legacy-page";

function textValue(
  value: unknown,
): string | undefined {
  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    Array.isArray(
      value,
    ) &&
    typeof value[0] ===
      "string"
  ) {
    return value[0];
  }

  return undefined;
}

export default async function ProductDetailPage(
  props: any,
) {
  const mode =
    getProductionRouteMode(
      "product-detail",
    );

  if (
    mode ===
    "legacy"
  ) {
    return (
      <LegacyProductDetailPage
        {...props}
      />
    );
  }

  const params =
    await props.params;

  const query =
    await (
      props.searchParams ||
      Promise.resolve({})
    );

  const slug =
    textValue(
      params?.slug,
    );

  if (!slug) {
    notFound();
  }

  const locale =
    textValue(
      query?.locale,
    ) ||
    process.env
      .YSIM_PRODUCT_LOCALE
      ?.trim() ||
    "vi";

  const relatedLimit =
    Math.max(
      1,
      Math.min(
        12,
        Number(
          process.env
            .YSIM_PRODUCT_DETAIL_RELATED_LIMIT ||
          6,
        ),
      ),
    );

  const candidate =
    await loadProductDetailRouteCandidate({
      slug,
      locale,
      productionGateway:
        createLocalizedProductDetailGateway({
          relatedLimit,
        }),
    });

  if (!candidate) {
    notFound();
  }

  if (
    mode ===
    "candidate"
  ) {
    return (
      <ProductDetailRouteCandidatePage
        candidate={
          candidate
        }
      />
    );
  }

  return (
    <ProductDetailCandidateClient
      candidate={
        candidate
      }
      showDiagnostics={
        false
      }
    />
  );
}
