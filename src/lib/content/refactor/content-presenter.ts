import type {
  ArticleCardViewModel,
  ArticlePageViewModel,
  WordPressContentSource,
} from "@/types/view-models/content";

const htmlEntityMap:
  Readonly<
    Record<string, string>
  > = {
    "&amp;":
      "&",
    "&lt;":
      "<",
    "&gt;":
      ">",
    "&quot;":
      '"',
    "&#039;":
      "'",
    "&nbsp;":
      " ",
  };

function decodeBasicHtmlEntities(
  value: string,
): string {
  return Object.entries(
    htmlEntityMap,
  ).reduce(
    (
      current,
      [
        entity,
        replacement,
      ],
    ) =>
      current.replaceAll(
        entity,
        replacement,
      ),
    value,
  );
}

export function htmlToPlainText(
  value:
    | string
    | undefined,
): string {
  if (!value) {
    return "";
  }

  return decodeBasicHtmlEntities(
    value
      .replace(
        /<script[\s\S]*?<\/script>/gi,
        " ",
      )
      .replace(
        /<style[\s\S]*?<\/style>/gi,
        " ",
      )
      .replace(
        /<[^>]+>/g,
        " ",
      )
      .replace(
        /\s+/g,
        " ",
      )
      .trim(),
  );
}

function formatDateLabel(
  value:
    | string
    | undefined,
  locale: string,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return undefined;
  }

  return new Intl.DateTimeFormat(
    locale === "vi"
      ? "vi-VN"
      : locale,
    {
      day:
        "2-digit",
      month:
        "2-digit",
      year:
        "numeric",
    },
  ).format(date);
}

function contentHref(
  source:
    WordPressContentSource,
): string {
  const base =
    source.kind ===
      "guide"
      ? "guides"
      : source.kind ===
          "help"
        ? "help"
        : source.kind ===
            "policy"
          ? "policies"
          : "faq";

  return `/${source.locale}/${base}/${source.slug}`;
}

export function createArticleCardViewModel(
  source:
    WordPressContentSource,
): ArticleCardViewModel {
  return {
    id:
      source.id,

    kind:
      source.kind,

    familyCode:
      source.contentFamilyCode,

    locale:
      source.locale,

    slug:
      source.slug,

    href:
      contentHref(
        source,
      ),

    title:
      htmlToPlainText(
        source.titleHtml,
      ),

    excerpt:
      htmlToPlainText(
        source.excerptHtml,
      ) ||
      undefined,

    imageUrl:
      source.featuredImageUrl,

    imageAlt:
      source.featuredImageAlt,

    category:
      source.categoryLabels?.[0],

    publishedAtLabel:
      formatDateLabel(
        source.publishedAt,
        source.locale,
      ),
  };
}

export function createArticlePageViewModel(
  source:
    WordPressContentSource,
): ArticlePageViewModel {
  const title =
    htmlToPlainText(
      source.titleHtml,
    );

  const excerpt =
    htmlToPlainText(
      source.excerptHtml,
    ) ||
    undefined;

  return {
    id:
      source.id,

    kind:
      source.kind,

    familyCode:
      source.contentFamilyCode,

    locale:
      source.locale,

    slug:
      source.slug,

    href:
      contentHref(
        source,
      ),

    title,

    excerpt,

    contentHtml:
      source.contentHtml,

    imageUrl:
      source.featuredImageUrl,

    imageAlt:
      source.featuredImageAlt,

    category:
      source.categoryLabels?.[0],

    publishedAtLabel:
      formatDateLabel(
        source.publishedAt,
        source.locale,
      ),

    modifiedAtLabel:
      formatDateLabel(
        source.modifiedAt,
        source.locale,
      ),

    seo: {
      title:
        source.seo?.title ||
        title,

      description:
        source.seo
          ?.description ||
        excerpt,

      noindex:
        source.seo
          ?.noindex ??
        false,

      canonicalUrl:
        source.seo
          ?.canonicalUrl,

      ogImageUrl:
        source.seo
          ?.ogImageUrl ||
        source.featuredImageUrl,
    },
  };
}
