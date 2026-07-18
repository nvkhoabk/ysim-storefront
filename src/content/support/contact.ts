import type {
  LucideIcon,
} from "lucide-react";

import {
  Headphones,
  Mail,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";

export interface SupportContactMethod {
  id: string;

  title: string;

  description: string;

  actionLabel: string;

  href: string;

  icon: LucideIcon;

  external?: boolean;
}

export const supportContactMethods: SupportContactMethod[] = [
  {
    id: "live-chat",
    title: "Hỗ trợ 24/7 qua chat",
    description:
      "Trò chuyện trực tiếp với nhân viên hỗ trợ",
    actionLabel: "Chat ngay",
    href: "/support#live-chat",
    icon: Headphones,
  },
  {
    id: "support-request",
    title: "Gửi yêu cầu hỗ trợ",
    description:
      "Phản hồi qua email trong vòng 2 giờ",
    actionLabel: "Gửi yêu cầu",
    href: "/support/request",
    icon: Mail,
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "+84 24 9999 7777",
    actionLabel: "Nhắn tin",
    href: "https://wa.me/842499997777",
    icon: MessageCircle,
    external: true,
  },
  {
    id: "messenger",
    title: "Messenger",
    description: "m.me/ysim.vn",
    actionLabel: "Nhắn tin",
    href: "https://m.me/ysim.vn",
    icon: MessagesSquare,
    external: true,
  },
];