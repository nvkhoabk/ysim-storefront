import type { ShellLocale } from "../shell/shell.types";

export const GLOBAL_STATE_MESSAGES = {
  vi: {
    loadingTitle: "Đang tải nội dung",
    loadingDescription: "YSim đang chuẩn bị dữ liệu cho bạn.",
    notFoundTitle: "Không tìm thấy trang",
    notFoundDescription:
      "Đường dẫn có thể đã thay đổi, nội dung chưa được xuất bản hoặc không còn tồn tại.",
    home: "Về trang chủ",
    destinations: "Xem điểm đến",
    errorEyebrow: "Đã xảy ra sự cố",
    errorTitle: "Chưa thể tải nội dung",
    errorDescription:
      "Đã xảy ra sự cố tạm thời. Bạn có thể thử lại mà không cần nhập lại thông tin.",
    support: "Liên hệ hỗ trợ",
    retry: "Thử lại",
    retrying: "Đang thử lại...",
    systemErrorTitle: "Hệ thống đang gặp sự cố",
    systemErrorDescription:
      "Vui lòng thử lại. Nếu bạn vừa thanh toán, không gửi lại giao dịch cho tới khi kiểm tra trạng thái đơn hàng.",
    reference: "Mã tham chiếu",
  },
  en: {
    loadingTitle: "Loading content",
    loadingDescription: "YSim is preparing your information.",
    notFoundTitle: "Page not found",
    notFoundDescription:
      "The address may have changed, the content may not be published, or it may no longer exist.",
    home: "Go to home page",
    destinations: "Browse destinations",
    errorEyebrow: "Something went wrong",
    errorTitle: "Content could not be loaded",
    errorDescription:
      "A temporary problem occurred. You can retry without entering your information again.",
    support: "Contact support",
    retry: "Try again",
    retrying: "Retrying...",
    systemErrorTitle: "The system encountered a problem",
    systemErrorDescription:
      "Please try again. If you just paid, do not resubmit the transaction until the order status has been checked.",
    reference: "Reference",
  },
  lo: {
    loadingTitle: "ກຳລັງໂຫຼດເນື້ອຫາ",
    loadingDescription: "YSim ກຳລັງກຽມຂໍ້ມູນໃຫ້ທ່ານ.",
    notFoundTitle: "ບໍ່ພົບໜ້າ",
    notFoundDescription:
      "ທີ່ຢູ່ອາດປ່ຽນແປງ, ເນື້ອຫາອາດຍັງບໍ່ໄດ້ເຜີຍແຜ່ ຫຼື ບໍ່ມີອີກແລ້ວ.",
    home: "ກັບໜ້າຫຼັກ",
    destinations: "ເບິ່ງຈຸດໝາຍ",
    errorEyebrow: "ເກີດບັນຫາ",
    errorTitle: "ຍັງບໍ່ສາມາດໂຫຼດເນື້ອຫາ",
    errorDescription:
      "ເກີດບັນຫາຊົ່ວຄາວ. ທ່ານສາມາດລອງໃໝ່ໂດຍບໍ່ຕ້ອງປ້ອນຂໍ້ມູນອີກ.",
    support: "ຕິດຕໍ່ຝ່າຍຊ່ວຍເຫຼືອ",
    retry: "ລອງໃໝ່",
    retrying: "ກຳລັງລອງໃໝ່...",
    systemErrorTitle: "ລະບົບພົບບັນຫາ",
    systemErrorDescription:
      "ກະລຸນາລອງໃໝ່. ຖ້າທ່ານຫາກໍຊຳລະເງິນ, ຢ່າສົ່ງທຸລະກຳຊ້ຳຈົນກວ່າຈະກວດສອບສະຖານະຄຳສັ່ງຊື້.",
    reference: "ລະຫັດອ້າງອີງ",
  },
} as const satisfies Readonly<
  Record<ShellLocale, Readonly<Record<string, string>>>
>;

export function globalStateMessages(locale: ShellLocale) {
  return GLOBAL_STATE_MESSAGES[locale];
}
