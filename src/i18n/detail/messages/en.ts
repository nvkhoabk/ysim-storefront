// F07A-2C-3_LOCALIZED_DETAIL_CANDIDATE_R4

import type { DetailMessages } from "../detail.types";

export const detailMessagesEn = {
  "preview.title": "Localized detail-page candidate",
  "preview.description":
    "Review static interface copy for product-detail and destination-detail experiences in Vietnamese, English, and Lao.",
  "preview.candidate":
    "This is an isolated preview route. Production detail routes are not localized by this package.",
  "preview.dynamicBoundary":
    "Source names, descriptions, and attributes remain unchanged so WooCommerce content is never falsely translated.",
  "preview.currencyPending":
    "{{currency}} prices stay hidden until the exchange-rate and order-snapshot pipeline is complete.",
  "tabs.product": "eSIM detail",
  "tabs.destination": "Destination detail",
  "common.catalogSource": "Catalog source",
  "common.backToListings": "Back to listings",
  "common.viewDetails": "View details",
  "common.days": "{{count}} days",
  "common.notAvailable": "Not available",
  "common.sourceContent": "Source content",
  "product.eyebrow": "Product detail",
  "product.title": "eSIM detail page",
  "product.sourceTitle": "Source title: {{title}}",
  "product.sourceDescription": "Source description: {{description}}",
  "product.overviewTitle": "Plan information",
  "product.destinationLabel": "Destination",
  "product.networkLabel": "Network",
  "product.dataLabel": "Data allowance",
  "product.durationLabel": "Duration",
  "product.activationLabel": "Activation",
  "product.hotspotLabel": "Hotspot",
  "product.phoneNumberLabel": "Phone number",
  "product.purchaseTitle": "Purchase selection",
  "product.purchaseDescription":
    "This area validates interface labels only; it does not create a cart or reserve inventory.",
  "product.quantityLabel": "Quantity",
  "product.addToCart": "Add to cart",
  "product.buyNow": "Buy now",
  "product.deliveryTitle": "Receive your eSIM quickly",
  "product.deliveryDescription":
    "The QR code and installation guide are delivered after successful payment and fulfillment.",
  "product.compatibilityTitle": "Check your device",
  "product.compatibilityDescription":
    "Confirm that the phone supports eSIM and is carrier-unlocked before purchase.",
  "product.relatedTitle": "Related plans",
  "product.relatedDescription":
    "The names below are source catalog content and have not been translated.",
  "product.relatedAction": "View plan",
  "product.sourceNotice":
    "Names, descriptions, and attributes in this block are untranslated source data.",
  "product.pricePending":
    "Price is hidden because currency conversion is not active.",
  "product.breadcrumbCatalog": "eSIM listing",
  "product.breadcrumbCurrent": "Current product",
  "destination.eyebrow": "Destination detail",
  "destination.title": "Destination page",
  "destination.sourceTitle": "Source title: {{title}}",
  "destination.sourceDescription": "Source description: {{description}}",
  "destination.overviewTitle": "Destination information",
  "destination.regionLabel": "Region",
  "destination.catalogCountLabel": "{{count}} catalog plans",
  "destination.plansTitle": "Plans for this destination",
  "destination.plansDescription":
    "Plan names stay unchanged from source data; prices are hidden.",
  "destination.sourceNotice":
    "The destination name and description are untranslated source content.",
  "destination.viewPlan": "View plan",
  "destination.emptyTitle": "No suitable plans yet",
  "destination.emptyDescription":
    "Return to the listing or try another destination.",
  "destination.breadcrumbCatalog": "Destination listing",
  "destination.breadcrumbCurrent": "Current destination",
  "states.loading": "Loading details…",
  "states.error": "Unable to load detail data.",
  "states.retry": "Try again",
  "states.notFound": "Content not found.",
  "states.sourceOnly": "Untranslated source data",
  "states.noPrice": "No price or FX simulation",
  "states.noInventoryMutation": "Preview does not change cart or inventory",
  "labels.preview": "Localized detail-page preview",
  "labels.tabs": "Choose detail-page type",
  "labels.breadcrumb": "Breadcrumb",
  "labels.productOverview": "Product overview",
  "labels.productActions": "Product actions",
  "labels.productMeta": "Product attributes",
  "labels.relatedProducts": "Related products",
  "labels.destinationOverview": "Destination overview",
  "labels.destinationProducts": "Destination plans",
  "labels.localeNavigation": "Choose preview locale",
} as const satisfies DetailMessages;
