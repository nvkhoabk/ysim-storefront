import {
  storefrontHomeContent,
} from "@/config/storefront-home";

import {
  homePreviewDestinations,
  homePreviewProducts,
} from "@/config/storefront-home-preview";

import {
  productionHomeGuideSection,
} from "@/config/storefront-production-home";

import {
  contentPreviewArticles,
} from "@/config/storefront-content-preview";

import {
  homeHero,
} from "@/config/storefront-heroes";

import {
  createArticleCardViewModel,
} from "@/lib/content/refactor/content-presenter";

import type {
  ContentGateway,
} from "@/lib/content/refactor/content-gateway";

import type {
  HomePageViewModel,
} from "@/types/view-models/home";

import type {
  HomeCommerceGateway,
  HomeProductionDiagnosticViewModel,
} from "@/types/view-models/home-production";

import type {
  ArticleCardViewModel,
  ContentLocale,
} from "@/types/view-models/content";

import type {
  DestinationCardViewModel,
} from "@/types/view-models/destination";

import type {
  ProductCardViewModel,
} from "@/types/view-models/product-card";

import type {
  HomeRouteDataAdapter,
} from "./home-route-adapter";

import {
  createHomeHeroSearchItems,
} from "./home-search-presenter";

import {
  mapWooCommerceHomeDestinations,
  mapWooCommerceHomeProducts,
} from "./woocommerce-home-mapper";

export interface ProductionHomeRouteAdapterOptions {
  commerceGateway:
    HomeCommerceGateway;
  contentGateway:
    ContentGateway;
  locale:
    ContentLocale;
  productLimit: number;
  destinationLimit: number;
  guideLimit: number;
}

function errorMessage(
  error: unknown,
): string {
  return error instanceof
    Error
    ? error.message
    : String(
        error,
      );
}

function normalizeArticleHref(
  slug: string,
): string {
  return `/guides/${slug}`;
}

export function createProductionHomeRouteAdapter({
  commerceGateway,
  contentGateway,
  locale,
  productLimit,
  destinationLimit,
  guideLimit,
}: ProductionHomeRouteAdapterOptions):
  HomeRouteDataAdapter {
  let diagnostics:
    HomeProductionDiagnosticViewModel[] = [];

  return {
    id:
      "production-home-route-adapter",

    async load():
      Promise<
        HomePageViewModel
      > {
      diagnostics = [];

      const [
        commerceResult,
        contentResult,
      ] =
        await Promise.allSettled([
          commerceGateway.load(),

          contentGateway.list({
            kind:
              "guide",

            locale,

            page:
              1,

            pageSize:
              guideLimit,
          }),
        ]);

      let destinations:
        readonly DestinationCardViewModel[] =
          homePreviewDestinations;

      let products:
        readonly ProductCardViewModel[] =
          homePreviewProducts;

      if (
        commerceResult.status ===
        "fulfilled"
      ) {
        const mappedDestinations =
          mapWooCommerceHomeDestinations(
            commerceResult.value,
            destinationLimit,
          );

        const mappedProducts =
          mapWooCommerceHomeProducts(
            commerceResult.value,
            productLimit,
          );

        if (
          mappedDestinations.length >
            0 &&
          mappedProducts.length >
            0
        ) {
          destinations =
            mappedDestinations;

          products =
            mappedProducts;

          diagnostics.push({
            domain:
              "commerce",

            label:
              "WooCommerce",

            status:
              "live",

            statusLabel:
              "Live",

            message:
              `${mappedDestinations.length} điểm đến · ${mappedProducts.length} sản phẩm.`,

            itemCount:
              mappedDestinations.length +
              mappedProducts.length,
          });
        } else {
          diagnostics.push({
            domain:
              "commerce",

            label:
              "WooCommerce",

            status:
              "fallback",

            statusLabel:
              "Fallback",

            message:
              "API hoạt động nhưng chưa map được đủ Destination/Product; đang dùng fixture đã review.",
          });
        }
      } else {
        diagnostics.push({
          domain:
            "commerce",

          label:
            "WooCommerce",

          status:
            "fallback",

          statusLabel:
            "Fallback",

          message:
            `Không tải được catalog: ${errorMessage(
              commerceResult.reason,
            )}`,
        });
      }

      let guides:
        readonly ArticleCardViewModel[] =
          contentPreviewArticles
            .slice(
              0,
              guideLimit,
            );

      if (
        contentResult.status ===
        "fulfilled" &&
        contentResult.value.length >
          0
      ) {
        guides =
          contentResult.value
            .slice(
              0,
              guideLimit,
            )
            .map(
              (source) => {
                const article =
                  createArticleCardViewModel(
                    source,
                  );

                return {
                  ...article,

                  imageUrl:
                    article.imageUrl?.replace(
                      "http://shop.ysim.vn/",
                      "https://shop.ysim.vn/",
                    ),

                  href:
                    normalizeArticleHref(
                      source.slug,
                    ),
                };
              },
            );

        diagnostics.push({
          domain:
            "content",

          label:
            "WordPress",

          status:
            "live",

          statusLabel:
            "Live",

          message:
            `${guides.length} bài Guide từ plugin YSim Content.`,

          itemCount:
            guides.length,
        });
      } else if (
        contentResult.status ===
        "fulfilled"
      ) {
        diagnostics.push({
          domain:
            "content",

          label:
            "WordPress",

          status:
            "fallback",

          statusLabel:
            "Fallback",

          message:
            "Endpoint hoạt động nhưng chưa có Guide phù hợp; đang dùng fixture đã review.",
        });
      } else {
        diagnostics.push({
          domain:
            "content",

          label:
            "WordPress",

          status:
            "fallback",

          statusLabel:
            "Fallback",

          message:
            `Không tải được Guide: ${errorMessage(
              contentResult.reason,
            )}`,
        });
      }

      return {
        hero: {
          ...homeHero,

          primaryAction:
            undefined,

          secondaryAction:
            undefined,
        },

        heroSearchItems:
          createHomeHeroSearchItems({
            destinations,
            products,
            guides,
          }),

        destinations,

        products,

        guides,

        content: {
          ...storefrontHomeContent,

          guideSection:
            productionHomeGuideSection,
        },
      };
    },

    getDiagnostics() {
      return diagnostics;
    },
  };
}
