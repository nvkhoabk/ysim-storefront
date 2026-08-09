import type { LocalizedShellBundle } from "../shell/shell.types";

export const MARKET_REQUEST_HEADERS = {
  id: "x-ysim-market-id",
  locale: "x-ysim-locale",
  currency: "x-ysim-currency",
  source: "x-ysim-market-source",
  publicPathname: "x-ysim-public-pathname",
} as const;

export interface StorefrontLocaleRequest {
  readonly localized: boolean;
  readonly publicPathname: string;
  readonly shell: LocalizedShellBundle;
}
