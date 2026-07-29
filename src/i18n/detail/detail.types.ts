// F07A-2C-3_LOCALIZED_DETAIL_CANDIDATE_R4

import type { ShellLocale } from "@/i18n/shell/shell.types";

export type DetailLocale = ShellLocale;
export type DetailView = "product" | "destination";

export const DETAIL_MESSAGE_KEYS = [
  "preview.title",
  "preview.description",
  "preview.candidate",
  "preview.dynamicBoundary",
  "preview.currencyPending",
  "tabs.product",
  "tabs.destination",
  "common.catalogSource",
  "common.backToListings",
  "common.viewDetails",
  "common.days",
  "common.notAvailable",
  "common.sourceContent",
  "product.eyebrow",
  "product.title",
  "product.sourceTitle",
  "product.sourceDescription",
  "product.overviewTitle",
  "product.destinationLabel",
  "product.networkLabel",
  "product.dataLabel",
  "product.durationLabel",
  "product.activationLabel",
  "product.hotspotLabel",
  "product.phoneNumberLabel",
  "product.purchaseTitle",
  "product.purchaseDescription",
  "product.quantityLabel",
  "product.addToCart",
  "product.buyNow",
  "product.deliveryTitle",
  "product.deliveryDescription",
  "product.compatibilityTitle",
  "product.compatibilityDescription",
  "product.relatedTitle",
  "product.relatedDescription",
  "product.relatedAction",
  "product.sourceNotice",
  "product.pricePending",
  "product.breadcrumbCatalog",
  "product.breadcrumbCurrent",
  "destination.eyebrow",
  "destination.title",
  "destination.sourceTitle",
  "destination.sourceDescription",
  "destination.overviewTitle",
  "destination.regionLabel",
  "destination.catalogCountLabel",
  "destination.plansTitle",
  "destination.plansDescription",
  "destination.sourceNotice",
  "destination.viewPlan",
  "destination.emptyTitle",
  "destination.emptyDescription",
  "destination.breadcrumbCatalog",
  "destination.breadcrumbCurrent",
  "states.loading",
  "states.error",
  "states.retry",
  "states.notFound",
  "states.sourceOnly",
  "states.noPrice",
  "states.noInventoryMutation",
  "labels.preview",
  "labels.tabs",
  "labels.breadcrumb",
  "labels.productOverview",
  "labels.productActions",
  "labels.productMeta",
  "labels.relatedProducts",
  "labels.destinationOverview",
  "labels.destinationProducts",
  "labels.localeNavigation",
] as const;

export type DetailMessageKey = (typeof DETAIL_MESSAGE_KEYS)[number];
export type DetailMessages = Readonly<Record<DetailMessageKey, string>>;

export interface ProductDetailFixture {
  readonly sku: string;
  readonly slug: string;
  readonly sourceTitle: string;
  readonly sourceDescription: string;
  readonly sourceDestination: string;
  readonly sourceNetwork: string;
  readonly dataSummary: string;
  readonly durationDays: number;
  readonly sourceActivationPolicy: string;
  readonly sourceHotspot: string;
  readonly sourcePhoneNumber: string;
  readonly relatedSourceTitles: readonly string[];
}

export interface DestinationDetailFixture {
  readonly code: string;
  readonly slug: string;
  readonly sourceTitle: string;
  readonly sourceDescription: string;
  readonly sourceRegion: string;
  readonly sourceHeroAlt: string;
  readonly catalogCount: number;
  readonly productSourceTitles: readonly string[];
}

export interface LocalizedDetailRoutes {
  readonly previewProduct: string;
  readonly previewDestination: string;
  readonly productionProduct: string;
  readonly productionDestination: string;
  readonly productionProductListing: string;
  readonly productionDestinationListing: string;
}

export interface LocalizedDetailBundle {
  readonly locale: DetailLocale;
  readonly marketId: string;
  readonly currency: "VND" | "USD" | "LAK";
  readonly htmlLang: string;
  readonly direction: "ltr" | "rtl";
  readonly product: ProductDetailFixture;
  readonly destination: DestinationDetailFixture;
  readonly routes: LocalizedDetailRoutes;
}
