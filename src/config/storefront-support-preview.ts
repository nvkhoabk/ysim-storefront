import type {
  HeroViewModel,
} from "@/types/view-models/hero";

import type {
  SupportPageViewModel,
} from "@/types/view-models/support";

const supportHero:
  HeroViewModel = {
    eyebrow:
      "Trung tâm hỗ trợ",

    title:
      "Sẵn sàng đồng hành",

    highlightedText:
      "trong mọi hành trình.",

    description:
      "Tìm hướng dẫn cài đặt, kiểm tra thiết bị và câu trả lời cho các vấn đề thường gặp.",

    benefits: [
      {
        label:
          "Kiểm tra thiết bị",
        icon:
          "secure",
      },
      {
        label:
          "Hướng dẫn từng bước",
        icon:
          "instant",
      },
      {
        label:
          "Nhiều kênh hỗ trợ",
        icon:
          "global",
      },
      {
        label:
          "Hỗ trợ 24/7",
        icon:
          "support",
      },
    ],

    media: {
	  imageUrl: "/assets/heroes/support-hero.png",
      eyebrow:
        "YSim Support",
      alt:
        "Minh họa trung tâm hỗ trợ YSim",
    },

    variant:
      "brand",

    alignment:
      "left",
  };

export const supportPreviewPage:
  SupportPageViewModel = {
    hero:
      supportHero,

    topics: [
      {
        id:
          "installation",

        title:
          "Cài đặt eSIM",

        description:
          "Hướng dẫn cài đặt, bật dữ liệu và cấu hình roaming data.",

        href:
          "/guides?category=installation",

        icon:
          "installation",
      },

      {
        id:
          "device",

        title:
          "Kiểm tra thiết bị",

        description:
          "Xác định điện thoại có hỗ trợ eSIM và không bị khóa mạng.",

        href:
          "#device-compatibility",

        icon:
          "device",
      },

      {
        id:
          "payment",

        title:
          "Thanh toán",

        description:
          "Tìm hiểu trạng thái giao dịch, hoàn tiền và thanh toán lại.",

        href:
          "/support/payment",

        icon:
          "payment",
      },

      {
        id:
          "order",

        title:
          "Đơn hàng và nhận eSIM",

        description:
          "Kiểm tra email nhận eSIM, mã đơn hàng và tiến trình xử lý.",

        href:
          "/support/orders",

        icon:
          "order",
      },
    ],

    devices: [
      {
        id:
          "apple-iphone-15",

        brand:
          "Apple",

        model:
          "iPhone 15",

        platform:
          "ios",

        status:
          "supported",

        statusLabel:
          "Hỗ trợ eSIM",

        description:
          "Thiết bị preview này được đánh dấu hỗ trợ eSIM.",

        notes: [
          "Kiểm tra mục Thêm eSIM trong Cài đặt → Di động.",
          "Đảm bảo thiết bị không bị khóa theo nhà mạng.",
          "Biến thể thị trường có thể có cấu hình SIM khác nhau.",
        ],
      },

      {
        id:
          "apple-iphone-13",

        brand:
          "Apple",

        model:
          "iPhone 13",

        platform:
          "ios",

        status:
          "supported",

        statusLabel:
          "Hỗ trợ eSIM",

        description:
          "Thiết bị preview này được đánh dấu hỗ trợ eSIM.",

        notes: [
          "Có thể lưu nhiều cấu hình eSIM.",
          "Kiểm tra tình trạng Khóa nhà cung cấp.",
        ],
      },

      {
        id:
          "samsung-galaxy-s24",

        brand:
          "Samsung",

        model:
          "Galaxy S24",

        platform:
          "android",

        status:
          "conditional",

        statusLabel:
          "Cần kiểm tra thêm",

        description:
          "Khả năng eSIM có thể phụ thuộc biến thể thị trường và nhà mạng.",

        notes: [
          "Tìm Trình quản lý SIM → Thêm eSIM.",
          "Kiểm tra mã model chính xác của thiết bị.",
          "Kiểm tra firmware và thị trường phân phối.",
        ],
      },

      {
        id:
          "google-pixel-8",

        brand:
          "Google",

        model:
          "Pixel 8",

        platform:
          "android",

        status:
          "supported",

        statusLabel:
          "Hỗ trợ eSIM",

        description:
          "Thiết bị preview này được đánh dấu hỗ trợ eSIM.",

        notes: [
          "Tìm mục SIM → Thêm SIM → Thiết lập eSIM.",
          "Đảm bảo máy không bị khóa mạng.",
        ],
      },

      {
        id:
          "xiaomi-redmi-note-10",

        brand:
          "Xiaomi",

        model:
          "Redmi Note 10",

        platform:
          "android",

        status:
          "unsupported",

        statusLabel:
          "Không hỗ trợ eSIM",

        description:
          "Thiết bị preview này được đánh dấu không hỗ trợ eSIM tích hợp.",

        notes: [
          "Không tìm thấy lựa chọn Thêm eSIM.",
          "Không hiển thị mã EID khi kiểm tra *#06#.",
        ],
      },

      {
        id:
          "oppo-find-x5-pro",

        brand:
          "OPPO",

        model:
          "Find X5 Pro",

        platform:
          "android",

        status:
          "conditional",

        statusLabel:
          "Cần kiểm tra thêm",

        description:
          "Khả năng eSIM có thể khác nhau theo phiên bản thị trường.",

        notes: [
          "Kiểm tra mục SIM và mạng di động.",
          "Xác nhận mã model đầy đủ trước khi mua.",
        ],
      },
    ],

    manualChecks: [
      {
        step:
          1,

        title:
          "Tìm mục Thêm eSIM",

        description:
          "Mở phần cài đặt Di động, SIM hoặc Mạng và tìm lựa chọn Thêm eSIM.",
      },

      {
        step:
          2,

        title:
          "Kiểm tra mã EID",

        description:
          "Bấm *#06#. Thiết bị hỗ trợ eSIM thường hiển thị mã EID.",
      },

      {
        step:
          3,

        title:
          "Kiểm tra khóa mạng",

        description:
          "Thiết bị bị khóa theo nhà mạng có thể không dùng được eSIM du lịch.",
      },

      {
        step:
          4,

        title:
          "Xác nhận mã model",

        description:
          "Cùng một tên máy có thể có biến thể khác nhau theo thị trường phân phối.",
      },
    ],

    faqs: [
      {
        id:
          "install-before-arrival",

        question:
          "Nên cài eSIM trước hay sau khi đến nơi?",

        answer:
          "Bạn nên cài eSIM khi còn Wi-Fi ổn định, nhưng chỉ bật làm đường dữ liệu chính khi đến điểm đến, trừ khi gói có quy định khác.",
      },

      {
        id:
          "delete-esim",

        question:
          "Có thể xóa rồi cài lại eSIM không?",

        answer:
          "Nhiều mã QR chỉ dùng để cài đặt một lần. Không nên xóa eSIM sau khi cài, trừ khi bộ phận hỗ trợ xác nhận có thể cài lại.",
      },

      {
        id:
          "physical-sim",

        question:
          "Có thể dùng SIM vật lý cùng lúc với eSIM không?",

        answer:
          "Nhiều thiết bị hỗ trợ Dual SIM, nhưng khả năng hoạt động đồng thời phụ thuộc model và cấu hình thiết bị.",
      },

      {
        id:
          "no-eid",

        question:
          "Không thấy mã EID thì phải làm sao?",

        answer:
          "Hãy kiểm tra mục Thêm eSIM trong cài đặt, mã model đầy đủ và tài liệu của nhà sản xuất. Khi vẫn chưa chắc chắn, liên hệ YSim trước khi mua.",
      },

      {
        id:
          "activation-start",

        question:
          "Thời hạn gói bắt đầu khi nào?",

        answer:
          "Thời điểm bắt đầu phụ thuộc chính sách kích hoạt của từng gói. Thông tin này cần được kiểm tra trên trang chi tiết sản phẩm.",
      },
    ],

    contacts: [
      {
        id:
          "email",

        title:
          "Email hỗ trợ",

        description:
          "Phù hợp khi cần gửi ảnh chụp màn hình, mã đơn hàng hoặc thông tin thiết bị.",

        actionLabel:
          "Gửi email",

        href:
          "mailto:support@ysim.vn",

        icon:
          "email",

        availability:
          "Phản hồi theo SLA hỗ trợ",
      },

      {
        id:
          "zalo",

        title:
          "Zalo OA",

        description:
          "Trao đổi nhanh với bộ phận hỗ trợ YSim bằng tiếng Việt.",

        actionLabel:
          "Mở Zalo",

        href:
          "/support/zalo",

        icon:
          "chat",

        availability:
          "Kênh preview",
      },

      {
        id:
          "telegram",

        title:
          "Telegram",

        description:
          "Kênh hỗ trợ thuận tiện cho khách hàng quốc tế và đối tác.",

        actionLabel:
          "Mở Telegram",

        href:
          "/support/telegram",

        icon:
          "telegram",

        availability:
          "Kênh preview",
      },

      {
        id:
          "hotline",

        title:
          "Hotline",

        description:
          "Dành cho tình huống cần hỗ trợ khẩn cấp trong chuyến đi.",

        actionLabel:
          "Xem hotline",

        href:
          "/support/hotline",

        icon:
          "phone",

        availability:
          "Thông tin preview",
      },
    ],
  };
