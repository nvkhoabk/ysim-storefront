import type {
  DeviceCompatibilityViewModel,
  SupportContactChannelViewModel,
} from "@/types/view-models/support";

export const productionSupportDevices:
  readonly DeviceCompatibilityViewModel[] = [
    {
      id:
        "apple-iphone-15-production",
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
        "Dòng thiết bị này có chức năng eSIM; cần kiểm tra biến thể thị trường và khóa mạng.",
      notes: [
        "Mở Cài đặt → Di động → Thêm eSIM.",
        "Bấm *#06# và kiểm tra mã EID.",
        "Xác nhận thiết bị không bị khóa theo nhà mạng.",
      ],
    },
    {
      id:
        "apple-iphone-13-production",
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
        "Dòng thiết bị này có chức năng eSIM; cần kiểm tra biến thể thị trường.",
      notes: [
        "Tìm mục Thêm eSIM trong phần Di động.",
        "Kiểm tra Khóa nhà cung cấp.",
      ],
    },
    {
      id:
        "samsung-galaxy-s24-production",
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
        "Khả năng eSIM có thể phụ thuộc mã model, firmware và thị trường phân phối.",
      notes: [
        "Mở Trình quản lý SIM → Thêm eSIM.",
        "Xác nhận mã model đầy đủ.",
        "Kiểm tra máy không bị khóa mạng.",
      ],
    },
    {
      id:
        "google-pixel-8-production",
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
        "Dòng thiết bị này có chức năng eSIM; cần kiểm tra trạng thái khóa mạng.",
      notes: [
        "Mở Mạng và Internet → SIM → Thêm SIM.",
        "Kiểm tra mã EID bằng *#06#.",
      ],
    },
    {
      id:
        "xiaomi-redmi-note-10-production",
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
        "Model này không có eSIM tích hợp trong cấu hình phổ biến.",
      notes: [
        "Không có lựa chọn Thêm eSIM.",
        "Không hiển thị mã EID.",
      ],
    },
    {
      id:
        "oppo-find-x5-pro-production",
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
        "Khả năng eSIM khác nhau theo biến thể thị trường.",
      notes: [
        "Kiểm tra mục SIM và mạng di động.",
        "Xác nhận mã model và thị trường phân phối.",
      ],
    },
  ];

function validContactHref(
  value:
    | string
    | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized =
    value.trim();

  if (
    normalized.startsWith(
      "https://",
    ) ||
    normalized.startsWith(
      "mailto:",
    ) ||
    normalized.startsWith(
      "tel:",
    )
  ) {
    return normalized;
  }

  return undefined;
}

export function createProductionSupportContactsFromEnvironment():
  readonly SupportContactChannelViewModel[] {
  const contacts:
    SupportContactChannelViewModel[] = [];

  const email =
    process.env
      .YSIM_SUPPORT_EMAIL
      ?.trim() ||
    "support@ysim.vn";

  const emailHref =
    validContactHref(
      email.startsWith(
        "mailto:",
      )
        ? email
        : `mailto:${email}`,
    );

  if (emailHref) {
    contacts.push({
      id:
        "production-email",
      title:
        "Email hỗ trợ",
      description:
        "Gửi mã đơn hàng, ảnh chụp màn hình và thông tin thiết bị để được hỗ trợ.",
      actionLabel:
        "Gửi email",
      href:
        emailHref,
      icon:
        "email",
      availability:
        "Phản hồi theo SLA hỗ trợ",
    });
  }

  const zaloHref =
    validContactHref(
      process.env
        .YSIM_SUPPORT_ZALO_URL,
    );

  if (zaloHref) {
    contacts.push({
      id:
        "production-zalo",
      title:
        "Zalo OA",
      description:
        "Kênh hỗ trợ nhanh dành cho khách hàng tại Việt Nam.",
      actionLabel:
        "Mở Zalo",
      href:
        zaloHref,
      icon:
        "chat",
      availability:
        "Theo giờ hỗ trợ công bố",
    });
  }

  const telegramHref =
    validContactHref(
      process.env
        .YSIM_SUPPORT_TELEGRAM_URL,
    );

  if (telegramHref) {
    contacts.push({
      id:
        "production-telegram",
      title:
        "Telegram",
      description:
        "Kênh hỗ trợ dành cho khách hàng quốc tế và đối tác.",
      actionLabel:
        "Mở Telegram",
      href:
        telegramHref,
      icon:
        "telegram",
      availability:
        "Theo giờ hỗ trợ công bố",
    });
  }

  const hotlineHref =
    validContactHref(
      process.env
        .YSIM_SUPPORT_HOTLINE_URL,
    );

  if (hotlineHref) {
    contacts.push({
      id:
        "production-hotline",
      title:
        process.env
          .YSIM_SUPPORT_HOTLINE_DISPLAY
          ?.trim() ||
        "Hotline",
      description:
        "Dành cho tình huống cần hỗ trợ khẩn cấp trong chuyến đi.",
      actionLabel:
        "Gọi hotline",
      href:
        hotlineHref,
      icon:
        "phone",
      availability:
        "Theo thời gian hoạt động của hotline",
    });
  }

  return contacts;
}
