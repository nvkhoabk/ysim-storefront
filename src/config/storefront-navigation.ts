export interface NavigationLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavigationGroup {
  label: string;
  links: readonly NavigationLink[];
}

export interface NavigationItem {
  label: string;
  href?: string;
  groups?: readonly NavigationGroup[];
}

export interface LanguageOption {
  code: string;
  label: string;
  shortLabel: string;
}

export interface StorefrontNavigationConfig {
  announcement: {
    enabled: boolean;
    message: string;
    actionLabel?: string;
    actionHref?: string;
    storageKey: string;
  };
  mainItems: readonly NavigationItem[];
  languages: readonly LanguageOption[];
  defaultLocale: string;
  quickAccess: {
    enabled: boolean;
    items: readonly NavigationLink[];
  };
}

export const storefrontNavigation:
  StorefrontNavigationConfig = {
    announcement: {
      enabled: true,
      message:
        "Kích hoạt eSIM chỉ trong vài phút — Hỗ trợ 24/7 trong suốt hành trình.",
      actionLabel:
        "Tìm hiểu thêm",
      actionHref:
        "/support",
      storageKey:
        "ysim:announcement:navigation-v1",
    },

    mainItems: [
      {
        label:
          "Mua eSIM",
        href:
          "/esim",
      },
      {
        label:
          "Điểm đến",
        groups: [
          {
            label:
              "Châu Á",
            links: [
              {
                label:
                  "Nhật Bản",
                href:
                  "/destinations#japan",
                description:
                  "Các gói eSIM Nhật Bản",
              },
              {
                label:
                  "Hàn Quốc",
                href:
                  "/destinations#korea",
                description:
                  "Các gói eSIM Hàn Quốc",
              },
              {
                label:
                  "Thái Lan",
                href:
                  "/destinations#thailand",
                description:
                  "Các gói eSIM Thái Lan",
              },
              {
                label:
                  "Singapore",
                href:
                  "/destinations#singapore",
                description:
                  "Các gói eSIM Singapore",
              },
            ],
          },
          {
            label:
              "Khu vực khác",
            links: [
              {
                label:
                  "Châu Âu",
                href:
                  "/destinations#europe",
              },
              {
                label:
                  "Bắc Mỹ",
                href:
                  "/destinations#north-america",
              },
              {
                label:
                  "Toàn cầu",
                href:
                  "/destinations#global",
              },
              {
                label:
                  "Xem tất cả điểm đến",
                href:
                  "/destinations",
              },
            ],
          },
        ],
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
        groups: [
          {
            label:
              "Bắt đầu với eSIM",
            links: [
              {
                label:
                  "Cẩm nang eSIM",
                href:
                  "/guides",
              },
              {
                label:
                  "Cài đặt eSIM",
                href:
                  "/guides/nen-cai-esim-truoc-hay-sau-khi-den-noi",
              },
              {
                label:
                  "Kiểm tra thiết bị",
                href:
                  "/guides/cach-kiem-tra-dien-thoai-ho-tro-esim",
              },
            ],
          },
          {
            label:
              "Tìm hiểu thêm",
            links: [
              {
                label:
                  "eSIM và roaming",
                href:
                  "/guides/esim-khac-roaming-quoc-te-nhu-the-nao",
              },
              {
                label:
                  "Hướng dẫn sử dụng",
                href:
                  "/guides",
              },
            ],
          },
        ],
      },
      {
        label:
          "Hỗ trợ",
        groups: [
          {
            label:
              "Trợ giúp",
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
            ],
          },
          {
            label:
              "Liên hệ",
            links: [
              {
                label:
                  "Hỗ trợ kỹ thuật",
                href:
                  "/support#technical-support",
              },
              {
                label:
                  "Câu hỏi thường gặp",
                href:
                  "/support#faq",
              },
            ],
          },
        ],
      },
    ],

    languages: [
      {
        code: "vi",
        label:
          "Tiếng Việt",
        shortLabel:
          "VI",
      },
      {
        code: "en",
        label:
          "English",
        shortLabel:
          "EN",
      },
      {
        code: "ja",
        label:
          "日本語",
        shortLabel:
          "JA",
      },
      {
        code: "ko",
        label:
          "한국어",
        shortLabel:
          "KO",
      },
    ],

    defaultLocale:
      "vi",

    quickAccess: {
      enabled: true,
      items: [
        {
          label:
            "Nhật Bản",
          href:
            "/destinations#japan",
        },
        {
          label:
            "Hàn Quốc",
          href:
            "/destinations#korea",
        },
        {
          label:
            "Thái Lan",
          href:
            "/destinations#thailand",
        },
        {
          label:
            "Singapore",
          href:
            "/destinations#singapore",
        },
        {
          label:
            "Hoa Kỳ",
          href:
            "/destinations#usa",
        },
        {
          label:
            "Châu Âu",
          href:
            "/destinations#europe",
        },
      ],
    },
  };
