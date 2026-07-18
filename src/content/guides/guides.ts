import type {
  GuidesHeroContent,
  GuidesTabItem,
} from "@/components/guides/types";

export const guidesHeroContent: GuidesHeroContent = {
  title: "Hướng dẫn sử dụng",
  highlightedTitle: "eSIM",
  description:
    "Dễ dàng cài đặt và kết nối eSIM chỉ với vài bước đơn giản. Làm theo hướng dẫn chi tiết dưới đây để bắt đầu ngay!",
  imageSrc: "/images/hero/heo-instruction.png",
  imageAlt:
    "Điện thoại hiển thị mã QR eSIM cùng vali và hành lý du lịch",
};

export const guidesTabs: GuidesTabItem[] = [
  {
    key: "installation",
    label: "Hướng dẫn cài đặt eSIM",
    href: "/guides#installation",
  },
  {
    key: "device-check",
    label: "Kiểm tra thiết bị",
    href: "/device-check",
  },
  {
    key: "faq",
    label: "Câu hỏi thường gặp",
    href: "/faq",
  },
  {
    key: "videos",
    label: "Video hướng dẫn",
    href: "/guides/videos",
  },
];