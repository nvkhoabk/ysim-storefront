// F07A-2C-2_LOCALIZED_LISTING_CANDIDATE_R1

import type { ShellLocale } from "@/i18n/shell/shell.types";

export type ListingLocale = ShellLocale;
export type ListingView = "esim" | "destinations";

export const LISTING_MESSAGE_KEYS = [
  "preview.title",
  "preview.description",
  "preview.candidate",
  "preview.dynamicBoundary",
  "preview.currencyPending",
  "tabs.esim",
  "tabs.destinations",
  "common.all",
  "common.any",
  "common.days",
  "common.catalogSource",
  "common.clear",
  "common.apply",
  "common.viewDetails",
  "common.results",
  "esim.eyebrow",
  "esim.title",
  "esim.description",
  "esim.searchLabel",
  "esim.searchPlaceholder",
  "esim.filterTitle",
  "esim.destinationFilter",
  "esim.dataFilter",
  "esim.durationFilter",
  "esim.sortLabel",
  "esim.sortRecommended",
  "esim.sortShortest",
  "esim.resultSummary",
  "esim.sourceTitle",
  "esim.sourceDestination",
  "esim.dataAllowance",
  "esim.duration",
  "esim.cardAction",
  "esim.noResultsTitle",
  "esim.noResultsDescription",
  "esim.clearFilters",
  "destinations.eyebrow",
  "destinations.title",
  "destinations.description",
  "destinations.searchLabel",
  "destinations.searchPlaceholder",
  "destinations.filterTitle",
  "destinations.regionFilter",
  "destinations.sortLabel",
  "destinations.sortRecommended",
  "destinations.sortMostPlans",
  "destinations.resultSummary",
  "destinations.sourceTitle",
  "destinations.region",
  "destinations.planCount",
  "destinations.cardAction",
  "destinations.noResultsTitle",
  "destinations.noResultsDescription",
  "destinations.clearFilters",
  "filters.destinationAll",
  "filters.destinationJapan",
  "filters.destinationAsia",
  "filters.destinationThailand",
  "filters.dataAll",
  "filters.dataDaily",
  "filters.dataTotal",
  "filters.dataUnlimited",
  "filters.durationAll",
  "filters.durationShort",
  "filters.durationMedium",
  "filters.regionAll",
  "filters.regionAsia",
  "filters.regionEurope",
  "filters.regionGlobal",
  "ordinary.explorerCountry",
  "ordinary.explorerRegion",
  "ordinary.explorerGlobal",
  "ordinary.explorerLabel",
  "ordinary.typeTitle",
  "ordinary.typeCountry",
  "ordinary.typeCountryDescription",
  "ordinary.typeRegion",
  "ordinary.typeRegionDescription",
  "ordinary.typeGlobal",
  "ordinary.typeGlobalDescription",
  "ordinary.regionAction",
  "ordinary.globalTitle",
  "ordinary.globalDescription",
  "ordinary.globalAction",
  "ordinary.benefitActivation",
  "ordinary.benefitNoPhysicalSim",
  "ordinary.benefitKeepNumber",
  "ordinary.benefitSupport",
  "ordinary.discoverEyebrow",
  "ordinary.discoverTitle",
  "ordinary.discoverAction",
  "ordinary.viewAll",
  "ordinary.catalogEyebrow",
  "ordinary.catalogTitle",
  "ordinary.catalogDescription",
  "ordinary.clearSelection",
  "ordinary.sortPriceAsc",
  "ordinary.sortPriceDesc",
  "ordinary.sortName",
  "ordinary.resultSummary",
  "ordinary.selectionSuffix",
  "ordinary.sale",
  "ordinary.outOfStock",
  "ordinary.choiceTitle",
  "ordinary.choiceDescription",
  "ordinary.choiceDestinationTitle",
  "ordinary.choiceDestinationDescription",
  "ordinary.choiceDurationTitle",
  "ordinary.choiceDurationDescription",
  "ordinary.choiceDataTitle",
  "ordinary.choiceDataDescription",
  "ordinary.choiceAction",
  "ordinary.categoryNorthAmerica",
  "ordinary.categorySouthAmerica",
  "ordinary.categoryAfrica",
  "ordinary.categoryOceania",
  "ordinary.durationLabel",
  "ordinary.sortPopular",
  "ordinary.sortPriceAscShort",
  "ordinary.matchingDestinations",
  "ordinary.resetFilters",
  "ordinary.emptyForDestination",
  "ordinary.manyDurations",
  "ordinary.planCount",
  "ordinary.priceFrom",
  "ordinary.tableDestination",
  "ordinary.tableRegion",
  "ordinary.tableDuration",
  "ordinary.tablePlans",
  "ordinary.tableAction",
  "ordinary.exploring",
  "ordinary.destinationPlansEyebrow",
  "ordinary.destinationPlansDescription",
  "ordinary.fullFilter",
  "ordinary.chooseAnotherDestination",
  "ordinary.selectedDestination",
  "ordinary.matchingProducts",
  "ordinary.featured",
  "ordinary.manyDataAllowances",
  "ordinary.durationDays",
  "ordinary.durationRange",
  "ordinary.durationFrom",
  "ordinary.durationUntil",
  "ordinary.destinationDescription",
  "ordinary.destinationImageAlt",
  "ordinary.previousDestinations",
  "ordinary.nextDestinations",
  "ordinary.previousProducts",
  "ordinary.nextProducts",
  "ordinary.previousReviews",
  "ordinary.nextReviews",
  "ordinary.destinationLinkAria",
  "ordinary.productLinkAria",
  "ordinary.flagAlt",
  "ordinary.ratingAria",
  "ordinary.guideCategory",
  "ordinary.readArticle",
  "ordinary.readArticleAria",
  "ordinary.selectionDestinationDescription",
  "ordinary.selectionGlobalDescription",
  "ordinary.selectionRegionDescription",
  "ordinary.selectionContinentDescription",
  "ordinary.selectionAllDescription",
  "states.loading",
  "states.error",
  "states.retry",
  "states.empty",
  "states.sourceOnly",
  "states.noPrices",
  "labels.preview",
  "labels.tabs",
  "labels.esimFilters",
  "labels.esimResults",
  "labels.destinationFilters",
  "labels.destinationResults",
  "labels.localeNavigation",
] as const;

export type ListingMessageKey = (typeof LISTING_MESSAGE_KEYS)[number];
export type ListingMessages = Readonly<Record<ListingMessageKey, string>>;

export interface ListingProductFixture {
  readonly sku: string;
  readonly sourceTitle: string;
  readonly sourceDestination: string;
  readonly destinationCode: "JP" | "ASIA" | "TH";
  readonly dataCode: "daily" | "total" | "unlimited";
  readonly dataSummary: string;
  readonly durationDays: number;
  readonly slug: string;
}

export interface ListingDestinationFixture {
  readonly code: string;
  readonly sourceTitle: string;
  readonly regionCode: "asia" | "europe" | "global";
  readonly catalogCount: number;
  readonly slug: string;
}

export interface LocalizedListingRoutes {
  readonly previewEsim: string;
  readonly previewDestinations: string;
  readonly productionEsim: string;
  readonly productionDestinations: string;
}

export interface LocalizedListingBundle {
  readonly locale: ListingLocale;
  readonly marketId: string;
  readonly currency: "VND" | "USD" | "LAK";
  readonly htmlLang: string;
  readonly direction: "ltr" | "rtl";
  readonly routes: LocalizedListingRoutes;
  readonly products: readonly ListingProductFixture[];
  readonly destinations: readonly ListingDestinationFixture[];
}
