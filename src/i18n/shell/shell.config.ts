// F07A-2B_GLOBAL_SHELL_LOCALIZATION_R2

import { MARKET_CONFIGS } from "../../config/markets";
import type { StorefrontFooterConfig } from "../../config/storefront-footer";
import type {
  NavigationLink,
  StorefrontNavigationConfig,
} from "../../config/storefront-navigation";
import { localizeShellHref } from "./shell.href";
import { createShellTranslator, normalizeShellLocale } from "./shell.registry";
import type {
  LocalizedShellBundle,
  LocalizedShellLabels,
  ShellLocale,
} from "./shell.types";

function localizedLink(
  locale: ShellLocale,
  label: string,
  href: string,
  description?: string,
): NavigationLink {
  return {
    label,
    href: localizeShellHref(href, locale),
    ...(description ? { description } : {}),
  };
}

export function createLocalizedShellBundle(
  localeInput: unknown,
): LocalizedShellBundle {
  const locale = normalizeShellLocale(localeInput);
  const t = createShellTranslator(locale);
  const market = MARKET_CONFIGS.find(
    (candidate) => candidate.locale === locale,
  );
  if (!market) throw new Error(`SHELL_MARKET_NOT_FOUND:${locale}`);

  const navigation: StorefrontNavigationConfig = {
    announcement: {
      enabled: true,
      message: t("announcement.message"),
      actionLabel: t("announcement.action"),
      actionHref: localizeShellHref("/support", locale),
      storageKey: `ysim:announcement:${locale}:global-shell-r2`,
    },
    mainItems: [
      {
        label: t("navigation.buyEsim"),
        href: localizeShellHref("/esim", locale),
      },
      {
        label: t("navigation.destinations"),
        groups: [
          {
            label: t("navigation.asia"),
            links: [
              localizedLink(
                locale,
                t("navigation.japan"),
                "/destinations#japan",
                t("navigation.japanDescription"),
              ),
              localizedLink(
                locale,
                t("navigation.korea"),
                "/destinations#korea",
                t("navigation.koreaDescription"),
              ),
              localizedLink(
                locale,
                t("navigation.thailand"),
                "/destinations#thailand",
                t("navigation.thailandDescription"),
              ),
              localizedLink(
                locale,
                t("navigation.singapore"),
                "/destinations#singapore",
                t("navigation.singaporeDescription"),
              ),
            ],
          },
          {
            label: t("navigation.otherRegions"),
            links: [
              localizedLink(
                locale,
                t("navigation.europe"),
                "/destinations#europe",
              ),
              localizedLink(
                locale,
                t("navigation.northAmerica"),
                "/destinations#north-america",
              ),
              localizedLink(
                locale,
                t("navigation.global"),
                "/destinations#global",
              ),
              localizedLink(
                locale,
                t("navigation.allDestinations"),
                "/destinations",
              ),
            ],
          },
        ],
      },
      {
        label: t("navigation.offers"),
        href: localizeShellHref("/offers", locale),
      },
      {
        label: t("navigation.guides"),
        groups: [
          {
            label: t("navigation.esimStart"),
            links: [
              localizedLink(locale, t("navigation.esimGuide"), "/guides"),
              localizedLink(
                locale,
                t("navigation.installEsim"),
                "/guides/nen-cai-esim-truoc-hay-sau-khi-den-noi",
              ),
              localizedLink(
                locale,
                t("navigation.deviceCheck"),
                "/guides/cach-kiem-tra-dien-thoai-ho-tro-esim",
              ),
            ],
          },
          {
            label: t("navigation.more"),
            links: [
              localizedLink(
                locale,
                t("navigation.esimAndRoaming"),
                "/guides/esim-khac-roaming-quoc-te-nhu-the-nao",
              ),
              localizedLink(locale, t("navigation.usageGuide"), "/guides"),
            ],
          },
        ],
      },
      {
        label: t("navigation.support"),
        groups: [
          {
            label: t("navigation.help"),
            links: [
              localizedLink(locale, t("navigation.helpCenter"), "/support"),
              localizedLink(
                locale,
                t("navigation.deviceCheck"),
                "/device-check",
              ),
              localizedLink(
                locale,
                t("navigation.packageAssistant"),
                "/package-assistant",
              ),
            ],
          },
          {
            label: t("navigation.contact"),
            links: [
              localizedLink(
                locale,
                t("navigation.technicalSupport"),
                "/support#technical-support",
              ),
              localizedLink(locale, t("navigation.faq"), "/support#faq"),
            ],
          },
        ],
      },
    ],
    languages: MARKET_CONFIGS.map((candidate) => ({
      code: candidate.locale,
      label: candidate.nativeLabel,
      shortLabel: candidate.locale.toUpperCase(),
    })),
    defaultLocale: locale,
    quickAccess: {
      enabled: true,
      items: [
        localizedLink(locale, t("navigation.japan"), "/destinations#japan"),
        localizedLink(locale, t("navigation.korea"), "/destinations#korea"),
        localizedLink(
          locale,
          t("navigation.thailand"),
          "/destinations#thailand",
        ),
        localizedLink(
          locale,
          t("navigation.singapore"),
          "/destinations#singapore",
        ),
        localizedLink(locale, t("navigation.usa"), "/destinations#usa"),
        localizedLink(locale, t("navigation.europe"), "/destinations#europe"),
      ],
    },
  };

  const footer: StorefrontFooterConfig = {
    brand: {
      description: t("footer.brandDescription"),
      supportEmail: "support@ysim.vn",
      location: t("footer.location"),
    },
    trustFeatures: [
      {
        title: t("footer.instantTitle"),
        description: t("footer.instantDescription"),
        icon: "instant",
      },
      {
        title: t("footer.globalTitle"),
        description: t("footer.globalDescription"),
        icon: "global",
      },
      {
        title: t("footer.secureTitle"),
        description: t("footer.secureDescription"),
        icon: "secure",
      },
      {
        title: t("footer.supportTitle"),
        description: t("footer.supportDescription"),
        icon: "support",
      },
    ],
    columns: [
      {
        title: t("footer.explore"),
        links: [
          localizedLink(locale, t("navigation.buyEsim"), "/esim"),
          localizedLink(locale, t("navigation.destinations"), "/destinations"),
          localizedLink(locale, t("navigation.offers"), "/offers"),
          localizedLink(locale, t("navigation.guides"), "/guides"),
        ],
      },
      {
        title: t("navigation.support"),
        links: [
          localizedLink(locale, t("navigation.helpCenter"), "/support"),
          localizedLink(locale, t("navigation.deviceCheck"), "/device-check"),
          localizedLink(
            locale,
            t("navigation.packageAssistant"),
            "/package-assistant",
          ),
          localizedLink(locale, t("navigation.faq"), "/support#faq"),
        ],
      },
      {
        title: t("footer.partner"),
        links: [
          localizedLink(locale, t("footer.partnerProgram"), "/partners"),
          localizedLink(
            locale,
            t("footer.agencyRegister"),
            "/partners/register",
          ),
          localizedLink(locale, t("footer.apiDocs"), "/partners/api"),
          {
            ...localizedLink(
              locale,
              t("footer.partnerPortal"),
              "/partners/portal",
            ),
            badge: t("footer.introduction"),
          },
        ],
      },
    ],
    appLinks: [
      { platform: "iOS", label: "App Store", href: "#", comingSoon: true },
      {
        platform: "Android",
        label: "Google Play",
        href: "#",
        comingSoon: true,
      },
    ],
    socialLinks: [
      {
        label: "Facebook",
        href: "https://www.facebook.com/",
        icon: "facebook",
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/",
        icon: "instagram",
      },
      { label: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
      {
        label: t("footer.supportMessage"),
        href: localizeShellHref("/support", locale),
        icon: "message",
      },
    ],
    paymentMethods: ["Visa", "Mastercard", "NAPAS", "GPay", "OnePay"],
    legalLinks: [
      localizedLink(locale, t("footer.terms"), "/policies/terms"),
      localizedLink(locale, t("footer.privacy"), "/policies/privacy"),
      localizedLink(locale, t("footer.refund"), "/policies/refund"),
      localizedLink(locale, t("footer.paymentPolicy"), "/policies/payment"),
    ],
    copyright: t("footer.copyright"),
    securityNote: t("footer.securityNote"),
  };

  const labels: LocalizedShellLabels = {
    skipNavigation: t("labels.skipNavigation"),
    secondaryNavigation: t("labels.secondaryNavigation"),
    supplementaryInformation: t("labels.supplementaryInformation"),
    mainNavigation: t("labels.mainNavigation"),
    quickAccessNavigation: t("labels.quickAccessNavigation"),
    quickAccessPopular: t("quickAccess.popular"),
    serviceCommitments: t("labels.serviceCommitments"),
    socialNavigation: t("labels.socialNavigation"),
    applicationTitle: t("labels.applicationTitle"),
    comingSoon: t("labels.comingSoon"),
    download: t("labels.download"),
    paymentTitle: t("labels.paymentTitle"),
    legalNavigation: t("labels.legalNavigation"),
    languageSelect: t("labels.languageSelect"),
    language: t("labels.language"),
    cart: t("labels.cart"),
    cartWithCount: t("labels.cartWithCount"),
    openMenu: t("labels.openMenu"),
    closeMenu: t("labels.closeMenu"),
    mobileMenuDialog: t("labels.mobileMenuDialog"),
    mobileNavigation: t("labels.mobileNavigation"),
    announcementClose: t("labels.announcementClose"),
    brandHome: t("labels.brandHome"),
  };

  return {
    locale,
    marketId: market.id,
    currency: market.currency,
    htmlLang: market.htmlLang,
    direction: market.direction,
    navigation,
    footer,
    labels,
  };
}
