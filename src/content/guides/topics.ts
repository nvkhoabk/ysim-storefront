import {
  Apple,
  Bot,
  CircleHelp,
  QrCode,
  Settings,
  Signal,
} from "lucide-react";

export interface PopularGuideTopic {
  id: string;

  title: string;

  highlightedText?: string;

  href: string;

  icon: typeof Apple;
}

export const popularGuideTopics: PopularGuideTopic[] = [
  {
    id: "iphone-ipad",
    title: "Hướng dẫn cho",
    highlightedText: "iPhone / iPad",
    href: "/guides/iphone-ipad",
    icon: Apple,
  },
  {
    id: "android",
    title: "Hướng dẫn cho",
    highlightedText: "Android",
    href: "/guides/android",
    icon: Bot,
  },
  {
    id: "scan-qr",
    title: "Cách quét mã QR",
    highlightedText: "và cài đặt eSIM",
    href: "/guides/scan-qr",
    icon: QrCode,
  },
  {
    id: "manual-apn",
    title: "Cài đặt APN",
    highlightedText: "thủ công",
    href: "/guides/manual-apn",
    icon: Settings,
  },
  {
    id: "troubleshooting",
    title: "Khắc phục sự cố",
    highlightedText: "kết nối",
    href: "/guides/troubleshooting",
    icon: Signal,
  },
  {
    id: "what-is-esim",
    title: "eSIM là gì?",
    highlightedText: "Và hoạt động thế nào?",
    href: "/guides/what-is-esim",
    icon: CircleHelp,
  },
];