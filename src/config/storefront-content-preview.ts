import {
  createArticleCardViewModel,
  createArticlePageViewModel,
} from "@/lib/content/refactor";

import type {
  ContentLandingViewModel,
  WordPressContentSource,
} from "@/types/view-models/content";

import {
  guideCategories,
  guideLandingHero,
} from "@/config/storefront-content";

const contentFixtures:
  readonly WordPressContentSource[] = [
    {
      id:
        601,

      kind:
        "guide",

      contentFamilyCode:
        "esim-install-before-arrival",

      locale:
        "vi",

      slug:
        "nen-cai-esim-truoc-hay-sau-khi-den-noi",

      titleHtml:
        "Nên cài eSIM trước hay sau khi đến nơi?",

      excerptHtml:
        "<p>Thời điểm cài đặt ảnh hưởng đến việc kích hoạt và thời hạn sử dụng của eSIM.</p>",

      contentHtml:
        [
          "<h2>Nên cài eSIM trước chuyến đi</h2>",
          "<p>Bạn nên cài eSIM khi còn kết nối Wi-Fi ổn định, thường là trước khi ra sân bay hoặc tại khách sạn.</p>",
          "<h2>Khi nào nên bật đường dữ liệu?</h2>",
          "<p>Chỉ bật eSIM làm đường dữ liệu chính khi đã đến điểm đến, trừ khi gói có quy định khác.</p>",
          "<ul><li>Giữ mã QR an toàn.</li><li>Không xóa eSIM sau khi cài.</li><li>Kiểm tra chính sách kích hoạt của từng gói.</li></ul>",
        ].join(""),

      featuredImageUrl:
        "/ui-preview/content/install-esim.svg",

      featuredImageAlt:
        "Hướng dẫn cài đặt eSIM trước chuyến đi",

      publishedAt:
        "2026-07-01T08:00:00+07:00",

      modifiedAt:
        "2026-07-10T08:00:00+07:00",

      categoryIds: [
        "installation",
      ],

      categoryLabels: [
        "Cài đặt eSIM",
      ],

      seo: {
        title:
          "Nên cài eSIM trước hay sau khi đến nơi? | YSim",

        description:
          "Hướng dẫn chọn thời điểm cài và kích hoạt eSIM trước chuyến đi.",

        noindex:
          false,
      },
    },
    {
      id:
        602,

      kind:
        "guide",

      contentFamilyCode:
        "device-esim-check",

      locale:
        "vi",

      slug:
        "cach-kiem-tra-dien-thoai-ho-tro-esim",

      titleHtml:
        "Cách kiểm tra điện thoại có hỗ trợ eSIM",

      excerptHtml:
        "<p>Kiểm tra thiết bị trước khi mua để tránh chọn nhầm gói eSIM.</p>",

      contentHtml:
        [
          "<h2>Kiểm tra trong phần cài đặt</h2>",
          "<p>Trên iPhone, mở Cài đặt → Di động và tìm mục Thêm eSIM.</p>",
          "<h2>Kiểm tra mã EID</h2>",
          "<p>Bấm *#06#. Nếu thiết bị hiển thị EID, thiết bị thường hỗ trợ eSIM.</p>",
          "<blockquote>Lưu ý: một số thiết bị có thể bị khóa mạng hoặc giới hạn theo thị trường.</blockquote>",
        ].join(""),

      featuredImageUrl:
        "/ui-preview/content/device-check.svg",

      featuredImageAlt:
        "Kiểm tra điện thoại hỗ trợ eSIM",

      publishedAt:
        "2026-07-02T08:00:00+07:00",

      categoryIds: [
        "device",
      ],

      categoryLabels: [
        "Kiểm tra thiết bị",
      ],
    },
    {
      id:
        603,

      kind:
        "guide",

      contentFamilyCode:
        "esim-vs-roaming",

      locale:
        "vi",

      slug:
        "esim-khac-roaming-quoc-te-nhu-the-nao",

      titleHtml:
        "eSIM khác roaming quốc tế như thế nào?",

      excerptHtml:
        "<p>So sánh chi phí, cách kích hoạt và phạm vi sử dụng giữa eSIM du lịch và roaming.</p>",

      contentHtml:
        [
          "<h2>eSIM du lịch</h2>",
          "<p>Bạn mua trước một gói data cố định và sử dụng trên mạng đối tác tại điểm đến.</p>",
          "<h2>Roaming quốc tế</h2>",
          "<p>Bạn tiếp tục sử dụng SIM chính nhưng chi phí phụ thuộc chính sách của nhà mạng.</p>",
          "<h2>Nên chọn phương án nào?</h2>",
          "<p>eSIM phù hợp khi bạn muốn kiểm soát chi phí. Roaming phù hợp khi cần giữ nguyên số điện thoại cho cuộc gọi.</p>",
        ].join(""),

      featuredImageUrl:
        "/ui-preview/content/roaming.svg",

      featuredImageAlt:
        "So sánh eSIM và roaming quốc tế",

      publishedAt:
        "2026-07-03T08:00:00+07:00",

      categoryIds: [
        "usage",
      ],

      categoryLabels: [
        "Cách sử dụng",
      ],
    },
  ];

export const contentPreviewArticles =
  contentFixtures.map(
    createArticleCardViewModel,
  );

export const contentPreviewLanding:
  ContentLandingViewModel = {
    hero:
      guideLandingHero,

    categories:
      guideCategories,

    activeCategoryId:
      "all",

    section: {
      eyebrow:
        "Bài viết mới",

      title:
        "Hướng dẫn eSIM dành cho bạn",

      description:
        "Nội dung được mô phỏng theo dữ liệu trả về từ plugin YSim Content trên WordPress.",
    },

    articles:
      contentPreviewArticles,

    callout: {
      title:
        "Không tìm thấy câu trả lời?",

      description:
        "Trung tâm hỗ trợ YSim luôn sẵn sàng đồng hành cùng bạn trước và trong chuyến đi.",

      tone:
        "info",
    },
  };

export const contentPreviewArticle =
  createArticlePageViewModel(
    contentFixtures[0],
  );

export const contentPreviewArticlePage = {
  article:
    contentPreviewArticle,

  relatedTitle:
    "Tiếp tục tìm hiểu về eSIM",

  relatedArticles:
    contentPreviewArticles.slice(
      1,
    ),

  callout: {
    title:
      "Ghi nhớ trước khi cài đặt",

    description:
      "Không xóa eSIM sau khi cài. Mỗi mã QR thường chỉ được dùng để cài đặt một lần.",

    tone:
      "warning" as const,
  },
};
