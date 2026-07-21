import type {
  HomePageContentViewModel,
} from "@/types/view-models/home";

export const storefrontHomeContent:
  HomePageContentViewModel = {
    destinationSection: {
      eyebrow:
        "Điểm đến nổi bật",

      title:
        "Chọn nơi bạn sắp đến",

      description:
        "Khám phá các gói eSIM phù hợp với từng hành trình.",

      actionLabel:
        "Xem tất cả",

      actionHref:
        "/destinations",
    },

    productSection: {
      eyebrow:
        "Gói eSIM nổi bật",

      title:
        "Chọn gói phù hợp với hành trình",

      description:
        "Các gói được tuyển chọn theo dung lượng, thời hạn và nhu cầu sử dụng.",

      actionLabel:
        "Xem tất cả",

      actionHref:
        "/esim",
    },

    selectionAssistant: {
      eyebrow:
        "Cần trợ giúp?",

      title:
        "Không biết chọn gói nào?",

      description:
        "Trả lời vài câu hỏi ngắn để YSim gợi ý gói data phù hợp với điểm đến và thời gian chuyến đi.",

      actionLabel:
        "Bắt đầu ngay",

      actionHref:
        "/package-assistant",
    },

    valueProposition: {
      eyebrow:
        "Vì sao chọn YSim",

      title:
        "Kết nối đơn giản cho mọi hành trình",

      description:
        "YSim giúp bạn tập trung vào chuyến đi thay vì lo lắng về kết nối.",

      items: [
        {
          title:
            "Kích hoạt tức thì",

          description:
            "Nhận eSIM ngay sau khi thanh toán và cài đặt trong vài phút.",

          icon:
            "instant",
        },
        {
          title:
            "Giá minh bạch",

          description:
            "Không phí ẩn, không phát sinh roaming ngoài dự kiến.",

          icon:
            "transparent",
        },
        {
          title:
            "Hỗ trợ 24/7",

          description:
            "Đội ngũ hỗ trợ đồng hành trước, trong và sau chuyến đi.",

          icon:
            "support",
        },
        {
          title:
            "Phủ sóng toàn cầu",

          description:
            "Nhiều lựa chọn eSIM cho hơn 200 quốc gia và vùng lãnh thổ.",

          icon:
            "global",
        },
      ],
    },

    howItWorks: {
      eyebrow:
        "Cách hoạt động",

      title:
        "Ba bước để luôn kết nối",

      description:
        "Không cần tháo SIM vật lý, không cần chờ giao hàng.",

      steps: [
        {
          step:
            1,

          title:
            "Chọn điểm đến và gói",

          description:
            "Tìm điểm đến, chọn dung lượng và số ngày phù hợp.",

          icon:
            "choose",
        },
        {
          step:
            2,

          title:
            "Nhận eSIM",

          description:
            "Mã QR và hướng dẫn được gửi ngay sau khi thanh toán.",

          icon:
            "receive",
        },
        {
          step:
            3,

          title:
            "Kích hoạt và sử dụng",

          description:
            "Cài eSIM trước chuyến đi và kết nối khi đến nơi.",

          icon:
            "connect",
        },
      ],
    },

    testimonials: {
      eyebrow:
        "Khách hàng nói gì",

      title:
        "Đồng hành cùng hàng nghìn chuyến đi",

      description:
        "Testimonial đang dùng dữ liệu tĩnh trong giai đoạn đầu.",

      items: [
        {
          id:
            "review-01",

          name:
            "Minh Anh",

          initials:
            "MA",

          location:
            "Hà Nội",

          purchasedProduct:
            "eSIM Nhật Bản",

          rating:
            5,

          quote:
            "Cài đặt nhanh, sang Tokyo bật data là dùng ngay. Hướng dẫn rất dễ hiểu.",
        },
        {
          id:
            "review-02",

          name:
            "Quang Huy",

          initials:
            "QH",

          location:
            "TP. Hồ Chí Minh",

          purchasedProduct:
            "eSIM Hàn Quốc",

          rating:
            5,

          quote:
            "Tốc độ ổn định suốt chuyến đi Seoul và Busan, không cần đổi SIM vật lý.",
        },
        {
          id:
            "review-03",

          name:
            "Thu Trang",

          initials:
            "TT",

          location:
            "Đà Nẵng",

          purchasedProduct:
            "eSIM Thái Lan",

          rating:
            5,

          quote:
            "Mua trước giờ bay vẫn nhận QR ngay. Bộ phận hỗ trợ phản hồi rất nhanh.",
        },
        {
          id:
            "review-04",

          name:
            "Đức Long",

          initials:
            "DL",

          location:
            "Hải Phòng",

          purchasedProduct:
            "eSIM Toàn cầu",

          rating:
            5,

          quote:
            "Một eSIM dùng qua nhiều quốc gia giúp chuyến công tác thuận tiện hơn nhiều.",
        },
      ],
    },

    partners: {
      eyebrow:
        "Mạng lưới kết nối",

      title:
        "Kết nối qua các đối tác viễn thông toàn cầu",

      description:
        "Logo dạng text mark tạm thời và sẽ được thay bằng bộ asset chính thức.",

      items: [
        {
          name:
            "Vodafone",
          shortName:
            "VODAFONE",
        },
        {
          name:
            "T-Mobile",
          shortName:
            "T-MOBILE",
        },
        {
          name:
            "Singtel",
          shortName:
            "SINGTEL",
        },
        {
          name:
            "Telefónica",
          shortName:
            "TELEFÓNICA",
        },
        {
          name:
            "Airtel",
          shortName:
            "AIRTEL",
        },
        {
          name:
            "Optus",
          shortName:
            "OPTUS",
        },
        {
          name:
            "AT&T",
          shortName:
            "AT&T",
        },
      ],
    },
  };
