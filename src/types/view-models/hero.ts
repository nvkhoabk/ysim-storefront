export type HeroVariant =
  | "brand"
  | "subtle"
  | "dark"
  | "plain";

export type HeroAlignment =
  | "left"
  | "center";

export type HeroBenefitIcon =
  | "global"
  | "instant"
  | "secure"
  | "support";

export type HeroSearchItemType =
  | "destination"
  | "product"
  | "guide";

export interface HeroActionViewModel {
  label: string;
  href: string;
  variant?:
    | "primary"
    | "outline"
    | "ghost";
}

export interface HeroBenefitViewModel {
  label: string;
  icon: HeroBenefitIcon;
}

export interface HeroMediaViewModel {
  imageUrl?: string;
  mobileImageUrl?: string;
  alt?: string;
  eyebrow?: string;
}

export interface HeroViewModel {
  eyebrow?: string;
  title: string;
  highlightedText?: string;
  description?: string;
  primaryAction?: HeroActionViewModel;
  secondaryAction?: HeroActionViewModel;
  benefits?: readonly HeroBenefitViewModel[];
  media?: HeroMediaViewModel;
  variant?: HeroVariant;
  alignment?: HeroAlignment;
}

export interface HeroSearchItemViewModel {
  id: string;
  type: HeroSearchItemType;
  label: string;
  description?: string;
  href: string;
  keywords?: readonly string[];
  meta?: string;
}
