import type {
  OrderRouteCandidateConfigViewModel,
} from "@/types/view-models/order-route-candidate";

export function createOrderRouteCandidateConfigViewModel():
  OrderRouteCandidateConfigViewModel {
  return {
    title:
      "Thông tin đơn hàng",
    description:
      "Order được đọc lại từ WooCommerce sau khi xác minh guest access proof.",
    diagnostics: [
      {
        label:
          "Guest proof",
        status:
          "live",
        statusLabel:
          "Order ID + key",
        message:
          "Mã đơn trên URL không tự cấp quyền truy cập.",
      },
      {
        label:
          "Order key",
        status:
          "ready",
        statusLabel:
          "Not returned",
        message:
          "Order key chỉ được gửi để xác minh và không xuất hiện trong response.",
      },
      {
        label:
          "WooCommerce Order",
        status:
          "live",
        statusLabel:
          "Server-side",
        message:
          "Lines, totals, contacts và status được lấy lại bằng REST credentials phía server.",
      },
      {
        label:
          "Payment status",
        status:
          "warning",
        statusLabel:
          "Order-derived",
        message:
          "Package 31 map từ WooCommerce status; chưa query Payment Provider.",
      },
      {
        label:
          "Fulfillment",
        status:
          "warning",
        statusLabel:
          "Timeline only",
        message:
          "Chưa gọi Gigago, chưa tạo hoặc gửi QR eSIM.",
      },
    ],
  };
}
