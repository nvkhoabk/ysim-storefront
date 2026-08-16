import {
  destinationPresentation,
  popularDestinationSlugs,
} from "@/config/storefront-destinations";

import {
  featuredProductFamilyCodes,
  productCardPresentation,
} from "@/config/storefront-product-cards";

import {
  createDestinationCardViewModel,
} from "@/features/destination/destination-presenter";

import {
  createProductCardViewModel,
} from "@/features/catalog/product-card-presenter";

import type {
  DestinationCategorySource,
  DestinationCommerceSummary,
} from "@/types/view-models/destination";

import type {
  ProductSource,
} from "@/types/view-models/product-card";

const destinationCategories:
  readonly DestinationCategorySource[] = [
    {
      id:
        301,
      slug:
        "japan",
      name:
        "Nhật Bản",
      description:
        "Kết nối ổn định tại Tokyo, Osaka và Kyoto.",
      parentName:
        "Châu Á",
      parentSlug:
        "asia",
      productCount:
        12,
    },
    {
      id:
        302,
      slug:
        "korea",
      name:
        "Hàn Quốc",
      description:
        "Data tốc độ cao cho Seoul, Busan và toàn Hàn Quốc.",
      parentName:
        "Châu Á",
      parentSlug:
        "asia",
      productCount:
        9,
    },
    {
      id:
        303,
      slug:
        "thailand",
      name:
        "Thái Lan",
      description:
        "Online thuận tiện tại Bangkok, Phuket và Chiang Mai.",
      parentName:
        "Châu Á",
      parentSlug:
        "asia",
      productCount:
        8,
    },
    {
      id:
        304,
      slug:
        "singapore",
      name:
        "Singapore",
      description:
        "Kết nối nhanh ngay khi hạ cánh tại Singapore.",
      parentName:
        "Châu Á",
      parentSlug:
        "asia",
      productCount:
        6,
    },
    {
      id:
        305,
      slug:
        "europe",
      name:
        "Châu Âu",
      description:
        "Một eSIM cho nhiều quốc gia trong hành trình Châu Âu.",
      parentName:
        "Đa quốc gia",
      parentSlug:
        "coverage",
      productCount:
        15,
    },
  ];

const destinationCommerce:
  readonly DestinationCommerceSummary[] = [
    {
      destinationSlug:
        "japan",
      minPurchasablePrice:
        169000,
      minDurationDays:
        3,
      maxDurationDays:
        30,
      purchasableProductCount:
        12,
    },
    {
      destinationSlug:
        "korea",
      minPurchasablePrice:
        149000,
      minDurationDays:
        3,
      maxDurationDays:
        30,
      purchasableProductCount:
        9,
    },
    {
      destinationSlug:
        "thailand",
      minPurchasablePrice:
        99000,
      minDurationDays:
        3,
      maxDurationDays:
        15,
      purchasableProductCount:
        8,
    },
    {
      destinationSlug:
        "singapore",
      minPurchasablePrice:
        109000,
      minDurationDays:
        3,
      maxDurationDays:
        15,
      purchasableProductCount:
        6,
    },
    {
      destinationSlug:
        "europe",
      minPurchasablePrice:
        249000,
      minDurationDays:
        7,
      maxDurationDays:
        30,
      purchasableProductCount:
        15,
    },
  ];

const productSources:
  readonly ProductSource[] = [
    {
      id:
        401,
      familyCode:
        "GIGA-JP",
      slug:
        "esim-nhat-ban",
      name:
        "eSIM Nhật Bản",
      imageUrl:
        "/ui-preview/products/japan-esim.svg",
      imageAlt:
        "eSIM Nhật Bản",
      variations: [
        {
          id:
            4001,
          sku:
            "GIGA-JP-D3GB-03",
          price:
            169000,
          regularPrice:
            199000,
          purchasable:
            true,
          inStock:
            true,
          attributes: {
            "dung-luong":
              "3GB/ngày",
            "so-ngay":
              "3 ngày",
          },
        },
      ],
    },
    {
      id:
        402,
      familyCode:
        "GIGA-KR",
      slug:
        "esim-han-quoc",
      name:
        "eSIM Hàn Quốc",
      imageUrl:
        "/ui-preview/products/korea-esim.svg",
      imageAlt:
        "eSIM Hàn Quốc",
      variations: [
        {
          id:
            4101,
          sku:
            "GIGA-KR-D3GB-05",
          price:
            149000,
          purchasable:
            true,
          inStock:
            true,
          attributes: {
            data:
              "3GB/ngày",
            duration:
              "5 ngày",
          },
        },
      ],
    },
    {
      id:
        403,
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
            4201,
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
        404,
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
            4301,
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

const allDestinations =
  destinationCategories.map(
    (category) => {
      const commerce =
        destinationCommerce.find(
          (item) =>
            item.destinationSlug ===
            category.slug,
        );

      const presentation =
        destinationPresentation[
          category.slug
        ];

      if (
        !commerce ||
        !presentation
      ) {
        throw new Error(
          `Missing Home destination fixture: ${category.slug}`,
        );
      }

      return createDestinationCardViewModel(
        category,
        commerce,
        presentation,
      );
    },
  );

const allProducts =
  productSources.map(
    (product) => {
      const presentation =
        productCardPresentation[
          product.familyCode
        ];

      if (!presentation) {
        throw new Error(
          `Missing Home product fixture: ${product.familyCode}`,
        );
      }

      return createProductCardViewModel(
        product,
        presentation,
      );
    },
  );

export const homePreviewDestinations =
  popularDestinationSlugs
    .map(
      (slug) =>
        allDestinations.find(
          (destination) =>
            destination.slug ===
            slug,
        ),
    )
    .filter(
      (
        destination,
      ): destination is
        (typeof allDestinations)[number] =>
        Boolean(destination),
    );

export const homePreviewProducts =
  featuredProductFamilyCodes
    .map(
      (familyCode) =>
        allProducts.find(
          (product) =>
            product.familyCode ===
            familyCode,
        ),
    )
    .filter(
      (
        product,
      ): product is
        (typeof allProducts)[number] =>
        Boolean(product),
    );
