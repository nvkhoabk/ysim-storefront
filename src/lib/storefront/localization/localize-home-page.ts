import { createHomeTranslator } from "@/i18n/home/home.registry";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import type { HomePageViewModel } from "@/types/view-models/home";

function localizedHref(href: string, locale: ShellLocale): string {
  return href.startsWith("/") ? localizeShellHref(href, locale) : href;
}

export function localizeHomePageViewModel(
  page: HomePageViewModel,
  locale: ShellLocale,
): HomePageViewModel {
  const t = createHomeTranslator(locale);

  return {
    ...page,
    hero: {
      ...page.hero,
      eyebrow: t("hero.eyebrow"),
      title: t("hero.title"),
      highlightedText: t("hero.highlighted"),
      description: t("hero.description"),
      primaryAction: {
        label: t("hero.primary"),
        href: localizeShellHref("/esim", locale),
        variant: "primary",
      },
      secondaryAction: {
        label: t("hero.secondary"),
        href: localizeShellHref("/package-assistant", locale),
        variant: "outline",
      },
      benefits: [
        { label: t("hero.benefitGlobal"), icon: "global" },
        { label: t("hero.benefitInstant"), icon: "instant" },
        { label: t("hero.benefitSecure"), icon: "secure" },
        { label: t("hero.benefitSupport"), icon: "support" },
      ],
      media: page.hero.media
        ? { ...page.hero.media, alt: t("hero.description") }
        : undefined,
    },
    heroSearchItems: page.heroSearchItems.map((item) => ({
      ...item,
      href: localizedHref(item.href, locale),
    })),
    destinations: page.destinations.map((item) => ({
      ...item,
      href: localizedHref(item.href, locale),
    })),
    products: page.products.map((item) => ({
      ...item,
      href: localizedHref(item.href, locale),
    })),
    guides: page.guides?.map((item) => ({
      ...item,
      href: localizedHref(item.href, locale),
    })),
    content: {
      destinationSection: {
        eyebrow: t("destinations.eyebrow"),
        title: t("destinations.title"),
        description: t("destinations.description"),
        actionLabel: t("destinations.viewAll"),
        actionHref: localizeShellHref("/destinations", locale),
      },
      productSection: {
        eyebrow: t("products.eyebrow"),
        title: t("products.title"),
        description: t("products.description"),
        actionLabel: t("products.viewAll"),
        actionHref: localizeShellHref("/esim", locale),
      },
      guideSection: page.content.guideSection
        ? {
            eyebrow: t("guides.eyebrow"),
            title: t("guides.title"),
            description: t("guides.description"),
            actionLabel: t("guides.read"),
            actionHref: localizeShellHref("/guides", locale),
          }
        : undefined,
      selectionAssistant: {
        eyebrow: t("assistant.eyebrow"),
        title: t("assistant.title"),
        description: t("assistant.description"),
        actionLabel: t("assistant.action"),
        actionHref: localizeShellHref("/package-assistant", locale),
      },
      valueProposition: {
        eyebrow: t("why.eyebrow"),
        title: t("why.title"),
        description: t("why.description"),
        items: [
          {
            title: t("why.instantTitle"),
            description: t("why.instantDescription"),
            icon: "instant",
          },
          {
            title: t("why.transparentTitle"),
            description: t("why.transparentDescription"),
            icon: "transparent",
          },
          {
            title: t("why.supportTitle"),
            description: t("why.supportDescription"),
            icon: "support",
          },
          {
            title: t("why.coverageTitle"),
            description: t("why.coverageDescription"),
            icon: "global",
          },
        ],
      },
      howItWorks: {
        eyebrow: t("steps.eyebrow"),
        title: t("steps.title"),
        description: t("steps.description"),
        steps: [
          {
            step: 1,
            title: t("steps.chooseTitle"),
            description: t("steps.chooseDescription"),
            icon: "choose",
          },
          {
            step: 2,
            title: t("steps.scanTitle"),
            description: t("steps.scanDescription"),
            icon: "receive",
          },
          {
            step: 3,
            title: t("steps.connectTitle"),
            description: t("steps.connectDescription"),
            icon: "connect",
          },
        ],
      },
      testimonials: {
        eyebrow: t("reviews.eyebrow"),
        title: t("reviews.title"),
        description: t("reviews.description"),
        items: page.content.testimonials.items.map((item) => ({
          ...item,
          quote: t("reviews.quote"),
        })),
      },
      partners: {
        eyebrow: t("partners.eyebrow"),
        title: t("partners.title"),
        description: t("partners.description"),
        items: page.content.partners.items,
      },
    },
  };
}
