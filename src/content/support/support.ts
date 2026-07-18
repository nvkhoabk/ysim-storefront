import {
  CircleEllipsis,
  CreditCard,
  FileClock,
  Smartphone,
  UserRound,
  Wifi,
} from "lucide-react";

import type {
  SupportHeroContent,
  SupportTopic,
} from "@/components/support/types";

export const supportHeroContent: SupportHeroContent = {
  title: "Bạn cần",
  highlightedText: "hỗ trợ?",
  description:
    "Đội ngũ YSim luôn sẵn sàng hỗ trợ bạn 24/7 qua nhiều kênh khác nhau.",
  searchPlaceholder:
    "Tìm kiếm câu hỏi, chủ đề hỗ trợ...",
  imageSrc: "/images/hero/hero-support.png",
  imageAlt:
    "Tai nghe hỗ trợ, điện thoại YSim và hành lý du lịch",
};

export const supportTopics: SupportTopic[] = [
  {
    id: "esim-activation",
    title: "Kích hoạt eSIM",
    description:
      "Hướng dẫn kích hoạt và cài đặt eSIM",
    href: "/support#esim-activation",
    iconComponent: Smartphone,
  },
  {
    id: "connection",
    title: "Kết nối & Internet",
    description:
      "Xử lý sự cố kết nối, mất mạng",
    href: "/support#connection",
    iconComponent: Wifi,
  },
  {
    id: "payment",
    title: "Thanh toán",
    description:
      "Phương thức thanh toán, hoàn tiền",
    href: "/support#payment",
    iconComponent: CreditCard,
  },
  {
    id: "account",
    title: "Tài khoản",
    description:
      "Quản lý tài khoản và đơn hàng",
    href: "/support#account",
    iconComponent: UserRound,
  },
  {
    id: "exchange-refund",
    title: "Đổi eSIM & hoàn tiền",
    description:
      "Chính sách đổi eSIM, hoàn tiền",
    href: "/support#exchange-refund",
    iconComponent: FileClock,
  },
  {
    id: "other",
    title: "Khác",
    description:
      "Các câu hỏi khác và góp ý",
    href: "/support#other",
    iconComponent: CircleEllipsis,
  },
];