import type {
  HeroSearchItemViewModel,
  HeroViewModel,
} from "@/types/view-models/hero";

import type {
  DestinationCardViewModel,
} from "@/types/view-models/destination";

import type {
  ProductCardViewModel,
} from "@/types/view-models/product-card";

import type {
  ArticleCardViewModel,
} from "@/types/view-models/content";

export type ValuePropositionIcon =
  | "instant"
  | "transparent"
  | "support"
  | "global";

export type HowItWorksIcon =
  | "choose"
  | "receive"
  | "connect";

export interface ValuePropositionItemViewModel {
  title: string;
  description: string;
  icon: ValuePropositionIcon;
}

export interface ValuePropositionSectionViewModel {
  eyebrow?: string;
  title: string;
  description?: string;
  items:
    readonly ValuePropositionItemViewModel[];
}

export interface HowItWorksStepViewModel {
  step: number;
  title: string;
  description: string;
  icon: HowItWorksIcon;
}

export interface HowItWorksSectionViewModel {
  eyebrow?: string;
  title: string;
  description?: string;
  steps:
    readonly HowItWorksStepViewModel[];
}

export interface SelectionAssistantViewModel {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export interface TestimonialViewModel {
  id: string;
  name: string;
  initials: string;
  location?: string;
  purchasedProduct: string;
  rating: number;
  quote: string;
}

export interface TestimonialSectionViewModel {
  eyebrow?: string;
  title: string;
  description?: string;
  items:
    readonly TestimonialViewModel[];
}

export interface PartnerLogoViewModel {
  name: string;
  shortName?: string;
}

export interface PartnerLogoSectionViewModel {
  eyebrow?: string;
  title: string;
  description?: string;
  items:
    readonly PartnerLogoViewModel[];
}

export interface HomeSectionHeaderViewModel {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface HomePageContentViewModel {
  destinationSection:
    HomeSectionHeaderViewModel;

  productSection:
    HomeSectionHeaderViewModel;

  guideSection?:
    HomeSectionHeaderViewModel;

  selectionAssistant:
    SelectionAssistantViewModel;

  valueProposition:
    ValuePropositionSectionViewModel;

  howItWorks:
    HowItWorksSectionViewModel;

  testimonials:
    TestimonialSectionViewModel;

  partners:
    PartnerLogoSectionViewModel;
}

export interface HomePageViewModel {
  hero:
    HeroViewModel;

  heroSearchItems:
    readonly HeroSearchItemViewModel[];

  destinations:
    readonly DestinationCardViewModel[];

  products:
    readonly ProductCardViewModel[];

  guides?:
    readonly ArticleCardViewModel[];

  content:
    HomePageContentViewModel;
}
