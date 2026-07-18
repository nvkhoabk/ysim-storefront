import type {
  OffersSupportBenefit,
  PartnerTier,
} from "@/components/offers/types";

export const partnerTiers: PartnerTier[] = [
  {
    key: "silver",
    name: "SILVER",
    subtitle: "Khởi đầu linh hoạt",
    discountLabel: "30%",
    salesRequirement: "Không yêu cầu",
    benefits: [
      "Website White Label cơ bản",
      "Hỗ trợ kỹ thuật 24/7",
      "Cập nhật sản phẩm thường xuyên",
    ],
    href: "/offers#silver-policy",
  },
  {
    key: "gold",
    name: "GOLD",
    subtitle: "Tăng trưởng nhanh",
    discountLabel: "40%",
    salesRequirement: "≥ 200 SIM/tháng",
    benefits: [
      "Website White Label nâng cao",
      "Hỗ trợ ưu tiên",
      "Thưởng doanh số hàng tháng",
    ],
    href: "/offers#gold-policy",
  },
  {
    key: "diamond",
    name: "DIAMOND",
    subtitle: "Đối tác chiến lược",
    discountLabel: "55%",
    salesRequirement: "≥ 1.000 SIM/tháng",
    benefits: [
      "API chuyên sâu & tích hợp riêng",
      "Account Manager riêng",
      "Thưởng doanh số cao + ưu đãi đặc biệt",
    ],
    href: "/offers#diamond-policy",
  },
];

export const offersSupportBenefits: OffersSupportBenefit[] = [
  {
    id: "marketing-support",
    title: "Hỗ trợ marketing",
    description:
      "Tài liệu, banner, công cụ hỗ trợ bán hàng",
  },
  {
    id: "free-training",
    title: "Đào tạo miễn phí",
    description:
      "Hướng dẫn sản phẩm và kỹ năng bán hàng",
  },
  {
    id: "agency-program",
    title: "Chương trình đại lý",
    description:
      "Nhiều chương trình ưu đãi theo từng thời kỳ",
  },
  {
    id: "transparent-policy",
    title: "Minh bạch & rõ ràng",
    description:
      "Chính sách minh bạch, thanh toán nhanh chóng",
  },
  {
    id: "grow-together",
    title: "Đồng hành phát triển",
    description:
      "Cùng đối tác phát triển thị trường bền vững",
  },
];