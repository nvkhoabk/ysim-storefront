import {
  destinationPresentation,
  popularDestinationSlugs,
} from "@/config/storefront-destinations";

import {
  destinationCatalogSection,
  destinationCategoryOptions,
  destinationPageHero,
  destinationPopularSection,
  initialDestinationFilters,
} from "@/config/storefront-destination-page";

import {
  createHomeHeroSearchItems,
  mapWooCommerceHomeProducts,
} from "@/lib/storefront/integration/home";

import type {
  DestinationPageViewModel,
} from "@/types/view-models/destination-page";

import type {
  HomeCommerceGateway,
} from "@/types/view-models/home-production";

import type {
  DestinationRouteDiagnosticViewModel,
} from "@/types/view-models/destination-route-candidate";

import {
  mapProductionDestinationCatalog,
} from "./destination-production-mapper";

import type {
  DestinationRouteDataAdapter,
} from "./destination-route-adapter";

export interface ProductionDestinationRouteAdapterOptions {
  commerceGateway:
    HomeCommerceGateway;
  popularLimit: number;
  searchProductLimit: number;
}

export function createProductionDestinationRouteAdapter({
  commerceGateway,
  popularLimit,
  searchProductLimit,
}: ProductionDestinationRouteAdapterOptions):
  DestinationRouteDataAdapter {
  let diagnostics:
    DestinationRouteDiagnosticViewModel[] = [];

  return {
    id:
      "production-destination-route-adapter",

    async load():
      Promise<
        DestinationPageViewModel
      > {
      diagnostics = [];

      const snapshot =
        await commerceGateway
          .load();

      const items =
        mapProductionDestinationCatalog(
          snapshot,
        );

      if (
        items.length ===
        0
      ) {
        throw new Error(
          "WooCommerce returned no mappable purchasable destinations.",
        );
      }

      const searchProducts =
        mapWooCommerceHomeProducts(
          snapshot,
          searchProductLimit,
        );

      const popular =
        popularDestinationSlugs
          .map(
            (slug) =>
              items.find(
                (item) =>
                  item.slug ===
                  slug,
              ),
          )
          .filter(
            (
              item,
            ): item is
              typeof items[number] =>
              Boolean(
                item,
              ),
          )
          .slice(
            0,
            popularLimit,
          );

      const assetPreviewCount =
        items.filter(
          (item) =>
            item.imageUrl.startsWith(
              "/ui-preview/",
            ) ||
            item.flagUrl.startsWith(
              "/ui-preview/",
            ),
        ).length;

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
          `${snapshot.categories.length} category · ${snapshot.products.length} product records.`,
        itemCount:
          snapshot.products.length,
      });

      diagnostics.push({
        domain:
          "catalog",
        label:
          "Destination catalog",
        status:
          "live",
        statusLabel:
          "Live",
        message:
          `${items.length} điểm đến có sản phẩm mua được.`,
        itemCount:
          items.length,
      });

      diagnostics.push({
        domain:
          "search",
        label:
          "Hero Search",
        status:
          "live",
        statusLabel:
          "Live",
        message:
          `${items.length} destination · ${searchProducts.length} product search items.`,
        itemCount:
          items.length +
          searchProducts.length,
      });

      diagnostics.push({
        domain:
          "assets",
        label:
          "Destination assets",
        status:
          assetPreviewCount >
            0
            ? "warning"
            : "live",
        statusLabel:
          assetPreviewCount >
            0
            ? "Review"
            : "Ready",
        message:
          assetPreviewCount >
            0
            ? `${assetPreviewCount} destination vẫn dùng asset /ui-preview/.`
            : "Destination image và flag dùng đường dẫn production.",
        itemCount:
          assetPreviewCount,
      });

      return {
        hero: {
          ...destinationPageHero,
          primaryAction:
            undefined,
          secondaryAction:
            undefined,
        },
        heroSearchItems:
          createHomeHeroSearchItems({
            destinations:
              items,
            products:
              searchProducts,
            guides:
              [],
          }),
        popularDestinations:
          popular.length >
            0
            ? popular
            : items.slice(
                0,
                popularLimit,
              ),
        popularSection:
          destinationPopularSection,
        catalog: {
          ...destinationCatalogSection,
          categories:
            destinationCategoryOptions,
          initialFilters:
            initialDestinationFilters,
          items,
        },
      };
    },

    getDiagnostics() {
      return diagnostics;
    },
  };
}
