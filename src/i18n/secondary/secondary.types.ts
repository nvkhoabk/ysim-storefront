// F07A-2C-4_LOCALIZED_SECONDARY_CANDIDATE_R1

import type { ShellLocale } from "../shell/shell.types";

export type SecondaryLocale = ShellLocale;
export type SecondaryView =
  "offers" | "guides" | "support" | "device-check" | "package-assistant";

export type SecondaryMessages = Readonly<Record<string, string>>;

export interface GuideSourceFixture {
  readonly slug: string;
  readonly sourceTitle: string;
  readonly sourceSummary: string;
}

export interface OfferFixture {
  readonly code: string;
  readonly badge: string;
}

export interface SecondaryRoutes {
  readonly preview: Readonly<Record<SecondaryView, string>>;
  readonly production: Readonly<Record<SecondaryView, string>>;
}

export interface LocalizedSecondaryBundle {
  readonly locale: SecondaryLocale;
  readonly marketId: string;
  readonly currency: "VND" | "USD" | "LAK";
  readonly htmlLang: string;
  readonly direction: "ltr" | "rtl";
  readonly routes: SecondaryRoutes;
  readonly guideSources: readonly GuideSourceFixture[];
  readonly offers: readonly OfferFixture[];
}

export type SecondaryTranslator = (
  key: string,
  params?: Readonly<Record<string, string | number>>,
) => string;
