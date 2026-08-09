import type {
  ContentKind,
  ContentLocale,
  WordPressContentSource,
} from "@/types/view-models/content";

export interface ContentListQuery {
  kind: ContentKind;
  locale: ContentLocale;
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}

export interface ContentDetailQuery {
  kind: ContentKind;
  locale: ContentLocale;
  slug: string;
}

export interface ContentGateway {
  list(
    query: ContentListQuery,
  ): Promise<
    readonly WordPressContentSource[]
  >;

  getBySlug(
    query: ContentDetailQuery,
  ): Promise<
    WordPressContentSource | null
  >;
}
