import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface SupportHeroContent {
  title: string;
  highlightedText?: string;
  description: string;
  searchPlaceholder: string;
  imageSrc: string;
  imageAlt: string;
}

export interface SupportTopic {
  id: string;
  title: string;
  description: string;
  href: string;
  icon?: ReactNode;
  iconComponent?: LucideIcon;
}

export interface SupportSearchPayload {
  query: string;
}