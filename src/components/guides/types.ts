import type { ReactNode } from "react";

export type GuidesTabKey =
  | "installation"
  | "device-check"
  | "faq"
  | "videos";

export interface GuidesHeroContent {
  title: string;

  highlightedTitle?: string;

  description: string;

  imageSrc: string;

  imageAlt: string;
}

export interface GuidesTabItem {
  key: GuidesTabKey;

  label: string;

  href: string;

  icon?: ReactNode;
}