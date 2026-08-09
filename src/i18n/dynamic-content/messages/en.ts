// F07A-2E-1_DYNAMIC_CONTENT_LOCALIZATION_CANDIDATE_R1

import type { DynamicContentMessages } from "../dynamic-content.types";

export const dynamicContentMessagesEn: DynamicContentMessages = {
  "preview.title": "Dynamic content localization",
  "preview.description":
    "A candidate that validates multilingual content overlays for WooCommerce products, destinations, and WordPress guides.",
  "preview.candidate":
    "Enabled only in UI preview; production adapters and source data remain unchanged.",
  "preview.policy":
    "Content comes from explicit locale records; no machine translation or runtime content generation is used.",
  "preview.authority":
    "IDs, SKUs, prices, stock, and variations remain authoritative in WooCommerce.",
  "preview.fallback":
    "When a translation is missing, the resolver must return an explicit fallback with provenance.",
  "views.product": "Product",
  "views.destination": "Destination",
  "views.guide": "Guide",
  "views.fallback": "Fallback",
  "common.sourceSystem": "Source system",
  "common.entityId": "Entity ID",
  "common.slug": "Slug",
  "common.requestedLocale": "Requested locale",
  "common.resolvedLocale": "Resolved locale",
  "common.status": "Resolution status",
  "common.localized": "Localized",
  "common.fallback": "Fallback used",
  "common.title": "Title",
  "common.summary": "Summary",
  "common.description": "Description",
  "common.imageAlt": "Image description",
  "common.provenance": "Content provenance",
  "common.noFallback": "No fallback",
  "common.fallbackReason": "Fallback reason",
  "common.textOverlay": "Text overlay",
  "common.sourceAuthority": "Authoritative source data",
  "common.previewOnly": "UI candidate only; no live content API is called.",
  "product.eyebrow": "Product content",
  "product.heading": "Locale-resolved product content",
  "product.authorityHeading": "Authoritative WooCommerce snapshot",
  "product.productId": "Product ID",
  "product.sku": "SKU",
  "product.sourceCurrency": "Source currency",
  "product.sourcePrice": "Source price",
  "product.stock": "Stock",
  "product.variations": "Variation count",
  "product.stockValue": "In stock",
  "product.overlayNotice":
    "Only title, summary, description, and image alt are overlaid by localization.",
  "destination.eyebrow": "Destination content",
  "destination.heading": "Localized destination taxonomy content",
  "destination.notice":
    "Taxonomy ID and slug remain stable; only display text is localized.",
  "guide.eyebrow": "WordPress content",
  "guide.heading": "Localized travel guide",
  "guide.notice":
    "Article identity and publication state remain authoritative in WordPress; the candidate only illustrates resolved text fields.",
  "fallback.eyebrow": "Fallback policy",
  "fallback.heading": "Result when a translation is missing",
  "fallback.notice":
    "Fallback must disclose requested locale, resolved locale, and reason; it must not pretend to be a complete translation.",
  "fallback.reasonMissing":
    "No content record exists for the requested locale.",
  "fallback.reasonNone": "Fallback was not used.",
  "labels.preview": "Dynamic content localization candidate",
  "labels.tabs": "Choose dynamic content type",
  "labels.localeNavigation": "Select preview language",
  "labels.contentCard": "Resolved content",
  "labels.authorityCard": "Authoritative source data",
  "labels.provenance": "Provenance and fallback information",
};
