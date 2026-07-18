import type {
  OffersBenefitItem,
  OffersHeroContent,
  OffersHighlightItem,
  OffersTabItem,
} from "@/components/offers/types";

export const offersHeroContent: OffersHeroContent = {
  title: "Ưu đãi hấp dẫn",
  secondTitleLine: "Cùng bạn",
  highlightedText: "phát triển",
  description:
    "Chính sách ưu đãi cạnh tranh, minh bạch và linh hoạt giúp đối tác tối ưu lợi nhuận và phát triển bền vững.",
  imageSrc: "/images/hero/hero-offers.png",
  imageAlt:
    "Điện thoại YSim, vali du lịch và bản đồ kết nối toàn cầu",
};

export const offersBenefits: OffersBenefitItem[] = [
  {
    id: "high-discount",
    title: "Chiết khấu cao",
    description: "Biên lợi nhuận hấp dẫn",
  },
  {
    id: "sustainable-growth",
    title: "Tăng trưởng bền vững",
    description: "Càng bán nhiều, ưu đãi càng cao",
  },
  {
    id: "sales-rewards",
    title: "Thưởng hấp dẫn",
    description: "Thưởng doanh số và chương trình đặc biệt",
  },
  {
    id: "partner-support",
    title: "Hỗ trợ toàn diện",
    description: "Đồng hành cùng đối tác 24/7",
  },
];

export const offersHighlights: OffersHighlightItem[] = [
  {
    id: "maximum-discount",
    title: "Chiết khấu lên đến",
    value: "55%",
    description: "Tùy theo hạng đối tác",
  },
  {
    id: "revenue-reward",
    title: "Thưởng doanh số",
    description: "Thưởng doanh số hấp dẫn",
  },
  {
    id: "fast-payment",
    title: "Thanh toán nhanh",
    description: "Hỗ trợ linh hoạt",
  },
];

export const offersTabs: OffersTabItem[] = [
  {
    key: "discount-policy",
    label: "Chính sách chiết khấu",
    href: "/offers#discount-policy",
  },
  {
    key: "sales-rewards",
    label: "Thưởng doanh số",
    href: "/offers#sales-rewards",
  },
  {
    key: "special-offers",
    label: "Ưu đãi đặc biệt",
    href: "/offers#special-offers",
  },
  {
    key: "settlement",
    label: "Quy đổi & thanh toán",
    href: "/offers#settlement",
  },
  {
    key: "terms",
    label: "Điều khoản",
    href: "/offers#terms",
  },
];