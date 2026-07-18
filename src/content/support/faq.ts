export interface SupportFaqItem {
  id: string;

  question: string;

  answer: string;
}

export const supportFaqItems: SupportFaqItem[] = [
  {
    id: "what-is-esim",
    question: "eSIM là gì và hoạt động như thế nào?",
    answer:
      "eSIM là SIM điện tử được tích hợp trực tiếp trong thiết bị. Bạn chỉ cần quét mã QR hoặc nhập thông tin cài đặt để kích hoạt mà không cần lắp SIM vật lý.",
  },
  {
    id: "activate-esim",
    question: "Làm thế nào để kích hoạt eSIM?",
    answer:
      "Sau khi mua hàng, bạn sẽ nhận được mã QR qua email. Hãy mở phần cài đặt mạng di động trên điện thoại, chọn thêm eSIM và quét mã QR để kích hoạt.",
  },
  {
    id: "supported-devices",
    question: "Tôi có thể sử dụng eSIM trên những thiết bị nào?",
    answer:
      "eSIM hoạt động trên nhiều mẫu iPhone, iPad, Samsung Galaxy, Google Pixel và các thiết bị Android đời mới. Bạn nên kiểm tra khả năng hỗ trợ eSIM trước khi mua.",
  },
  {
    id: "no-network",
    question: "Nếu đến nơi không có mạng thì phải làm sao?",
    answer:
      "Hãy kiểm tra dữ liệu di động, chuyển vùng dữ liệu, cấu hình APN và lựa chọn mạng thủ công. Nếu vẫn chưa kết nối được, hãy liên hệ bộ phận hỗ trợ YSim.",
  },
  {
    id: "hotspot",
    question: "eSIM có thể chia sẻ dữ liệu hotspot không?",
    answer:
      "Khả năng chia sẻ hotspot phụ thuộc vào từng gói eSIM và chính sách của nhà mạng. Thông tin này sẽ được ghi rõ trong phần mô tả sản phẩm.",
  },
  {
    id: "refund-policy",
    question: "Chính sách hoàn tiền của YSim như thế nào?",
    answer:
      "YSim xem xét hoàn tiền theo trạng thái kích hoạt và điều kiện của từng sản phẩm. Vui lòng gửi yêu cầu hỗ trợ kèm mã đơn hàng để được kiểm tra.",
  },
];