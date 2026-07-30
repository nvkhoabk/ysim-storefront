// F07A-3B_CURRENCY_PRESENTATION_INTEGRATION_CANDIDATE_R1

import type { CurrencyPresentationMessages } from "../currency-presentation.types";

export const currencyPresentationMessagesEn: CurrencyPresentationMessages = {
  "preview.title": "Context-aware currency presentation integration",
  "preview.description":
    "This candidate reuses the F07A-3A quote and snapshot to present prices consistently across four UI contexts.",
  "preview.candidate":
    "UI preview only; not a payment or settlement instruction.",
  "preview.sourceAuthority": "The source VND amount remains authoritative.",
  "tabs.home": "Home",
  "tabs.listing": "Listing",
  "tabs.detail": "Detail",
  "tabs.transaction": "Transaction",
  "common.context": "Context",
  "common.market": "Market",
  "common.locale": "Locale",
  "common.sourcePrice": "Source price",
  "common.displayPrice": "Display price",
  "common.sourceCurrency": "Source currency",
  "common.targetCurrency": "Display currency",
  "common.quoteId": "Quote ID",
  "common.quoteStatus": "Quote status",
  "common.snapshotFingerprint": "Snapshot fingerprint",
  "common.snapshotCapturedAt": "Snapshot captured at",
  "common.displayRole": "Display role",
  "common.presentationId": "Presentation ID",
  "common.valid": "Valid",
  "common.indicative": "Indicative display",
  "common.checkoutPreview": "Checkout preview",
  "common.productionEligible": "Production eligible",
  "common.no": "No",
  "common.sourceSku": "Source SKU",
  "common.sourceProduct": "Source product",
  "home.heading": "Home price card",
  "home.description":
    "The display price comes from the same quote and snapshot while remaining explicitly indicative.",
  "home.note": "No catalog or cart data is changed.",
  "home.action": "Purchase is disabled in this candidate",
  "listing.heading": "Product listing price",
  "listing.description":
    "Each product card uses the shared presentation layer instead of recalculating exchange rates.",
  "listing.note":
    "Rate definitions and conversion logic are not duplicated in listing components.",
  "listing.action": "Filtering and purchase are disabled",
  "detail.heading": "Product detail price",
  "detail.description":
    "The display price and snapshot share one quote ID for UI traceability.",
  "detail.note": "This is not yet a committed transaction price.",
  "detail.action": "Add to cart is disabled",
  "transaction.heading": "Transaction price preview",
  "transaction.description":
    "The transaction context uses a checkout-preview role and an immutable snapshot.",
  "transaction.note": "No payment, order, or fulfillment is created.",
  "transaction.action": "Payment is disabled",
  "labels.preview": "Currency presentation integration candidate",
  "labels.localeNavigation": "Locale navigation",
  "labels.tabs": "Presentation contexts",
  "labels.priceCard": "Display price card",
  "labels.contextCard": "Context information",
  "labels.safety": "Safety boundary",
};
