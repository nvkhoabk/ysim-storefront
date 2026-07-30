// F07A-3B_CURRENCY_PRESENTATION_INTEGRATION_CANDIDATE_R1

import type { CurrencyPresentationMessages } from "../currency-presentation.types";

export const currencyPresentationMessagesVi: CurrencyPresentationMessages = {
  "preview.title": "Tích hợp hiển thị tiền tệ theo ngữ cảnh",
  "preview.description":
    "Candidate này dùng lại báo giá và snapshot F07A-3A để trình bày giá nhất quán trên bốn ngữ cảnh giao diện.",
  "preview.candidate":
    "Chỉ phục vụ UI preview; không phải chỉ dẫn thanh toán hoặc quyết toán.",
  "preview.sourceAuthority": "Giá nguồn VND vẫn là dữ liệu có thẩm quyền.",
  "tabs.home": "Trang chủ",
  "tabs.listing": "Danh sách",
  "tabs.detail": "Chi tiết",
  "tabs.transaction": "Giao dịch",
  "common.context": "Ngữ cảnh",
  "common.market": "Thị trường",
  "common.locale": "Ngôn ngữ",
  "common.sourcePrice": "Giá nguồn",
  "common.displayPrice": "Giá hiển thị",
  "common.sourceCurrency": "Tiền tệ nguồn",
  "common.targetCurrency": "Tiền tệ hiển thị",
  "common.quoteId": "Mã báo giá",
  "common.quoteStatus": "Trạng thái báo giá",
  "common.snapshotFingerprint": "Dấu vân tay snapshot",
  "common.snapshotCapturedAt": "Thời điểm snapshot",
  "common.displayRole": "Vai trò hiển thị",
  "common.presentationId": "Mã trình bày",
  "common.valid": "Còn hiệu lực",
  "common.indicative": "Giá tham khảo",
  "common.checkoutPreview": "Xem trước checkout",
  "common.productionEligible": "Được phép dùng production",
  "common.no": "Không",
  "common.sourceSku": "SKU nguồn",
  "common.sourceProduct": "Sản phẩm nguồn",
  "home.heading": "Thẻ giá trên trang chủ",
  "home.description":
    "Giá hiển thị được suy ra từ cùng quote và snapshot, nhưng vẫn được đánh dấu là tham khảo.",
  "home.note": "Không thay đổi dữ liệu catalog hoặc giỏ hàng.",
  "home.action": "Mua hàng chưa được bật trong candidate",
  "listing.heading": "Giá trong danh sách sản phẩm",
  "listing.description":
    "Mỗi thẻ sản phẩm dùng cùng lớp trình bày tiền tệ thay vì tự tính lại tỷ giá.",
  "listing.note":
    "Không sao chép tỷ giá hoặc logic chuyển đổi vào component listing.",
  "listing.action": "Lọc và mua hàng chưa được bật",
  "detail.heading": "Giá trên trang chi tiết",
  "detail.description":
    "Giá hiển thị và snapshot có cùng quote ID để hỗ trợ đối chiếu giao diện.",
  "detail.note": "Thông tin này chưa phải giá chốt giao dịch.",
  "detail.action": "Thêm vào giỏ hàng chưa được bật",
  "transaction.heading": "Xem trước giá giao dịch",
  "transaction.description":
    "Ngữ cảnh giao dịch dùng vai trò checkout-preview và snapshot bất biến.",
  "transaction.note": "Không tạo payment, order hoặc fulfillment.",
  "transaction.action": "Thanh toán chưa được bật",
  "labels.preview": "Candidate tích hợp hiển thị tiền tệ",
  "labels.localeNavigation": "Điều hướng ngôn ngữ",
  "labels.tabs": "Các ngữ cảnh hiển thị",
  "labels.priceCard": "Thẻ giá hiển thị",
  "labels.contextCard": "Thông tin ngữ cảnh",
  "labels.safety": "Giới hạn an toàn",
};
