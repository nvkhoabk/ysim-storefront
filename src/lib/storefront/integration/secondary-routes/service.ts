import {
  getProducts,
} from "@/lib/woocommerce/products";

import {
  createSecondaryProductCatalogIdentity,
} from "@/lib/storefront/catalog/secondary-product-taxonomy";

import type {
  WooCommercePrice,
  WooCommerceProduct,
} from "@/lib/woocommerce/types";

import {
  fallbackPolicy,
  offersProductLimit,
  policySlug,
  secondaryLocale,
  secondaryProductLimit,
} from "@/config/storefront-secondary-routes";

import type {
  PolicyKey,
  PolicyPageViewModel,
  SecondaryDiagnostic,
  SecondaryProductViewModel,
} from "@/types/view-models/secondary-routes";

const fallbackImage =
  "/assets/products/esim-product-placeholder.webp";

function money(
  prices: WooCommercePrice | undefined,
  field: "price" | "regular_price",
): number {
  const raw = Number(prices?.[field] || 0);
  return Number.isFinite(raw)
    ? raw / Math.pow(10, prices?.currency_minor_unit || 0)
    : 0;
}

function mapProduct(
  product: WooCommerceProduct,
): SecondaryProductViewModel {
  const price = money(product.prices, "price");
  const regular = money(product.prices, "regular_price");

  const catalogIdentity =
    createSecondaryProductCatalogIdentity(
      product,
    );

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    destination:
      catalogIdentity
        .destination,
    filterTerms:
      catalogIdentity
        .filterTerms,
    imageUrl: (
      product.images?.[0]?.src || fallbackImage
    ).replace(
      "http://shop.ysim.vn/",
      "https://shop.ysim.vn/",
    ),
    price,
    regularPrice: regular > price ? regular : undefined,
    onSale: Boolean(product.on_sale),
    inStock: Boolean(product.is_in_stock),
    href: `/esim/${product.slug}`,
  };
}

export async function loadCatalog() {
  const products = await getProducts({
    page: 1,
    perPage: secondaryProductLimit,
    locale: secondaryLocale,
  });

  const mapped = products
    .map(mapProduct)
    .filter((item) => item.price > 0);

  const diagnostics: SecondaryDiagnostic[] = [
    {
      label: "Product source",
      status: "live",
      message: `${mapped.length} sản phẩm từ Product Localization API; filter index dùng toàn bộ category và attribute.`,
    },
    {
      label: "Product links",
      status: "ready",
      message: "Card dẫn tới /esim/[slug].",
    },
  ];

  return { products: mapped, diagnostics };
}

export async function loadOffers() {
  const catalog = await loadCatalog();

  return {
    products: catalog.products
      .filter((item) => item.onSale)
      .slice(0, offersProductLimit),
    diagnostics: [
      {
        label: "Sale products",
        status: "live" as const,
        message: "Chỉ hiển thị sản phẩm WooCommerce có on_sale=true.",
      },
      {
        label: "Coupon",
        status: "ready" as const,
        message: "Package không tự tạo hoặc giả lập coupon.",
      },
    ],
  };
}

function contentRoot(): string | undefined {
  return (
    process.env
      .YSIM_WORDPRESS_CONTENT_BASE_URL
      ?.trim() ||
    process.env
      .NEXT_PUBLIC_WOOCOMMERCE_URL
      ?.trim()
  )
    ?.replace(
      /\/$/,
      "",
    );
}

function contentNamespace(): string {
  return process.env
    .YSIM_WORDPRESS_CONTENT_NAMESPACE
    ?.trim()
    .replace(
      /^\/|\/$/g,
      "",
    ) ||
  "ysim/v1/content";
}

interface WordPressPolicyItem {
  id?: number;
  kind?: string;
  contentFamilyCode?: string;
  locale?: string;
  slug?: string;
  titleHtml?: string;
  excerptHtml?: string;
  contentHtml?: string;
  publishedAt?: string;
  modifiedAt?: string;
  seo?: {
    title?: string | null;
    description?: string | null;
    noindex?: boolean;
    canonicalUrl?: string | null;
    ogImageUrl?: string | null;
  };
}

interface WordPressPolicyDetailResponse {
  item:
    WordPressPolicyItem;
}

function isRecord(
  value: unknown,
): value is
  Record<
    string,
    unknown
  > {
  return (
    typeof value ===
      "object" &&
    value !==
      null
  );
}

function isWordPressPolicyItem(
  value: unknown,
): value is
  WordPressPolicyItem {
  if (
    !isRecord(
      value,
    )
  ) {
    return false;
  }

  return (
    "kind" in
      value ||
    "slug" in
      value ||
    "contentHtml" in
      value
  );
}

function isWordPressPolicyDetailResponse(
  value: unknown,
): value is
  WordPressPolicyDetailResponse {
  return (
    isRecord(
      value,
    ) &&
    "item" in
      value &&
    isWordPressPolicyItem(
      value.item,
    )
  );
}

function resolvePolicyItem(
  value: unknown,
): WordPressPolicyItem | undefined {
  if (
    isWordPressPolicyDetailResponse(
      value,
    )
  ) {
    return value.item;
  }

  if (
    isWordPressPolicyItem(
      value,
    )
  ) {
    return value;
  }

  return undefined;
}

function textValue(
  value: unknown,
): string | undefined {
  if (
    typeof value !==
    "string"
  ) {
    return undefined;
  }

  const result =
    value.trim();

  return result ||
    undefined;
}

