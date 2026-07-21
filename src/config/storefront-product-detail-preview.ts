import {
  productCardPresentation,
} from "@/config/storefront-product-cards";

import {
  createProductCardViewModel,
} from "@/features/catalog/product-card-presenter";

import {
  createProductDetailViewModel,
} from "@/features/catalog/product-detail-presenter";

import type {
  ProductSource,
} from "@/types/view-models/product-card";

import type {
  ProductDetailPageViewModel,
  ProductDetailPresentationConfig,
  ProductDetailSource,
} from "@/types/view-models/product-detail";

const source: ProductDetailSource = {
  id: 801,
  familyCode: "GIGA-JP",
  slug: "esim-nhat-ban",
  name: "eSIM Nhật Bản",
  destinationName: "Nhật Bản",
  shortDescription:
    "Kết nối data tốc độ cao tại Nhật Bản với mạng đối tác phủ sóng rộng. Phù hợp cho du lịch, công tác và làm việc từ xa.",
  imageUrl: "/ui-preview/products/japan-esim.svg",
  imageAlt: "eSIM Nhật Bản",
  gallery: [
    {
      id: "primary",
      url: "/ui-preview/products/japan-esim.svg",
      alt: "eSIM Nhật Bản",
    },
    {
      id: "connectivity",
      url: "/ui-preview/products/global-esim.svg",
      alt: "Minh họa kết nối eSIM",
    },
  ],
  variations: [
    {
      id: 8101,
      sku: "GIGA-JP-D3GB-03",
      price: 169000,
      regularPrice: 199000,
      purchasable: true,
      inStock: true,
      attributes: { "dung-luong": "3GB/ngày", "so-ngay": "3 ngày" },
    },
    {
      id: 8102,
      sku: "GIGA-JP-D3GB-07",
      price: 249000,
      regularPrice: 279000,
      purchasable: true,
      inStock: true,
      attributes: { "dung-luong": "3GB/ngày", "so-ngay": "7 ngày" },
    },
    {
      id: 8103,
      sku: "GIGA-JP-D5GB-07",
      price: 299000,
      regularPrice: 329000,
      purchasable: true,
      inStock: true,
      attributes: { "dung-luong": "5GB/ngày", "so-ngay": "7 ngày" },
    },
    {
      id: 8104,
      sku: "GIGA-JP-D5GB-15",
      price: 489000,
      purchasable: true,
      inStock: false,
      attributes: { "dung-luong": "5GB/ngày", "so-ngay": "15 ngày" },
    },
    {
      id: 8105,
      sku: "GIGA-JP-U-10",
      price: 459000,
      regularPrice: 499000,
      purchasable: true,
      inStock: true,
      attributes: {
        "dung-luong": "Không giới hạn",
        "so-ngay": "10 ngày",
      },
    },
  ],
};

const config: ProductDetailPresentationConfig = {
  familyCode: "GIGA-JP",
  badges: [
    { label: "Phổ biến", icon: "popular" },
    { label: "Nhận ngay", icon: "featured" },
  ],
  dataAttributeKeys: [
    "dung-luong",
    "dung lượng",
    "data",
    "data-amount",
    "data_amount",
  ],
  durationAttributeKeys: [
    "so-ngay",
    "số ngày",
    "duration",
    "duration-days",
    "duration_days",
  ],
  features: [
    {
      title: "Mạng tốc độ cao",
      description: "Kết nối qua mạng đối tác lớn tại Nhật Bản.",
      icon: "network",
    },
    {
      title: "Hỗ trợ hotspot",
      description: "Có thể chia sẻ kết nối cho thiết bị khác.",
      icon: "hotspot",
    },
    {
      title: "Kích hoạt khi kết nối",
      description: "Thời hạn bắt đầu khi eSIM kết nối mạng hỗ trợ.",
      icon: "activation",
    },
    {
      title: "Hỗ trợ 24/7",
      description: "YSim đồng hành trước và trong chuyến đi.",
      icon: "support",
    },
  ],
  usageNotes: [
    {
      title: "Cài đặt trước chuyến đi",
      description:
        "Cài eSIM khi có Wi-Fi ổn định, nhưng chỉ bật dữ liệu khi đến Nhật Bản.",
    },
    {
      title: "Không xóa eSIM",
      description:
        "Mã QR thường chỉ dùng một lần. Không xóa eSIM sau khi cài.",
    },
    {
      title: "Data only",
      description:
        "Gói không bao gồm số điện thoại và cuộc gọi thoại truyền thống.",
    },
  ],
};

const relatedSources: readonly ProductSource[] = [
  {
    id: 802,
    familyCode: "GIGA-KR",
    slug: "esim-han-quoc",
    name: "eSIM Hàn Quốc",
    imageUrl: "/ui-preview/products/korea-esim.svg",
    variations: [{
      id: 8201,
      sku: "GIGA-KR-D3GB-05",
      price: 149000,
      purchasable: true,
      inStock: true,
      attributes: { data: "3GB/ngày", duration: "5 ngày" },
    }],
  },
  {
    id: 803,
    familyCode: "GIGA-TH",
    slug: "esim-thai-lan",
    name: "eSIM Thái Lan",
    imageUrl: "/ui-preview/products/thailand-esim.svg",
    variations: [{
      id: 8301,
      sku: "GIGA-TH-D2GB-03",
      price: 99000,
      regularPrice: 129000,
      purchasable: true,
      inStock: true,
      attributes: { "data-amount": "2GB/ngày", "duration-days": "3 ngày" },
    }],
  },
  {
    id: 804,
    familyCode: "GIGA-GLB",
    slug: "esim-toan-cau",
    name: "eSIM Toàn cầu",
    imageUrl: "/ui-preview/products/global-esim.svg",
    variations: [{
      id: 8401,
      sku: "GIGA-GLB-D10GB-15",
      price: 499000,
      purchasable: true,
      inStock: true,
      attributes: { data_amount: "10GB", duration_days: "15 ngày" },
    }],
  },
];

export const productDetailPreviewPage: ProductDetailPageViewModel = {
  product: createProductDetailViewModel(source, config),
  relatedProducts: relatedSources.map((item) => {
    const presentation = productCardPresentation[item.familyCode];
    if (!presentation) {
      throw new Error(`Missing product card config: ${item.familyCode}`);
    }
    return createProductCardViewModel(item, presentation);
  }),
};
