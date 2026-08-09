import type {
  PreviewHubViewModel,
  PreviewPackageViewModel,
} from "@/types/view-models/ui-preview-registry";

export const uiPreviewPackages:
  readonly PreviewPackageViewModel[] = [
    {
      packageNumber:
        1,
      title:
        "Foundation Design System",
      description:
        "Design tokens, Button, Badge, Price, TextInput, Skeleton và layout primitives.",
      phase:
        "foundation",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Foundation preview",
          href:
            "/ui-preview/foundation",
        },
      ],
      checks: [
        "Button variants",
        "Price formatting",
        "Input error state",
        "Skeleton",
      ],
    },
    {
      packageNumber:
        2,
      title:
        "Navigation Shell",
      description:
        "Announcement Bar, Header, desktop/mobile navigation và Quick Access.",
      phase:
        "navigation",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Navigation preview",
          href:
            "/ui-preview/navigation",
        },
      ],
      checks: [
        "Sticky Header",
        "Mobile drawer",
        "Language selector",
        "Cart badge",
      ],
    },
    {
      packageNumber:
        3,
      title:
        "Footer & Page Shell",
      description:
        "PageShell, Footer và Trust Feature Row.",
      phase:
        "foundation",
      status:
        "hotfix",
      statusLabel:
        "Hotfix applied",
      routes: [
        {
          label:
            "Page Shell preview",
          href:
            "/ui-preview/page-shell",
        },
      ],
      checks: [
        "Header/Footer continuity",
        "Sidebar compatibility",
        "Trust row",
        "Responsive footer",
      ],
      note:
        "Đã áp dụng Package 03 v2 Hotfix.",
    },
    {
      packageNumber:
        4,
      title:
        "Hero System",
      description:
        "Hero Shell, Content, Media, Benefit List và Hero Search.",
      phase:
        "navigation",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Hero preview",
          href:
            "/ui-preview/hero",
        },
      ],
      checks: [
        "Hero alignment",
        "Primary search",
        "Benefit list",
        "Mobile stacking",
      ],
    },
    {
      packageNumber:
        5,
      title:
        "Destination Cards",
      description:
        "Destination Card, skeleton và horizontal rail.",
      phase:
        "discovery",
      status:
        "hotfix",
      statusLabel:
        "Hotfix applied",
      routes: [
        {
          label:
            "Destination Cards",
          href:
            "/ui-preview/destination-cards",
        },
        {
          label:
            "Legacy Destination UI",
          href:
            "/ui-preview/destination",
        },
      ],
      checks: [
        "Flag/image",
        "From price",
        "Hover lift",
        "Mobile rail",
      ],
      note:
        "Đã khôi phục destination barrel exports bằng Package 05 v2.",
    },
    {
      packageNumber:
        6,
      title:
        "Product Cards",
      description:
        "Product Card, Product Rail, variation-aware presenter và skeleton.",
      phase:
        "discovery",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Product Cards",
          href:
            "/ui-preview/product-cards",
        },
      ],
      checks: [
        "Lowest purchasable price",
        "Discount display",
        "Attribute chips",
        "Product rail",
      ],
    },
    {
      packageNumber:
        7,
      title:
        "Home Page Composition",
      description:
        "Hero, destination, product, value proposition, steps, testimonial và partner strip.",
      phase:
        "discovery",
      status:
        "hotfix",
      statusLabel:
        "Hotfix applied",
      routes: [
        {
          label:
            "Home refactor",
          href:
            "/ui-preview/home-refactor",
        },
      ],
      checks: [
        "One primary Hero action",
        "Section rhythm",
        "Rail behavior",
        "Full-page overflow",
      ],
      note:
        "Đã áp dụng Package 07 v2 Hotfix.",
    },
    {
      packageNumber:
        8,
      title:
        "Destination Page",
      description:
        "Destination landing, category navigation, filters, desktop table và mobile list.",
      phase:
        "discovery",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Destination refactor",
          href:
            "/ui-preview/destination-refactor",
        },
      ],
      checks: [
        "Filter combinations",
        "Sort order",
        "Desktop table",
        "Mobile list",
      ],
    },
    {
      packageNumber:
        9,
      title:
        "WordPress Content Foundation",
      description:
        "Content ViewModel, Article Card/Grid, landing, detail và WordPress gateway boundary.",
      phase:
        "content",
      status:
        "hotfix",
      statusLabel:
        "Hotfix applied",
      routes: [
        {
          label:
            "Content foundation",
          href:
            "/ui-preview/content-foundation",
        },
      ],
      checks: [
        "Guide cards",
        "Article body",
        "Related articles",
        "Content callout",
      ],
      note:
        "Đã áp dụng Package 09 v2 và verifier v3.",
    },
    {
      packageNumber:
        10,
      title:
        "Guide Page Integration",
      description:
        "Guide server service, locale fallback, fixture/WordPress runtime và metadata.",
      phase:
        "content",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Guide landing",
          href:
            "/ui-preview/guide-integration",
        },
        {
          label:
            "Guide article",
          href:
            "/ui-preview/guide-integration/cach-kiem-tra-dien-thoai-ho-tro-esim?locale=vi",
        },
      ],
      checks: [
        "Locale fallback",
        "Category filtering",
        "Article detail",
        "Source mode label",
      ],
    },
    {
      packageNumber:
        11,
      title:
        "WordPress Content Localization Plugin",
      description:
        "WordPress meta, locale identity và REST API cho Guide/Help/Policy/FAQ.",
      phase:
        "content",
      status:
        "external",
      statusLabel:
        "External integration",
      routes: [],
      checks: [
        "Plugin active",
        "REST config endpoint",
        "Guide list endpoint",
        "Guide detail endpoint",
      ],
      note:
        "Plugin được cài trên shop.ysim.vn; không có storefront preview route riêng.",
    },
    {
      packageNumber:
        12,
      title:
        "Product Detail Page",
      description:
        "Gallery, variation selector, dynamic price, features, notes và related products.",
      phase:
        "commerce",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Product Detail",
          href:
            "/ui-preview/product-detail-refactor",
        },
      ],
      checks: [
        "Variation switching",
        "Stock state",
        "Gallery",
        "Demo add-to-cart",
      ],
    },
    {
      packageNumber:
        13,
      title:
        "Cart Page",
      description:
        "Cart item, quantity, remove, coupon, totals, empty state và related products.",
      phase:
        "commerce",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Cart refactor",
          href:
            "/ui-preview/cart-refactor",
        },
      ],
      checks: [
        "Quantity",
        "Remove",
        "YSIM10 coupon",
        "Empty state",
      ],
    },
    {
      packageNumber:
        14,
      title:
        "Checkout Page",
      description:
        "Customer, recipient, payment method, terms, order summary và demo success.",
      phase:
        "commerce",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Checkout refactor",
          href:
            "/ui-preview/checkout-refactor",
        },
      ],
      checks: [
        "Required fields",
        "Recipient mode",
        "Payment selection",
        "Terms validation",
      ],
    },
    {
      packageNumber:
        15,
      title:
        "Payment & Order Results",
      description:
        "Processing, success, failed, pending và order detail screens.",
      phase:
        "commerce",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Payment result",
          href:
            "/ui-preview/payment-result-refactor",
        },
        {
          label:
            "Order result",
          href:
            "/ui-preview/order-result-refactor/YSIM-DEMO-20260721-001",
        },
      ],
      checks: [
        "Four payment states",
        "Timeline",
        "Order summary",
        "Contact/payment facts",
      ],
    },
    {
      packageNumber:
        16,
      title:
        "Support & Device Compatibility",
      description:
        "Support topics, compatibility checker, manual checks, FAQ và contact channels.",
      phase:
        "support",
      status:
        "ready",
      statusLabel:
        "Ready",
      routes: [
        {
          label:
            "Support refactor",
          href:
            "/ui-preview/support-refactor",
        },
      ],
      checks: [
        "Brand/model selector",
        "Three compatibility states",
        "FAQ accordion",
        "Contact cards",
      ],
    },
  ];

