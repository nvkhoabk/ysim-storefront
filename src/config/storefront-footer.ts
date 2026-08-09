export type FooterSocialIcon =
  | "facebook"
  | "instagram"
  | "youtube"
  | "message";

export type TrustFeatureIcon =
  | "instant"
  | "global"
  | "secure"
  | "support";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  badge?: string;
}

export interface FooterColumn {
  title: string;
  links: readonly FooterLink[];
}

export interface FooterSocialLink {
  label: string;
  href: string;
  icon: FooterSocialIcon;
}

export interface TrustFeatureItem {
  title: string;
  description: string;
  icon: TrustFeatureIcon;
}

export interface FooterAppLink {
  platform: string;
  label: string;
  href: string;
  comingSoon?: boolean;
}

export interface StorefrontFooterConfig {
  brand: {
    description: string;
    supportEmail: string;
    location: string;
  };
  trustFeatures: readonly TrustFeatureItem[];
  columns: readonly FooterColumn[];
  appLinks: readonly FooterAppLink[];
  socialLinks: readonly FooterSocialLink[];
  paymentMethods: readonly string[];
  legalLinks: readonly FooterLink[];
  copyright: string;
  securityNote: string;
}

export const storefrontFooter:
  StorefrontFooterConfig = {
    brand: {
      description:
        "eSIM du lịch quốc tế giúp bạn kết nối nhanh chóng, an toàn và thuận tiện trong mọi hành trình.",
      supportEmail:
        "support@ysim.vn",
      location:
        "Hà Nội, Việt Nam",
    },

    trustFeatures: [
      {
        title:
          "Kích hoạt tức thì",
        description:
          "Nhận eSIM ngay sau khi thanh toán.",
        icon:
          "instant",
      },
      {
        title:
          "Phủ sóng toàn cầu",
        description:
          "Kết nối tại hơn 200 quốc gia và vùng lãnh thổ.",
        icon:
          "global",
      },
      {
        title:
          "Kết nối an toàn",
        description:
          "Thanh toán và dữ liệu được bảo vệ.",
        icon:
          "secure",
      },
      {
        title:
          "Hỗ trợ 24/7",
        description:
          "Đồng hành cùng bạn trong suốt chuyến đi.",
        icon:
          "support",
      },
    ],

    columns: [
      {
        title:
          "Khám phá",
        links: [
          {
            label:
              "Mua eSIM",
            href:
              "/esim",
          },
          {
            label:
              "Điểm đến",
            href:
              "/destinations",
          },
          {
            label:
              "Ưu đãi",
            href:
              "/offers",
          },
          {
            label:
              "Cẩm nang",
            href:
              "/guides",
          },
        ],
      },
      {
        title:
          "Hỗ trợ",
        links: [
          {
            label:
              "Trung tâm hỗ trợ",
            href:
              "/support",
          },
          {
            label:
              "Kiểm tra thiết bị",
            href:
              "/device-check",
          },
          {
            label:
              "Chọn gói phù hợp",
            href:
              "/package-assistant",
          },
          {
            label:
              "Câu hỏi thường gặp",
            href:
              "/support#faq",
          },
        ],
      },
      {
        title:
          "Dành cho đối tác",
        links: [
          {
            label:
              "Chương trình đối tác",
            href:
              "/partners",
          },
          {
            label:
              "Đăng ký đại lý",
            href:
              "/partners/register",
          },
          {
            label:
              "Tài liệu API",
            href:
              "/partners/api",
          },
          {
            label:
              "Portal đối tác",
            href:
              "/partners/portal",
            badge:
              "Giới thiệu",
          },
        ],
      },
    ],

    appLinks: [
      {
        platform:
          "iOS",
        label:
          "App Store",
        href:
          "#",
        comingSoon:
          true,
      },
      {
        platform:
          "Android",
        label:
          "Google Play",
        href:
          "#",
        comingSoon:
          true,
      },
    ],

    socialLinks: [
      {
        label:
          "Facebook",
        href:
          "https://www.facebook.com/",
        icon:
          "facebook",
      },
      {
        label:
          "Instagram",
        href:
          "https://www.instagram.com/",
        icon:
          "instagram",
      },
      {
        label:
          "YouTube",
        href:
          "https://www.youtube.com/",
        icon:
          "youtube",
      },
      {
        label:
          "Nhắn tin hỗ trợ",
        href:
          "/support",
        icon:
          "message",
      },
    ],

    paymentMethods: [
      "Visa",
      "Mastercard",
      "NAPAS",
      "GPay",
      "OnePay",
    ],

    legalLinks: [
      {
        label:
          "Điều khoản sử dụng",
        href:
          "/policies/terms",
      },
      {
        label:
          "Chính sách bảo mật",
        href:
          "/policies/privacy",
      },
      {
        label:
          "Chính sách hoàn tiền",
        href:
          "/policies/refund",
      },
      {
        label:
          "Chính sách thanh toán",
        href:
          "/policies/payment",
      },
    ],

    copyright:
      "© 2026 YSim. All rights reserved.",

    securityNote:
      "Kết nối được mã hóa. Thanh toán xử lý qua các cổng thanh toán được tích hợp an toàn.",
  };
