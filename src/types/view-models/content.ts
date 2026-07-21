import type {
  HeroViewModel,
} from "@/types/view-models/hero";

export type ContentLocale =
  | "vi"
  | "en"
  | "ja"
  | "ko";

export type ContentKind =
  | "guide"
  | "help"
  | "policy"
  | "faq";

export type ContentCalloutTone =
  | "info"
  | "success"
  | "warning";

export interface ContentCategoryViewModel {
  id: string;
  label: string;
  href: string;
}

export interface ContentSeoSource {
  title?: string;
  description?: string;
  noindex?: boolean;
  canonicalUrl?: string;
  ogImageUrl?: string;
}

export interface WordPressContentSource {
  id: number;
  kind: ContentKind;
  contentFamilyCode: string;
  locale: ContentLocale;
  slug: string;
  titleHtml: string;
  excerptHtml?: string;
  contentHtml: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  publishedAt?: string;
  modifiedAt?: string;
  categoryIds?: readonly string[];
  categoryLabels?: readonly string[];
  seo?: ContentSeoSource;
}

export interface ArticleCardViewModel {
  id: number;
  kind: ContentKind;
  familyCode: string;
  locale: ContentLocale;
  slug: string;
  href: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  imageAlt?: string;
  category?: string;
  publishedAtLabel?: string;
}

export interface ArticlePageViewModel {
  id: number;
  kind: ContentKind;
  familyCode: string;
  locale: ContentLocale;
  slug: string;
  href: string;
  title: string;
  excerpt?: string;
  contentHtml: string;
  imageUrl?: string;
  imageAlt?: string;
  category?: string;
  publishedAtLabel?: string;
  modifiedAtLabel?: string;
  seo: {
    title: string;
    description?: string;
    noindex: boolean;
    canonicalUrl?: string;
    ogImageUrl?: string;
  };
}

export interface ContentCalloutViewModel {
  title: string;
  description: string;
  tone?: ContentCalloutTone;
}

export interface ContentLandingViewModel {
  hero: HeroViewModel;
  categories:
    readonly ContentCategoryViewModel[];
  activeCategoryId?: string;
  section: {
    eyebrow?: string;
    title: string;
    description?: string;
  };
  articles:
    readonly ArticleCardViewModel[];
  callout?:
    ContentCalloutViewModel;
}

export interface ArticlePageCompositionViewModel {
  article:
    ArticlePageViewModel;
  relatedTitle?: string;
  relatedArticles:
    readonly ArticleCardViewModel[];
  callout?:
    ContentCalloutViewModel;
}
