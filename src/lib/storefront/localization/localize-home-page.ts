import { createHomeTranslator } from "@/i18n/home/home.registry";
import { createListingTranslator } from "@/i18n/listing/listing.registry";
import {
  localizeContinentName,
  localizeDataLabel,
  localizeDestinationName,
  localizeDurationLabel,
} from "@/i18n/listing/static-destination.config";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import type { HomePageViewModel } from "@/types/view-models/home";

function localizedHref(href: string, locale: ShellLocale): string {
  return href.startsWith("/") ? localizeShellHref(href, locale) : href;
}

function hrefSlug(href: string): string {
  return (
    href.split("?")[0].split("#")[0].split("/").filter(Boolean).at(-1) || ""
  );
}

function guideCopy(
  value: string,
  index: number,
  t: ReturnType<typeof createHomeTranslator>,
) {
  const normalized = value.toLowerCase();
  if (normalized.includes("roaming")) {
    return {
      title: t("guides.roamingTitle"),
      description: t("guides.roamingDescription"),
    };
  }
  if (
    normalized.includes("device") ||
    normalized.includes("thiet-bi") ||
    normalized.includes("dien-thoai") ||
    index === 2
  ) {
    return {
      title: t("guides.deviceTitle"),
      description: t("guides.deviceDescription"),
    };
  }
  return {
    title: t("guides.installTitle"),
    description: t("guides.installDescription"),
  };
}

export function localizeHomePageViewModel(
  page: HomePageViewModel,
  locale: ShellLocale,
): HomePageViewModel {
  const t = createHomeTranslator(locale);
  const listing = createListingTranslator(locale);
  const localizedDestinations = page.destinations.map((item) => {
    const name = localizeDestinationName(item.slug, locale, item.name);
    return {
      ...item,
      name,
      href: localizedHref(item.href, locale),
      regionLabel: item.regionLabel
        ? localizeContinentName(
            item.slug === "usa"
              ? "north-america"
              : item.slug === "europe"
                ? "europe"
                : "asia",
            locale,
            item.regionLabel,
          )
        : undefined,
      description: listing("ordinary.destinationDescription", { name }),
      imageAlt: listing("ordinary.destinationImageAlt", { name }),
      durationLabel: localizeDurationLabel(item.durationLabel, locale),
    };
  });
  const localizedGuides = page.guides?.map((item, index) => {
    const copy = guideCopy(`${item.slug} ${item.familyCode}`, index, t);
    return {
      ...item,
      href: localizedHref(item.href, locale),
      title: copy.title,
      excerpt: copy.description,
      imageAlt: copy.title,
      category: listing("ordinary.guideCategory"),
    };
  });
  const localizedProducts = page.products.map((item) => ({
    ...item,
    href: localizedHref(item.href, locale),
    dataLabel: localizeDataLabel(item.dataLabel, locale),
    durationLabel:
      localizeDurationLabel(item.durationLabel, locale) || item.durationLabel,
  }));

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
    heroSearchItems: page.heroSearchItems.map((item) => {
      const href = localizedHref(item.href, locale);
      if (item.type === "destination") {
        const slug = hrefSlug(item.href);
        const name = localizeDestinationName(slug, locale, item.label);
        return {
          ...item,
          href,
          label: name,
          description: listing("ordinary.destinationDescription", { name }),
          meta: item.meta?.replace(
            /^Từ\s+/u,
            `${listing("ordinary.priceFrom")} `,
          ),
        };
      }
      if (item.type === "guide") {
        const guide = localizedGuides?.find(
          (candidate) => hrefSlug(candidate.href) === hrefSlug(item.href),
        );
        return guide
          ? {
              ...item,
              href,
              label: guide.title,
              description: guide.excerpt,
              meta: guide.category,
            }
          : { ...item, href };
      }
      return {
        ...item,
        href,
        description: item.description
          ?.replace(
            "Nhiều mức dung lượng",
            listing("ordinary.manyDataAllowances"),
          )
          .replace("Nhiều thời hạn", listing("ordinary.manyDurations")),
      };
    }),
    destinations: localizedDestinations,
    products: localizedProducts,
    guides: localizedGuides,
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
