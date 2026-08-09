import type {
  AppliedCartCouponViewModel,
  CartCouponRule,
  CartLineItemViewModel,
  CartLineSource,
  CartPageViewModel,
} from "@/types/view-models/cart-refactor";

import type {
  ProductCardViewModel,
} from "@/types/view-models/product-card";

function toAmount(
  value:
    | number
    | string
    | undefined,
): number {
  if (
    value === undefined
  ) {
    return 0;
  }

  if (
    typeof value ===
    "number"
  ) {
    return Number.isFinite(
      value,
    )
      ? value
      : 0;
  }

  const parsed =
    Number(
      value.replace(
        /[^\d.-]/g,
        "",
      ),
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

function normalizeQuantity(
  quantity: number,
): number {
  if (
    !Number.isFinite(
      quantity,
    )
  ) {
    return 1;
  }

  return Math.min(
    99,
    Math.max(
      1,
      Math.floor(
        quantity,
      ),
    ),
  );
}

function createLine(
  source:
    CartLineSource,
): CartLineItemViewModel {
  const quantity =
    normalizeQuantity(
      source.quantity,
    );

  const unitPrice =
    Math.max(
      0,
      toAmount(
        source.unitPrice,
      ),
    );

  const regularUnitPrice =
    Math.max(
      unitPrice,
      toAmount(
        source.regularUnitPrice,
      ) ||
      unitPrice,
    );

  const lineSubtotal =
    Math.round(
      regularUnitPrice *
      quantity,
    );

  const lineTotal =
    Math.round(
      unitPrice *
      quantity,
    );

  return {
    lineId:
      source.lineId,

    productId:
      source.productId,

    variationId:
      source.variationId,

    href:
      `/esim/${source.slug}`,

    name:
      source.name,

    destinationName:
      source.destinationName,

    imageUrl:
      source.imageUrl,

    imageAlt:
      source.imageAlt ||
      source.name,

    sku:
      source.sku,

    dataLabel:
      source.dataLabel,

    durationLabel:
      source.durationLabel,

    quantity,

    unitPrice,

    regularUnitPrice,

    lineSubtotal,

    lineDiscount:
      Math.max(
        0,
        lineSubtotal -
        lineTotal,
      ),

    lineTotal,

    purchasable:
      source.purchasable,

    inStock:
      source.inStock,
  };
}

function applyCoupon(
  merchandiseTotal: number,
  couponCode:
    | string
    | undefined,
  rules:
    readonly CartCouponRule[],
): AppliedCartCouponViewModel | undefined {
  const normalizedCode =
    couponCode
      ?.trim()
      .toUpperCase();

  if (!normalizedCode) {
    return undefined;
  }

  const rule =
    rules.find(
      (item) =>
        item.code.toUpperCase() ===
        normalizedCode,
    );

  if (!rule) {
    return undefined;
  }

  if (
    rule.minOrderValue &&
    merchandiseTotal <
      rule.minOrderValue
  ) {
    return undefined;
  }

  const rawDiscount =
    Math.round(
      merchandiseTotal *
      Math.max(
        0,
        rule.percent,
      ) /
      100,
    );

  const discount =
    rule.maxDiscount
      ? Math.min(
          rawDiscount,
          rule.maxDiscount,
        )
      : rawDiscount;

  return {
    code:
      rule.code,

    label:
      rule.label,

    discount:
      Math.max(
        0,
        Math.min(
          merchandiseTotal,
          discount,
        ),
      ),
  };
}

export function createCartPageViewModel({
  lines: sourceLines,
  couponCode,
  couponRules = [],
  relatedProducts = [],
}: {
  lines:
    readonly CartLineSource[];
  couponCode?: string;
  couponRules?:
    readonly CartCouponRule[];
  relatedProducts?:
    readonly ProductCardViewModel[];
}): CartPageViewModel {
  const lines =
    sourceLines.map(
      createLine,
    );

  const subtotal =
    lines.reduce(
      (
        total,
        line,
      ) =>
        total +
        line.lineSubtotal,
      0,
    );

  const productDiscount =
    lines.reduce(
      (
        total,
        line,
      ) =>
        total +
        line.lineDiscount,
      0,
    );

  const merchandiseTotal =
    Math.max(
      0,
      subtotal -
      productDiscount,
    );

  const appliedCoupon =
    applyCoupon(
      merchandiseTotal,
      couponCode,
      couponRules,
    );

  const couponDiscount =
    appliedCoupon?.discount ||
    0;

  const unavailableLineCount =
    lines.filter(
      (line) =>
        !line.purchasable ||
        !line.inStock,
    ).length;

  return {
    lines,

    totals: {
      itemCount:
        lines.reduce(
          (
            total,
            line,
          ) =>
            total +
            line.quantity,
          0,
        ),

      subtotal,

      productDiscount,

      couponDiscount,

      total:
        Math.max(
          0,
          merchandiseTotal -
          couponDiscount,
        ),
    },

    appliedCoupon,

    canCheckout:
      lines.length > 0 &&
      unavailableLineCount ===
        0,

    unavailableLineCount,

    relatedProducts,
  };
}
