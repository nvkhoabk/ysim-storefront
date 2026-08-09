import {
  cartPreviewCouponRules,
  cartPreviewLines,
} from "@/config/storefront-cart-preview";

import {
  createCartPageViewModel,
} from "@/features/cart/refactor/cart-presenter";

import type {
  CheckoutPageViewModel,
} from "@/types/view-models/checkout-refactor";

const cart =
  createCartPageViewModel({
    lines:
      cartPreviewLines,

    couponCode:
      "YSIM10",

    couponRules:
      cartPreviewCouponRules,
  });

export const checkoutPreviewPage:
  CheckoutPageViewModel = {
    lines:
      cart.lines,

    totals:
      cart.totals,

    paymentMethods: [
      {
        id:
          "gpay",

        label:
          "Thanh toán QR GPay",

        description:
          "Quét mã QR bằng ứng dụng ngân hàng. Đây là phương thức được đề xuất.",

        badge:
          "Đề xuất",

        icon:
          "qr",

        enabled:
          true,
      },

      {
        id:
          "onepay",

        label:
          "Thẻ quốc tế OnePay",

        description:
          "Thanh toán bằng thẻ Visa, Mastercard hoặc JCB.",

        icon:
          "card",

        enabled:
          true,
      },

      {
        id:
          "manual",

        label:
          "Chuyển khoản thủ công",

        description:
          "Đơn hàng được xác nhận sau khi bộ phận vận hành kiểm tra giao dịch.",

        badge:
          "Xác nhận thủ công",

        icon:
          "bank",

        enabled:
          true,
      },
    ],

    initialPaymentMethod:
      "gpay",

    termsLabel:
      "Tôi đồng ý với Điều khoản sử dụng và chính sách hoàn tiền của YSim.",

    privacyLabel:
      "Thông tin cá nhân chỉ được sử dụng để xử lý đơn hàng và gửi eSIM.",

    supportText:
      "Cần hỗ trợ? Đội ngũ YSim luôn sẵn sàng đồng hành cùng bạn.",
  };
