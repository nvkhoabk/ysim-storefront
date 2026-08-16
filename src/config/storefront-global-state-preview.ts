import type {
  GlobalStatePreviewViewModel,
} from "@/types/view-models/global-state";

export function createGlobalStatePreviewViewModel():
  GlobalStatePreviewViewModel {
  return {
    title:
      "Global Loading, Error, Empty & 404 States",
    description:
      "Bộ trạng thái dùng chung cho storefront, transactional routes và WordPress content.",
    states: [
      {
        id:
          "loading",
        kind:
          "loading",
        tone:
          "neutral",
        eyebrow:
          "Loading",
        title:
          "Đang tải nội dung",
        description:
          "Skeleton giữ bố cục ổn định trong khi storefront chờ dữ liệu.",
      },
      {
        id:
          "error",
        kind:
          "error",
        tone:
          "danger",
        eyebrow:
          "Route error",
        title:
          "Chưa thể tải nội dung",
        description:
          "Đã xảy ra sự cố tạm thời. Bạn có thể thử lại mà không cần nhập lại thông tin.",
        detail:
          "Không hiển thị stack trace, token, order key hoặc thông tin kỹ thuật nhạy cảm.",
        primaryAction: {
          label:
            "Thử lại",
          variant:
            "primary",
        },
        secondaryAction: {
          label:
            "Liên hệ hỗ trợ",
          href:
            "/support",
          variant:
            "outline",
        },
      },
      {
        id:
          "empty",
        kind:
          "empty",
        tone:
          "brand",
        eyebrow:
          "Empty collection",
        title:
          "Chưa có nội dung",
        description:
          "Request đã thành công nhưng hiện chưa có item phù hợp.",
        primaryAction: {
          label:
            "Khám phá điểm đến",
          href:
            "/destinations",
          variant:
            "primary",
        },
      },
      {
        id:
          "not-found",
        kind:
          "not-found",
        tone:
          "warning",
        eyebrow:
          "404",
        title:
          "Không tìm thấy trang",
        description:
          "Đường dẫn có thể đã thay đổi, nội dung chưa được xuất bản hoặc không còn tồn tại.",
        primaryAction: {
          label:
            "Về trang chủ",
          href:
            "/",
          variant:
            "primary",
        },
        secondaryAction: {
          label:
            "Xem điểm đến",
          href:
            "/destinations",
          variant:
            "outline",
        },
      },
      {
        id:
          "offline",
        kind:
          "offline",
        tone:
          "warning",
        eyebrow:
          "Connection",
        title:
          "Kết nối đang gián đoạn",
        description:
          "Hãy kiểm tra kết nối mạng rồi thử lại. Nếu vừa thanh toán, không gửi lại giao dịch cho tới khi kiểm tra trạng thái đơn.",
        primaryAction: {
          label:
            "Thử lại",
          variant:
            "primary",
        },
        secondaryAction: {
          label:
            "Xem hỗ trợ",
          href:
            "/support",
          variant:
            "outline",
        },
      },
    ],
    acceptance: [
      "Loading dùng role=status và aria-live=polite.",
      "Error dùng role=alert và aria-live=assertive.",
      "Empty không bị mô tả như lỗi.",
      "404 giữ Header/Footer và có đường quay lại.",
      "Global Error hoạt động không phụ thuộc Root Layout.",
      "Không hiển thị secrets hoặc stack trace.",
      "Không khẳng định Payment thất bại khi trạng thái chưa rõ.",
      "Mobile, tablet và desktop không tràn ngang.",
    ],
  };
}
