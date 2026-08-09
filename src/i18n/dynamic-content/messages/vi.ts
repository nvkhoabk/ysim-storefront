// F07A-2E-1_DYNAMIC_CONTENT_LOCALIZATION_CANDIDATE_R1

import type { DynamicContentMessages } from "../dynamic-content.types";

export const dynamicContentMessagesVi: DynamicContentMessages = {
  "preview.title": "Bản địa hóa nội dung động",
  "preview.description":
    "Candidate kiểm tra lớp nội dung đa ngôn ngữ cho sản phẩm WooCommerce, điểm đến và bài viết WordPress.",
  "preview.candidate":
    "Chỉ hoạt động trong UI preview; adapter production và dữ liệu nguồn chưa thay đổi.",
  "preview.policy":
    "Nội dung được lấy từ bản ghi locale rõ ràng; không dịch máy hoặc tạo nội dung tại runtime.",
  "preview.authority":
    "ID, SKU, giá, tồn kho và biến thể vẫn do WooCommerce quản lý.",
  "preview.fallback":
    "Khi thiếu bản dịch, hệ thống phải trả fallback cùng thông tin nguồn gốc rõ ràng.",
  "views.product": "Sản phẩm",
  "views.destination": "Điểm đến",
  "views.guide": "Bài hướng dẫn",
  "views.fallback": "Fallback",
  "common.sourceSystem": "Hệ thống nguồn",
  "common.entityId": "Mã thực thể",
  "common.slug": "Slug",
  "common.requestedLocale": "Locale yêu cầu",
  "common.resolvedLocale": "Locale trả về",
  "common.status": "Trạng thái phân giải",
  "common.localized": "Đã bản địa hóa",
  "common.fallback": "Đã dùng fallback",
  "common.title": "Tiêu đề",
  "common.summary": "Tóm tắt",
  "common.description": "Mô tả",
  "common.imageAlt": "Mô tả ảnh",
  "common.provenance": "Nguồn gốc nội dung",
  "common.noFallback": "Không dùng fallback",
  "common.fallbackReason": "Lý do fallback",
  "common.textOverlay": "Lớp phủ văn bản",
  "common.sourceAuthority": "Dữ liệu vận hành nguồn",
  "common.previewOnly":
    "Chỉ là candidate giao diện; không gọi API nội dung thật.",
  "product.eyebrow": "Nội dung sản phẩm",
  "product.heading": "Nội dung sản phẩm đã resolve theo locale",
  "product.authorityHeading": "Ảnh chụp dữ liệu WooCommerce có thẩm quyền",
  "product.productId": "Product ID",
  "product.sku": "SKU",
  "product.sourceCurrency": "Tiền tệ nguồn",
  "product.sourcePrice": "Giá nguồn",
  "product.stock": "Tồn kho",
  "product.variations": "Số biến thể",
  "product.stockValue": "Còn hàng",
  "product.overlayNotice":
    "Chỉ title, summary, description và image alt được lớp bản địa hóa ghi đè.",
  "destination.eyebrow": "Nội dung điểm đến",
  "destination.heading": "Nội dung taxonomy điểm đến theo locale",
  "destination.notice":
    "ID và slug taxonomy giữ nguyên; chỉ nhãn hiển thị được bản địa hóa.",
  "guide.eyebrow": "Nội dung WordPress",
  "guide.heading": "Bài hướng dẫn đã bản địa hóa",
  "guide.notice":
    "Danh tính bài viết và trạng thái xuất bản vẫn thuộc WordPress; candidate chỉ minh họa trường văn bản đã resolve.",
  "fallback.eyebrow": "Chính sách fallback",
  "fallback.heading": "Kết quả khi thiếu bản dịch",
  "fallback.notice":
    "Fallback phải công khai requested locale, resolved locale và lý do; không được giả vờ là bản dịch đầy đủ.",
  "fallback.reasonMissing": "Không có bản ghi nội dung cho locale yêu cầu.",
  "fallback.reasonNone": "Không áp dụng fallback.",
  "labels.preview": "Candidate bản địa hóa nội dung động",
  "labels.tabs": "Chọn loại nội dung động",
  "labels.localeNavigation": "Chọn ngôn ngữ preview",
  "labels.contentCard": "Nội dung đã resolve",
  "labels.authorityCard": "Dữ liệu nguồn có thẩm quyền",
  "labels.provenance": "Thông tin nguồn gốc và fallback",
};
