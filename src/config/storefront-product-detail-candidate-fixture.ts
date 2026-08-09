import type {
  WooCommerceProduct,
} from "@/lib/woocommerce/types";

export const productDetailCandidateFixture:
  WooCommerceProduct = {
    id:
      26001,
    name:
      "eSIM Nhật Bản – 5GB/ngày",
    slug:
      "japan-5gb-day-7-days",
    parent:
      0,
    type:
      "variable",
    variation:
      "",
    permalink:
      "/esim/japan-5gb-day-7-days",
    sku:
      "GIGA-JP",
    short_description:
      "Kết nối tốc độ cao tại Nhật Bản với nhiều lựa chọn thời hạn.",
    description:
      "Gói eSIM data dành cho khách du lịch Nhật Bản. Cài đặt bằng mã QR và kích hoạt khi kết nối mạng hỗ trợ.",
    on_sale:
      true,
    prices: {
      price:
        "169000",
      regular_price:
        "189000",
      sale_price:
        "169000",
      currency_code:
        "VND",
      currency_symbol:
        "đ",
      currency_minor_unit:
        0,
      currency_decimal_separator:
        "",
      currency_thousand_separator:
        ".",
      currency_prefix:
        "",
      currency_suffix:
        " đ",
    },
    images: [
      {
        id:
          26001,
        src:
          "/assets/products/esim-product-placeholder.webp",
        thumbnail:
          "/assets/products/esim-product-placeholder.webp",
        srcset:
          "",
        sizes:
          "",
        name:
          "eSIM Nhật Bản",
        alt:
          "eSIM Nhật Bản YSim",
      },
    ],
    categories: [
      {
        id:
          10,
        name:
          "Nhật Bản",
        slug:
          "japan",
      },
    ],
    tags: [],
    attributes: [
      {
        id:
          1,
        name:
          "Dung lượng",
        taxonomy:
          "data-amount",
        has_variations:
          true,
        terms: [
          {
            id:
              1,
            name:
              "5GB/ngày",
            slug:
              "5gb-day",
            default:
              true,
          },
        ],
      },
      {
        id:
          2,
        name:
          "Số ngày",
        taxonomy:
          "duration-days",
        has_variations:
          true,
        terms: [
          {
            id:
              2,
            name:
              "7 ngày",
            slug:
              "7-days",
            default:
              true,
          },
          {
            id:
              3,
            name:
              "10 ngày",
            slug:
              "10-days",
            default:
              false,
          },
        ],
      },
      {
        id:
          3,
        name:
          "Nhà mạng",
        taxonomy:
          "network",
        has_variations:
          false,
        terms: [
          {
            id:
              4,
            name:
              "Docomo / SoftBank",
            slug:
              "docomo-softbank",
            default:
              false,
          },
        ],
      },
      {
        id:
          4,
        name:
          "Hotspot",
        taxonomy:
          "hotspot",
        has_variations:
          false,
        terms: [
          {
            id:
              5,
            name:
              "Có",
            slug:
              "yes",
            default:
              false,
          },
        ],
      },
    ],
    variations: [
      {
        id:
          26007,
        sku:
          "GIGA-JP-D5GB-07",
        prices: {
          price:
            "169000",
          regular_price:
            "189000",
          sale_price:
            "169000",
          currency_code:
            "VND",
          currency_symbol:
            "đ",
          currency_minor_unit:
            0,
          currency_decimal_separator:
            "",
          currency_thousand_separator:
            ".",
          currency_prefix:
            "",
          currency_suffix:
            " đ",
        },
        image:
          null,
        description:
          "5GB/ngày trong 7 ngày",
        is_purchasable:
          true,
        is_in_stock:
          true,
        attributes: [
          {
            name:
              "Dung lượng",
            slug:
              "data-amount",
            value:
              "5gb-day",
            label:
              "5GB/ngày",
          },
          {
            name:
              "Số ngày",
            slug:
              "duration-days",
            value:
              "7-days",
            label:
              "7 ngày",
          },
        ],
      },
      {
        id:
          26010,
        sku:
          "GIGA-JP-D5GB-10",
        prices: {
          price:
            "219000",
          regular_price:
            "239000",
          sale_price:
            "219000",
          currency_code:
            "VND",
          currency_symbol:
            "đ",
          currency_minor_unit:
            0,
          currency_decimal_separator:
            "",
          currency_thousand_separator:
            ".",
          currency_prefix:
            "",
          currency_suffix:
            " đ",
        },
        image:
          null,
        description:
          "5GB/ngày trong 10 ngày",
        is_purchasable:
          true,
        is_in_stock:
          true,
        attributes: [
          {
            name:
              "Dung lượng",
            slug:
              "data-amount",
            value:
              "5gb-day",
            label:
              "5GB/ngày",
          },
          {
            name:
              "Số ngày",
            slug:
              "duration-days",
            value:
              "10-days",
            label:
              "10 ngày",
          },
        ],
      },
    ],
    default_attributes: {
      "data-amount":
        "5gb-day",
      "duration-days":
        "7-days",
    },
    is_purchasable:
      true,
    is_in_stock:
      true,
    low_stock_remaining:
      null,
    average_rating:
      "0",
    review_count:
      0,
    add_to_cart: {
      text:
        "Thêm vào giỏ hàng",
      description:
        "Thêm eSIM Nhật Bản vào giỏ hàng",
      url:
        "",
      minimum:
        1,
      maximum:
        99,
      multiple_of:
        1,
    },
  };
