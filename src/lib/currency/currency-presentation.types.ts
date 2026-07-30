// F07A-3B_CURRENCY_PRESENTATION_INTEGRATION_CANDIDATE_R1

import type {
  PriceDisplaySnapshot,
  QuoteLifecycleStatus,
  SupportedQuoteCurrency,
} from "./currency-quote.types";

export type CurrencyPresentationContext =
  "home" | "listing" | "detail" | "transaction";
export type CurrencyPresentationRole =
  "indicative-display" | "checkout-preview";

export interface CurrencyPresentationModel {
  readonly presentationId: string;
  readonly context: CurrencyPresentationContext;
  readonly role: CurrencyPresentationRole;
  readonly productionEligible: false;
  readonly sourceCurrency: "VND";
  readonly targetCurrency: SupportedQuoteCurrency;
  readonly sourceAmountMinor: bigint;
  readonly targetAmountMinor: bigint;
  readonly formattedSource: string;
  readonly formattedTarget: string;
  readonly quoteId: string;
  readonly quoteStatus: QuoteLifecycleStatus;
  readonly snapshot: PriceDisplaySnapshot;
}
