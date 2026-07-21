import {
  productCardPresentation,
} from "@/config/storefront-product-cards";

import {
  createProductCardViewModel,
} from "@/features/catalog/product-card-presenter";

import type {
  CartCouponRule,
  CartLineSource,
} from "@/types/view-models/cart-refactor";

import type {
  ProductSource,
} from "@/types/view-models/product-card";

export const cartPreviewLines:
  readonly CartLineSource[] = [
    {
      lineId:
        "cart-line-jp-01",

      productId:
        901,

      variationId:
        9101,

      slug:
        "esim-nhat-ban",

      name:
        "eSIM Nhật Bản",

      destinationName:
        "Nhật Bản",

      imageUrl:
        "/ui-preview/products/japan-esim.svg",

      imageAlt:
        "eSIM Nhật Bản",

      sku:
        "GIGA-JP-D5GB-07",

      dataLabel:
        "5GB/ngày",

      durationLabel:
        "7 ngày",

      quantity:
        1,

      unitPrice:
        299000,

      regularUnitPrice:
        329000,

      purchasable:
        true,

      inStock:
        true,
    },

    {
      lineId:
        "cart-line-kr-01",

      productId:
        902,

      variationId:
        9201,

      slug:
        "esim-han-quoc",

      name:
        "eSIM Hàn Quốc",

      destinationName:
        "Hàn Quốc",

      imageUrl:
        "/ui-preview/products/korea-esim.svg",

      imageAlt:
        "eSIM Hàn Quốc",

      sku:
        "GIGA-KR-D3GB-05",

      dataLabel:
        "3GB/ngày",

      durationLabel:
        "5 ngày",

      quantity:
        1,

      unitPrice:
        149000,

      purchasable:
        true,

      inStock:
        true,
    },
  ];

export const cartPreviewCouponRules:
  readonly CartCouponRule[] = [
    {
      code:
        "YSIM10",

      label:
        "Ưu đãi YSim 10%",

      percent:
        10,

      maxDiscount:
        50000,

      minOrderValue:
        100000,
    },
  ];

const relatedSources:
  readonly ProductSource[] = [
    {
      id:
        903,

      familyCode:
        "GIGA-TH",

      slug:
        "esim-thai-lan",

      name:
        "eSIM Thái Lan",

      imageUrl:
        "/ui-preview/products/thailand-esim.svg",

      imageAlt:
        "eSIM Thái Lan",

      variations: [
        {
          id:
            9301,

          sku:
            "GIGA-TH-D2GB-03",

          price:
            99000,

          regularPrice:
            129000,

          purchasable:
            true,

          inStock:
            true,

          attributes: {
            "data-amount":
              "2GB/ngày",

            "duration-days":
              "3 ngày",
          },
        },
      ],
    },

    {
      id:
        904,

      familyCode:
        "GIGA-GLB",

      slug:
        "esim-toan-cau",

      name:
        "eSIM Toàn cầu",

      imageUrl:
        "/ui-preview/products/global-esim.svg",

      imageAlt:
        "eSIM Toàn cầu",

      variations: [
        {
          id:
            9401,

          sku:
            "GIGA-GLB-D10GB-15",

          price:
            499000,

          purchasable:
            true,

          inStock:
            true,

          attributes: {
            data_amount:
              "10GB",

            duration_days:
              "15 ngày",
          },
        },
      ],
    },
  ];

export const cartPreviewRelatedProducts =
  relatedSources.map(
    (source) => {
      const presentation =
        productCardPresentation[
          source.familyCode
        ];

      if (!presentation) {
        throw new Error(
          `Missing Cart related product presentation: ${source.familyCode}`,
        );
      }

      return createProductCardViewModel(
        source,
        presentation,
      );
    },
  );