export const uiPreviewHub:
  PreviewHubViewModel = {
    title:
      "YSim UI Refactor Preview Hub",

    description:
      "Mở, tìm kiếm và kiểm thử toàn bộ các màn hình refactor từ một vị trí duy nhất.",

    packages:
      uiPreviewPackages,

    phases: [
      {
        id:
          "all",
        label:
          "Tất cả",
      },
      {
        id:
          "foundation",
        label:
          "Foundation",
      },
      {
        id:
          "navigation",
        label:
          "Navigation",
      },
      {
        id:
          "discovery",
        label:
          "Discovery",
      },
      {
        id:
          "content",
        label:
          "Content",
      },
      {
        id:
          "commerce",
        label:
          "Commerce",
      },
      {
        id:
          "support",
        label:
          "Support",
      },
    ],

    viewports: [
      {
        id:
          "mobile",
        label:
          "Mobile",
        width:
          "390px",
        description:
          "Điện thoại phổ biến và thao tác một tay.",
        checks: [
          "Không horizontal overflow",
          "CTA đủ lớn",
          "Rail swipe được",
        ],
      },
      {
        id:
          "tablet",
        label:
          "Tablet",
        width:
          "768px",
        description:
          "Breakpoint trung gian giữa mobile và desktop.",
        checks: [
          "Grid không quá dày",
          "Form không bị nén",
          "Navigation đúng mode",
        ],
      },
      {
        id:
          "desktop",
        label:
          "Desktop",
        width:
          "1440px",
        description:
          "Kiểm tra full-width layout và mật độ thông tin.",
        checks: [
          "Container cân đối",
          "Sticky summary",
          "Không có khoảng trắng bất thường",
        ],
      },
    ],

    checklist: {
      title:
        "Checklist review chung",

      items: [
        "Typography và khoảng cách nhất quán.",
        "Không có horizontal overflow.",
        "Hover/focus/disabled/error states rõ ràng.",
        "Mobile, tablet và desktop đều sử dụng được.",
        "Preview không tạo Order hoặc Payment thật.",
        "Component không gọi WooCommerce/WordPress trực tiếp.",
        "Route và CTA không dẫn tới hành động nguy hiểm.",
        "npm run typecheck và npm run build đều PASS.",
      ],
    },
  };
