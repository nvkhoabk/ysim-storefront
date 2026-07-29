// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

import type { StorefrontFooterConfig } from "../../config/storefront-footer";
import type { StorefrontNavigationConfig } from "../../config/storefront-navigation";

export type ShellLocale = "vi" | "en" | "lo";

export interface ShellMessageTree {
  readonly [key: string]: string | ShellMessageTree;
}

export interface ShellMessages extends ShellMessageTree {
  readonly announcement: ShellMessageTree;
  readonly navigation: ShellMessageTree;
  readonly quickAccess: ShellMessageTree;
  readonly footer: ShellMessageTree;
  readonly labels: ShellMessageTree;
  readonly preview: ShellMessageTree;
}

export interface LocalizedShellLabels {
  readonly skipNavigation: string;
  readonly secondaryNavigation: string;
  readonly supplementaryInformation: string;
  readonly mainNavigation: string;
  readonly quickAccessNavigation: string;
  readonly quickAccessPopular: string;
  readonly serviceCommitments: string;
  readonly socialNavigation: string;
  readonly applicationTitle: string;
  readonly comingSoon: string;
  readonly download: string;
  readonly paymentTitle: string;
  readonly legalNavigation: string;
  readonly languageSelect: string;
  readonly language: string;
  readonly cart: string;
  readonly cartWithCount: string;
  readonly openMenu: string;
  readonly closeMenu: string;
  readonly mobileMenuDialog: string;
  readonly mobileNavigation: string;
  readonly announcementClose: string;
  readonly brandHome: string;
}

export type ShellLanguageSwitchMode = "display" | "preview" | "market";

export interface ShellLanguageSwitchConfig {
  readonly mode: ShellLanguageSwitchMode;
  readonly previewPath?: string;
}

export interface LocalizedShellBundle {
  readonly locale: ShellLocale;
  readonly marketId: string;
  readonly currency: "VND" | "USD" | "LAK";
  readonly htmlLang: string;
  readonly direction: "ltr" | "rtl";
  readonly navigation: StorefrontNavigationConfig;
  readonly footer: StorefrontFooterConfig;
  readonly labels: LocalizedShellLabels;
}
