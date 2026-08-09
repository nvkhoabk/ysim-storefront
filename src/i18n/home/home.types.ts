// F07A-2C-1_LOCALIZED_HOME_CANDIDATE_R1

import type { ShellLocale } from "@/i18n/shell/shell.types";

export type HomeLocale = ShellLocale;

export const HOME_MESSAGE_KEYS = [
  "preview.title",
  "preview.description",
  "preview.candidate",
  "preview.dynamicContent",
  "preview.currencyPending",
  "hero.eyebrow",
  "hero.title",
  "hero.highlighted",
  "hero.description",
  "hero.primary",
  "hero.secondary",
  "hero.benefitGlobal",
  "hero.benefitInstant",
  "hero.benefitSecure",
  "hero.benefitSupport",
  "destinations.eyebrow",
  "destinations.title",
  "destinations.description",
  "destinations.viewAll",
  "destinations.japan",
  "destinations.korea",
  "destinations.thailand",
  "destinations.singapore",
  "destinations.cardAction",
  "products.eyebrow",
  "products.title",
  "products.description",
  "products.sourceLabel",
  "products.sourcePending",
  "products.viewAll",
  "assistant.eyebrow",
  "assistant.title",
  "assistant.description",
  "assistant.action",
  "why.eyebrow",
  "why.title",
  "why.description",
  "why.instantTitle",
  "why.instantDescription",
  "why.transparentTitle",
  "why.transparentDescription",
  "why.coverageTitle",
  "why.coverageDescription",
  "why.supportTitle",
  "why.supportDescription",
  "steps.eyebrow",
  "steps.title",
  "steps.description",
  "steps.chooseTitle",
  "steps.chooseDescription",
  "steps.scanTitle",
  "steps.scanDescription",
  "steps.connectTitle",
  "steps.connectDescription",
  "device.eyebrow",
  "device.title",
  "device.description",
  "device.action",
  "reviews.eyebrow",
  "reviews.title",
  "reviews.description",
  "reviews.quote",
  "reviews.author",
  "partners.eyebrow",
  "partners.title",
  "partners.description",
  "guides.eyebrow",
  "guides.title",
  "guides.description",
  "guides.installTitle",
  "guides.installDescription",
  "guides.roamingTitle",
  "guides.roamingDescription",
  "guides.deviceTitle",
  "guides.deviceDescription",
  "guides.read",
  "cta.eyebrow",
  "cta.title",
  "cta.description",
  "cta.primary",
  "cta.secondary",
  "labels.localeNavigation",
  "labels.homePreview",
  "labels.destinationGrid",
  "labels.productGrid",
  "labels.whyGrid",
  "labels.stepsList",
  "labels.guideGrid",
] as const;

export type HomeMessageKey = (typeof HOME_MESSAGE_KEYS)[number];

export type HomeMessages = Readonly<Record<HomeMessageKey, string>>;

export interface CatalogProductFixture {
  readonly sku: string;
  readonly sourceTitle: string;
}

export interface LocalizedHomeRoutes {
  readonly browseEsim: string;
  readonly destinations: string;
  readonly packageAssistant: string;
  readonly deviceCheck: string;
  readonly guides: string;
  readonly support: string;
}

export interface LocalizedHomeBundle {
  readonly locale: HomeLocale;
  readonly marketId: string;
  readonly currency: "VND" | "USD" | "LAK";
  readonly htmlLang: string;
  readonly direction: "ltr" | "rtl";
  readonly routes: LocalizedHomeRoutes;
  readonly catalogProducts: readonly CatalogProductFixture[];
}
