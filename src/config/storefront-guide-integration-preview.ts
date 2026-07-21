import type {
  WordPressContentSource,
} from "@/types/view-models/content";

export const guideIntegrationFixtures:
  readonly WordPressContentSource[] = [
    {
      id:
        701,
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
        "<p>Cài eSIM đúng thời điểm giúp tránh kích hoạt sớm và đảm bảo bạn có kết nối ngay khi hạ cánh.</p>",
      contentHtml:
        [
          "<h2>Nên cài eSIM trước chuyến đi</h2>",
          "<p>Hãy cài eSIM khi bạn còn kết nối Wi-Fi ổn định. Với phần lớn gói, việc cài đặt không đồng nghĩa với kích hoạt thời hạn sử dụng.</p>",
          "<h2>Khi nào nên bật dữ liệu?</h2>",
          "<p>Chỉ bật eSIM làm đường dữ liệu chính khi đã đến điểm đến, trừ khi mô tả gói có quy định khác.</p>",
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
        702,
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
          "<blockquote>Một số thiết bị có thể bị khóa mạng hoặc giới hạn theo thị trường.</blockquote>",
        ].join(""),
      featuredImageUrl:
        "/ui-preview/content/device-check.svg",
      featuredImageAlt:
        "Kiểm tra điện thoại hỗ trợ eSIM",
      publishedAt:
        "2026-07-02T08:00:00+07:00",
      modifiedAt:
        "2026-07-11T08:00:00+07:00",
      categoryIds: [
        "device",
      ],
      categoryLabels: [
        "Kiểm tra thiết bị",
      ],
    },
    {
      id:
        703,
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
    {
      id:
        704,
      kind:
        "guide",
      contentFamilyCode:
        "device-esim-check",
      locale:
        "en",
      slug:
        "how-to-check-esim-support",
      titleHtml:
        "How to check whether your phone supports eSIM",
      excerptHtml:
        "<p>Check compatibility before buying an eSIM plan.</p>",
      contentHtml:
        [
          "<h2>Check your device settings</h2>",
          "<p>On iPhone, open Settings → Cellular and look for Add eSIM.</p>",
          "<h2>Check the EID</h2>",
          "<p>Dial *#06#. An EID usually indicates eSIM support.</p>",
        ].join(""),
      featuredImageUrl:
        "/ui-preview/content/device-check.svg",
      featuredImageAlt:
        "Check whether a phone supports eSIM",
      publishedAt:
        "2026-07-02T08:00:00+07:00",
      categoryIds: [
        "device",
      ],
      categoryLabels: [
        "Device compatibility",
      ],
      seo: {
        title:
          "How to check eSIM support | YSim",
        description:
          "Check whether your phone supports eSIM before purchasing.",
        noindex:
          false,
      },
    },
  ];
