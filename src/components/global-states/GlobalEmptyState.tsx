import {
  Inbox,
} from "lucide-react";

import type {
  GlobalStateActionViewModel,
} from "@/types/view-models/global-state";

import {
  GlobalStateFrame,
} from "./GlobalStateFrame";

export function GlobalEmptyState({
  eyebrow =
    "Chưa có dữ liệu",
  title =
    "Chưa có nội dung",
  description =
    "Hiện chưa có mục nào phù hợp để hiển thị.",
  primaryAction = {
    label:
      "Khám phá điểm đến",
    href:
      "/destinations",
    variant:
      "primary",
  },
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryAction?:
    GlobalStateActionViewModel;
}) {
  return (
    <GlobalStateFrame
      tone="brand"
      icon={
        <Inbox className="h-7 w-7" />
      }
      eyebrow={
        eyebrow
      }
      title={
        title
      }
      description={
        description
      }
      primaryAction={
        primaryAction
      }
    />
  );
}
