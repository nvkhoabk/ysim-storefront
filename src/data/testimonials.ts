export interface TestimonialItem {
  id: string;
  customerName: string;
  destination: string;
  destinationFlag: string;
  rating: number;
  content: string;
  initials: string;
  verified?: boolean;
}

export const testimonials: TestimonialItem[] = [
  {
    id: "review-01",
    customerName: "Ngọc H.",
    destination: "Nhật Bản",
    destinationFlag: "🇯🇵",
    rating: 5,
    content:
      "Kết nối rất ổn định, tốc độ nhanh. Kích hoạt dễ dàng và hỗ trợ rất nhiệt tình.",
    initials: "NH",
    verified: true,
  },
  {
    id: "review-02",
    customerName: "Minh T.",
    destination: "Hàn Quốc",
    destinationFlag: "🇰🇷",
    rating: 5,
    content:
      "Sử dụng eSIM ở Seoul và Busan đều tốt. Giá hợp lý, chắc chắn sẽ tiếp tục ủng hộ.",
    initials: "MT",
    verified: true,
  },
  {
    id: "review-03",
    customerName: "Hoàng P.",
    destination: "Châu Âu",
    destinationFlag: "🇪🇺",
    rating: 5,
    content:
      "Dùng 15 ngày ở ba nước châu Âu, không gặp vấn đề gì và không phải đổi SIM.",
    initials: "HP",
    verified: true,
  },
  {
    id: "review-04",
    customerName: "Thảo V.",
    destination: "Thái Lan",
    destinationFlag: "🇹🇭",
    rating: 5,
    content:
      "Quét QR là dùng ngay, rất tiện. Nhân viên hỗ trợ nhanh và thân thiện.",
    initials: "TV",
    verified: true,
  },
  {
    id: "review-05",
    customerName: "Anh K.",
    destination: "Singapore",
    destinationFlag: "🇸🇬",
    rating: 5,
    content:
      "Mua nhanh, nhận QR ngay qua email và kết nối Internet ổn định trong suốt chuyến đi.",
    initials: "AK",
    verified: true,
  },
  {
    id: "review-06",
    customerName: "Linh M.",
    destination: "Hoa Kỳ",
    destinationFlag: "🇺🇸",
    rating: 5,
    content:
      "Hotspot hoạt động tốt, dùng bản đồ và gọi video thuận tiện. Trải nghiệm rất hài lòng.",
    initials: "LM",
    verified: true,
  },
  {
    id: "review-07",
    customerName: "Quân N.",
    destination: "Trung Quốc",
    destinationFlag: "🇨🇳",
    rating: 5,
    content:
      "Cài đặt đơn giản và mạng ổn định. Phù hợp cho cả công việc lẫn liên lạc gia đình.",
    initials: "QN",
    verified: true,
  },
  {
    id: "review-08",
    customerName: "Mai A.",
    destination: "Toàn cầu",
    destinationFlag: "🌐",
    rating: 5,
    content:
      "Đi nhiều quốc gia nhưng chỉ cần một eSIM. Rất tiện và dễ quản lý.",
    initials: "MA",
    verified: true,
  },
];
