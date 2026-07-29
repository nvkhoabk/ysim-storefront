// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1

import type { CurrencyMessages } from "../currency.types";

export const currencyMessagesVi: CurrencyMessages = {
  "preview.title": "Báo giá tiền tệ và ảnh chụp giá",
  "preview.description":
    "Candidate kiểm tra phép quy đổi bằng số nguyên, nguồn tỷ giá, thời hạn báo giá và ảnh chụp hiển thị trước khi tích hợp production.",
  "preview.fixtureWarning":
    "Tỷ giá trong trang này chỉ là fixture minh họa, không phải tỷ giá trực tiếp và không được dùng để thu tiền.",
  "preview.sourceAuthority":
    "Giá nguồn 169.000 ₫ bằng VND vẫn là dữ liệu có thẩm quyền; số tiền quy đổi chỉ phục vụ hiển thị candidate.",
  "views.quote": "Báo giá",
  "views.rounding": "Làm tròn",
  "views.snapshot": "Ảnh chụp giá",
  "views.expired": "Hết hạn",
  "common.sourceAmount": "Số tiền nguồn",
  "common.targetAmount": "Số tiền hiển thị",
  "common.sourceCurrency": "Tiền tệ nguồn",
  "common.targetCurrency": "Tiền tệ đích",
  "common.market": "Thị trường",
  "common.quoteId": "Mã báo giá",
  "common.provider": "Nguồn tỷ giá",
  "common.rateVersion": "Phiên bản tỷ giá",
  "common.effectiveAt": "Hiệu lực từ",
  "common.quotedAt": "Tạo báo giá lúc",
  "common.expiresAt": "Hết hạn lúc",
  "common.evaluatedAt": "Đánh giá lúc",
  "common.status": "Trạng thái",
  "common.valid": "Còn hiệu lực",
  "common.expired": "Đã hết hạn",
  "common.purpose": "Mục đích",
  "common.roundingMode": "Quy tắc làm tròn",
  "common.fingerprint": "Dấu vân tay snapshot",
  "common.numerator": "Tử số",
  "common.denominator": "Mẫu số",
  "common.targetMinor": "Minor units đích",
  "common.sourceMinor": "Minor units nguồn",
  "common.previewOnly": "Chỉ dùng trong UI preview",
  "common.fixtureOnly": "fixture-only",
  "common.halfAway": "Làm tròn nửa ra xa số 0",
  "quote.heading": "Báo giá theo thị trường",
  "quote.notice":
    "Phép tính sử dụng BigInt và hàm money hiện có; không sử dụng số thực để làm tròn tiền.",
  "rounding.heading": "Chi tiết phép tính số nguyên",
  "rounding.formula":
    "Số tiền đích được tính từ minor units, tỷ lệ hữu tỷ và minor unit của tiền tệ đích.",
  "rounding.result": "Kết quả sau quy tắc làm tròn nửa ra xa số 0.",
  "snapshot.heading": "Ảnh chụp hiển thị bất biến",
  "snapshot.notice":
    "Snapshot lưu nguồn, tỷ lệ, thời gian và kết quả hiển thị; đây không phải lệnh thanh toán hay quyết toán.",
  "expired.heading": "Báo giá hết hạn",
  "expired.notice":
    "Báo giá hết hạn phải bị từ chối trước bước thanh toán và được lấy lại từ nguồn tỷ giá production trong giai đoạn sau.",
  "expired.action": "Không thể tiếp tục với báo giá hết hạn",
  "labels.preview": "Candidate báo giá và snapshot tiền tệ",
  "labels.tabs": "Chọn trạng thái báo giá",
  "labels.localeNavigation": "Chọn ngôn ngữ preview",
  "labels.quoteCard": "Thông tin báo giá",
  "labels.calculationCard": "Chi tiết phép tính",
  "labels.snapshotCard": "Thông tin snapshot",
  "labels.expiredCard": "Trạng thái hết hạn",
};