function plainText(
  html:
    string | undefined,
): string | undefined {
  if (!html) {
    return undefined;
  }

  const value =
    html
      .replace(
        /<[^>]*>/g,
        " ",
      )
      .replace(
        /&nbsp;/gi,
        " ",
      )
      .replace(
        /&amp;/gi,
        "&",
      )
      .replace(
        /&quot;/gi,
        '"',
      )
      .replace(
        /&#39;/gi,
        "'",
      )
      .replace(
        /&lt;/gi,
        "<",
      )
      .replace(
        /&gt;/gi,
        ">",
      )
      .replace(
        /\s+/g,
        " ",
      )
      .trim();

  return value ||
    undefined;
}

function normalized(
  value:
    string | undefined,
): string {
  return (
    value ||
    ""
  )
    .trim()
    .toLowerCase();
}

function fallbackPolicyResult({
  key,
  message,
}: {
  key:
    PolicyKey;
  message: string;
}): {
  page:
    PolicyPageViewModel;
  diagnostics:
    readonly SecondaryDiagnostic[];
} {
  return {
    page:
      fallbackPolicy[
        key
      ],
    diagnostics: [
      {
        label:
          "Policy content",
        status:
          "fallback",
        message,
      },
    ],
  };
}

export async function loadPolicy(
  key:
    PolicyKey,
): Promise<{
  page:
    PolicyPageViewModel;
  diagnostics:
    readonly SecondaryDiagnostic[];
}> {
  const fallback =
    fallbackPolicy[
      key
    ];

  const root =
    contentRoot();

  if (!root) {
    return fallbackPolicyResult({
      key,
      message:
        "Chưa cấu hình YSIM_WORDPRESS_CONTENT_BASE_URL hoặc NEXT_PUBLIC_WOOCOMMERCE_URL.",
    });
  }

  const endpoint =
    process.env
      .YSIM_WORDPRESS_POLICY_ENDPOINT
      ?.trim()
      .replace(
        /^\/|\/$/g,
        "",
      ) ||
    "policies";

  const slug =
    policySlug[
      key
    ];

  const url =
    `${root}/wp-json/${contentNamespace()}/${endpoint}/` +
    `${encodeURIComponent(
      slug,
    )}?locale=${encodeURIComponent(
      secondaryLocale,
    )}`;

  try {
    const response =
      await fetch(
        url,
        {
          headers: {
            Accept:
              "application/json",
          },
          cache:
            "no-store",
        },
      );

    const pluginVersion =
      response.headers.get(
        "x-ysim-content-localization",
      );

    if (!response.ok) {
      return fallbackPolicyResult({
        key,
        message:
          `WordPress policy detail ${response.status}` +
          `${pluginVersion ? ` · plugin ${pluginVersion}` : ""}` +
          ` · ${url}`,
      });
    }

    const raw:
      unknown =
      await response
        .json();

    const item =
      resolvePolicyItem(
        raw,
      );

    if (!item) {
      return fallbackPolicyResult({
        key,
        message:
          `Policy detail ${slug} không có trường item.`,
      });
    }

    if (
      normalized(
        item.kind,
      ) !==
      "policy"
    ) {
      return fallbackPolicyResult({
        key,
        message:
          `Policy detail ${slug} trả kind=${item.kind || "unknown"}, cần kind=policy.`,
      });
    }

    if (
      normalized(
        item.locale,
      ) !==
      normalized(
        secondaryLocale,
      )
    ) {
      return fallbackPolicyResult({
        key,
        message:
          `Policy detail ${slug} trả locale=${item.locale || "unknown"}, cần locale=${secondaryLocale}.`,
      });
    }

    if (
      normalized(
        item.slug,
      ) !==
      normalized(
        slug,
      )
    ) {
      return fallbackPolicyResult({
        key,
        message:
          `Policy detail trả slug=${item.slug || "unknown"}, cần slug=${slug}.`,
      });
    }

    const html =
      textValue(
        item.contentHtml,
      );

    if (!html) {
      return fallbackPolicyResult({
        key,
        message:
          `Policy ${slug} tồn tại nhưng contentHtml đang rỗng.`,
      });
    }

    return {
      page: {
        ...fallback,
        title:
          plainText(
            item.titleHtml,
          ) ||
          fallback.title,
        description:
          plainText(
            item.excerptHtml,
          ) ||
          textValue(
            item.seo
              ?.description,
          ) ||
          fallback.description,
        html,
        updatedAt:
          textValue(
            item.modifiedAt,
          ) ||
          textValue(
            item.publishedAt,
          ),
        source:
          "wordpress",
        requiresLegalReview:
          false,
      },
      diagnostics: [
        {
          label:
            "Policy content",
          status:
            "live",
          message:
            `Loaded ${slug} from WordPress detail endpoint` +
            `${pluginVersion ? ` · plugin ${pluginVersion}` : ""}.`,
        },
        {
          label:
            "Content contract",
          status:
            "ready",
          message:
            "Validated item wrapper, kind=policy, locale, slug và contentHtml.",
        },
        {
          label:
            "Candidate cache",
          status:
            "ready",
          message:
            "Policy Candidate dùng cache=no-store để không giữ fallback cũ khi WordPress vừa được cập nhật.",
        },
      ],
    };
  } catch (
    error
  ) {
    return fallbackPolicyResult({
      key,
      message:
        error instanceof
          Error
          ? `${error.message} · ${url}`
          : `Không thể tải policy detail ${slug}.`,
    });
  }
}
