// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1

import type { CurrencyMessages } from "../currency.types";

export const currencyMessagesEn: CurrencyMessages = {
  "preview.title": "Currency quote and price snapshot",
  "preview.description":
    "A candidate that validates integer conversion, quote provenance, expiry, and display snapshots before production integration.",
  "preview.fixtureWarning":
    "Rates on this page are illustrative fixtures only. They are not live rates and must not be used to charge customers.",
  "preview.sourceAuthority":
    "The authoritative source price remains 169,000 VND; converted amounts are display-only candidate values.",
  "views.quote": "Quote",
  "views.rounding": "Rounding",
  "views.snapshot": "Price snapshot",
  "views.expired": "Expired",
  "common.sourceAmount": "Source amount",
  "common.targetAmount": "Display amount",
  "common.sourceCurrency": "Source currency",
  "common.targetCurrency": "Target currency",
  "common.market": "Market",
  "common.quoteId": "Quote ID",
  "common.provider": "Rate provider",
  "common.rateVersion": "Rate version",
  "common.effectiveAt": "Effective at",
  "common.quotedAt": "Quoted at",
  "common.expiresAt": "Expires at",
  "common.evaluatedAt": "Evaluated at",
  "common.status": "Status",
  "common.valid": "Valid",
  "common.expired": "Expired",
  "common.purpose": "Purpose",
  "common.roundingMode": "Rounding rule",
  "common.fingerprint": "Snapshot fingerprint",
  "common.numerator": "Numerator",
  "common.denominator": "Denominator",
  "common.targetMinor": "Target minor units",
  "common.sourceMinor": "Source minor units",
  "common.previewOnly": "UI preview only",
  "common.fixtureOnly": "fixture-only",
  "common.halfAway": "Half away from zero",
  "quote.heading": "Market display quote",
  "quote.notice":
    "The calculation uses BigInt and the existing money utility; no floating-point money rounding is used.",
  "rounding.heading": "Integer calculation details",
  "rounding.formula":
    "The target amount is calculated from source minor units, a rational rate, and target currency minor units.",
  "rounding.result": "Result after half-away-from-zero rounding.",
  "snapshot.heading": "Immutable display snapshot",
  "snapshot.notice":
    "The snapshot records provenance, rate, timestamps, and the display result; it is not a payment or settlement instruction.",
  "expired.heading": "Expired quote",
  "expired.notice":
    "An expired quote must be rejected before payment and refreshed from a production rate source in a later phase.",
  "expired.action": "Cannot continue with an expired quote",
  "labels.preview": "Currency quote and snapshot candidate",
  "labels.tabs": "Choose quote state",
  "labels.localeNavigation": "Select preview language",
  "labels.quoteCard": "Quote information",
  "labels.calculationCard": "Calculation details",
  "labels.snapshotCard": "Snapshot information",
  "labels.expiredCard": "Expired quote state",
};
