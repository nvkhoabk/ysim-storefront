import {
  notFound,
} from "next/navigation";

import type {
  Metadata,
} from "next";

import {
  ProductDetailRouteCandidatePage,
} from "@/components/product/refactor/integration";

import {
  createLocalizedProductDetailGateway,
  loadProductDetailRouteCandidate,
} from "@/lib/storefront/integration/product-detail";

export const dynamic =
  "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    locale?: string;
  }>;
}

async function load({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  const productionGateway =
    createLocalizedProductDetailGateway({
      relatedLimit:
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
        ),
    });

  return loadProductDetailRouteCandidate({
    slug,
    locale,
    productionGateway,
  });
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;

  const query =
    await searchParams;

  const locale =
    query.locale?.trim() ||
    process.env
      .YSIM_PRODUCT_LOCALE
      ?.trim() ||
    "vi";

  const candidate =
    await load({
      slug,
      locale,
    });

  if (!candidate) {
    return {
      title:
        "Không tìm thấy eSIM | YSim",
      robots: {
        index:
          false,
        follow:
          false,
      },
    };
  }

  return {
    title:
      `${candidate.product.name} | YSim`,
    description:
      candidate.product
        .shortDescription,
    robots: {
      index:
        false,
      follow:
        false,
    },
  };
}

export default async function ProductDetailCandidatePage({
  params,
  searchParams,
}: PageProps) {
  const {
    slug,
  } =
    await params;

  const query =
    await searchParams;

  const locale =
    query.locale?.trim() ||
    process.env
      .YSIM_PRODUCT_LOCALE
      ?.trim() ||
    "vi";

  const candidate =
    await load({
      slug,
      locale,
    });

  if (!candidate) {
    notFound();
  }

  return (
    <ProductDetailRouteCandidatePage
      candidate={
        candidate
      }
    />
  );
}
