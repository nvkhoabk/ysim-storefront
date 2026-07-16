export interface TravelGuideItem {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  image: string;
}

export const travelGuides: TravelGuideItem[] = [
  {
    id: "guide-01",
    title: "Nên cài eSIM trước hay sau khi đến nơi?",
    excerpt:
      "Thời điểm phù hợp để cài đặt và kích hoạt eSIM trước mỗi chuyến đi.",
    slug: "nen-cai-esim-truoc-hay-sau-khi-den-noi",
    category: "Kinh nghiệm eSIM",
    image: "/images/guides/install-esim.jpg",
  },
  {
    id: "guide-02",
    title: "eSIM khác roaming quốc tế như thế nào?",
    excerpt: "So sánh chi phí, tốc độ và sự thuận tiện giữa eSIM với roaming.",
    slug: "esim-khac-roaming-quoc-te-nhu-the-nao",
    category: "Kiến thức eSIM",
    image: "/images/guides/esim-vs-roaming.jpg",
  },
  {
    id: "guide-03",
    title: "Cách kiểm tra điện thoại có hỗ trợ eSIM",
    excerpt:
      "Kiểm tra nhanh khả năng tương thích của thiết bị trước khi mua eSIM.",
    slug: "cach-kiem-tra-dien-thoai-ho-tro-esim",
    category: "Hướng dẫn thiết bị",
    image: "/images/guides/device-check.jpg",
  },
];
