import type { ReactNode } from "react";

export type EsimCatalogCategoryKey =
  | "country"
  | "region"
  | "global";

export interface EsimCatalogCategory {
  key: EsimCatalogCategoryKey;

  title: string;

  description: string;

  /**
   * Icon chính thức của YSim sẽ được truyền từ component
   * sau khi Icon Library hoàn thành.
   */
  icon?: ReactNode;

  /**
   * Category vẫn có thể chọn dù dữ liệu đang cập nhật.
   * Chỉ dùng disabled khi thực sự không cho phép thao tác.
   */
  disabled?: boolean;
}

export interface EsimCatalogBenefit {
  id: string;

  title: string;

  description?: string;

  icon?: ReactNode;
}

export interface EsimCountryLink {
  code: string;

  name: string;

  slug: string;

  href: string;

  popular?: boolean;
}

export interface EsimContinent {
  key:
    | "asia"
    | "europe"
    | "north-america"
    | "south-america"
    | "africa"
    | "oceania";

  title: string;

  slug: string;

  href: string;

  totalLabel: string;

  countries: EsimCountryLink[];

  icon?: ReactNode;
}

export interface EsimSpecialDestination {
  id: string;

  title: string;

  href: string;

  icon?: ReactNode;
}

export interface EsimCatalogEmptyState {
  eyebrow: string;

  title: string;

  description: string;

  action: {
    label: string;

    targetCategory?: EsimCatalogCategoryKey;

    href?: string;
  };
}