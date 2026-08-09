// F07A-2E-1_DYNAMIC_CONTENT_LOCALIZATION_CANDIDATE_R1

import type { ShellLocale } from "../shell/shell.types";

export type DynamicContentLocale = ShellLocale;
export type DynamicContentView =
  "product" | "destination" | "guide" | "fallback";
export type DynamicEntityKind = "product" | "destination" | "guide";
export type DynamicSourceSystem = "woocommerce" | "wordpress";
export type DynamicResolutionStatus = "localized" | "fallback";
export type DynamicContentMessages = Readonly<Record<string, string>>;

export interface LocalizedContentFields {
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly imageAlt: string;
}

export interface CommerceAuthoritySnapshot {
  readonly productId: number;
  readonly sku: string;
  readonly sourceCurrency: "VND";
  readonly sourcePriceLabel: "169.000 ₫";
  readonly stockState: "in-stock";
  readonly variationCount: 76;
}

export interface DynamicContentRecord {
  readonly entityId: string;
  readonly kind: DynamicEntityKind;
  readonly sourceSystem: DynamicSourceSystem;
  readonly slug: string;
  readonly requestedLocale: DynamicContentLocale;
  readonly resolvedLocale: DynamicContentLocale;
  readonly status: DynamicResolutionStatus;
  readonly fallbackReason: string | null;
  readonly fields: LocalizedContentFields;
  readonly commerceAuthority: CommerceAuthoritySnapshot | null;
}

export interface DynamicContentRoutes {
  readonly preview: Readonly<Record<DynamicContentView, string>>;
}

export interface LocalizedDynamicContentBundle {
  readonly locale: DynamicContentLocale;
  readonly marketId: string;
  readonly currency: "VND" | "USD" | "LAK";
  readonly htmlLang: string;
  readonly direction: "ltr" | "rtl";
  readonly routes: DynamicContentRoutes;
  readonly records: Readonly<Record<DynamicContentView, DynamicContentRecord>>;
}

export type DynamicContentTranslator = (
  key: string,
  params?: Readonly<Record<string, string | number>>,
) => string;
