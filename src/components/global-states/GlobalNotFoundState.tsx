import {
  MapPinOff,
} from "lucide-react";

import {
  GlobalStateFrame,
} from "./GlobalStateFrame";

export function GlobalNotFoundState({
  title =
    "Không tìm thấy trang",
  description =
    "Đường dẫn có thể đã thay đổi, nội dung chưa được xuất bản hoặc không còn tồn tại.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <GlobalStateFrame
      tone="warning"
      icon={
        <MapPinOff className="h-7 w-7" />
      }
      eyebrow="404"
      title={
        title
      }
      description={
        description
      }
      primaryAction={{
        label:
          "Về trang chủ",
        href:
          "/",
        variant:
          "primary",
      }}
      secondaryAction={{
        label:
          "Xem điểm đến",
        href:
          "/destinations",
        variant:
          "outline",
      }}
    />
  );
}
