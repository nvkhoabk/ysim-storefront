import { normalizeShellLocale } from "@/i18n/shell/shell.registry";
import type { ShellLocale } from "@/i18n/shell/shell.types";

interface TextPair {
  readonly title: string;
  readonly description: string;
}

interface OffersTabCopy {
  readonly label: string;
  readonly placeholderTitle?: string;
  readonly placeholderDescription?: string;
}

interface OffersTierCopy {
  readonly subtitle: string;
  readonly requirement: string;
  readonly benefits: readonly [string, string, string];
}

export interface OffersPartnerCopy {
  readonly tabs: readonly [
    OffersTabCopy,
    OffersTabCopy,
    OffersTabCopy,
    OffersTabCopy,
    OffersTabCopy,
  ];
  readonly heroBenefits: readonly [TextPair, TextPair, TextPair, TextPair];
  readonly tiers: readonly [OffersTierCopy, OffersTierCopy, OffersTierCopy];
  readonly partnerBenefits: readonly [
    TextPair,
    TextPair,
    TextPair,
    TextPair,
    TextPair,
  ];
  readonly labels: {
    readonly policyTitle: string;
    readonly policyDescription: string;
    readonly discount: string;
    readonly salesRequirement: string;
    readonly otherBenefits: string;
    readonly breadcrumb: string;
    readonly home: string;
    readonly offers: string;
    readonly heroLine1: string;
    readonly heroLine2: string;
    readonly heroAccent: string;
    readonly heroDescription: string;
    readonly visualAria: string;
    readonly visualLabel: string;
    readonly highlightsAria: string;
    readonly maxDiscount: string;
    readonly partnerTierNote: string;
    readonly salesReward: string;
    readonly salesRewardDescription: string;
    readonly fastSettlement: string;
    readonly flexibleSupport: string;
    readonly tabsAria: string;
    readonly contact: string;
  };
}

const OFFERS_PARTNER_COPY = {
  vi: {
    tabs: [
      { label: "Chính sách chiết khấu" },
      {
        label: "Thưởng doanh số",
        placeholderTitle: "Chương trình thưởng doanh số",
        placeholderDescription:
          "Cơ chế tính thưởng, chu kỳ đối soát và mốc doanh số sẽ được bổ sung sau khi chính sách được duyệt.",
      },
      {
        label: "Ưu đãi đặc biệt",
        placeholderTitle: "Ưu đãi đặc biệt dành cho đối tác",
        placeholderDescription:
          "Các chiến dịch theo mùa, thị trường và nhóm sản phẩm đang được hoàn thiện.",
      },
      {
        label: "Quy đổi & thanh toán",
        placeholderTitle: "Quy đổi và thanh toán",
        placeholderDescription:
          "Quy tắc quy đổi, lịch thanh toán và đối soát sẽ được công bố sau.",
      },
      {
        label: "Điều khoản",
        placeholderTitle: "Điều khoản chương trình đối tác",
        placeholderDescription:
          "Nội dung sẽ được phát hành sau vòng rà soát pháp lý và vận hành.",
      },
    ],
    heroBenefits: [
      { title: "Chiết khấu cao", description: "Biên lợi nhuận hấp dẫn" },
      {
        title: "Tăng trưởng bền vững",
        description: "Càng bán nhiều, ưu đãi càng cao",
      },
      {
        title: "Thưởng hấp dẫn",
        description: "Thưởng doanh số và chương trình đặc biệt",
      },
      { title: "Hỗ trợ toàn diện", description: "Đồng hành cùng đối tác 24/7" },
    ],
    tiers: [
      {
        subtitle: "Khởi đầu linh hoạt",
        requirement: "Không yêu cầu",
        benefits: [
          "Website White Label cơ bản",
          "Hỗ trợ kỹ thuật 24/7",
          "Cập nhật sản phẩm thường xuyên",
        ],
      },
      {
        subtitle: "Tăng trưởng nhanh",
        requirement: "≥ 200 SIM/tháng",
        benefits: [
          "Website White Label nâng cao",
          "Hỗ trợ ưu tiên",
          "Thưởng doanh số hàng tháng",
        ],
      },
      {
        subtitle: "Đối tác chiến lược",
        requirement: "≥ 1.000 SIM/tháng",
        benefits: [
          "API chuyên sâu & tích hợp riêng",
          "Account Manager riêng",
          "Thưởng doanh số và ưu đãi đặc biệt",
        ],
      },
    ],
    partnerBenefits: [
      {
        title: "Hỗ trợ marketing",
        description: "Tài liệu, banner và công cụ hỗ trợ bán hàng",
      },
      {
        title: "Đào tạo miễn phí",
        description: "Hướng dẫn sản phẩm và kỹ năng bán hàng",
      },
      {
        title: "Chương trình đại lý",
        description: "Nhiều chương trình ưu đãi theo từng thời kỳ",
      },
      {
        title: "Minh bạch & rõ ràng",
        description: "Chính sách minh bạch, thanh toán nhanh chóng",
      },
      {
        title: "Đồng hành phát triển",
        description: "Cùng đối tác phát triển thị trường bền vững",
      },
    ],
    labels: {
      policyTitle: "Chính sách chiết khấu theo hạng đối tác",
      policyDescription: "Càng nâng hạng – Càng hưởng ưu đãi cao.",
      discount: "Chiết khấu",
      salesRequirement: "Yêu cầu doanh số",
      otherBenefits: "Ưu đãi khác",
      breadcrumb: "Điều hướng",
      home: "Trang chủ",
      offers: "Ưu đãi",
      heroLine1: "Ưu đãi hấp dẫn",
      heroLine2: "– Cùng bạn",
      heroAccent: "phát triển",
      heroDescription:
        "Chính sách cạnh tranh, minh bạch và linh hoạt giúp đối tác tối ưu lợi nhuận và phát triển bền vững.",
      visualAria: "Minh họa tăng trưởng kinh doanh eSIM",
      visualLabel: "Kết nối toàn cầu, mở rộng doanh số cùng YSim",
      highlightsAria: "Điểm nổi bật chương trình đối tác",
      maxDiscount: "Chiết khấu lên đến",
      partnerTierNote: "Tùy theo hạng đối tác",
      salesReward: "Thưởng doanh số",
      salesRewardDescription: "Thưởng doanh số hấp dẫn",
      fastSettlement: "Thanh toán nhanh",
      flexibleSupport: "Hỗ trợ linh hoạt",
      tabsAria: "Nội dung chương trình ưu đãi",
      contact: "Trao đổi về chương trình đối tác",
    },
  },
  en: {
    tabs: [
      { label: "Discount policy" },
      {
        label: "Sales rewards",
        placeholderTitle: "Sales reward program",
        placeholderDescription:
          "Reward calculations, reconciliation cycles, and targets will be published after policy approval.",
      },
      {
        label: "Special offers",
        placeholderTitle: "Special partner offers",
        placeholderDescription:
          "Seasonal, market, and product-group campaigns are being finalized.",
      },
      {
        label: "Settlement & payment",
        placeholderTitle: "Settlement and payment",
        placeholderDescription:
          "Conversion, settlement, and reconciliation rules will be published later.",
      },
      {
        label: "Terms",
        placeholderTitle: "Partner program terms",
        placeholderDescription:
          "Terms will be released after legal and operational review.",
      },
    ],
    heroBenefits: [
      { title: "Strong discounts", description: "Attractive partner margins" },
      {
        title: "Sustainable growth",
        description: "Higher sales unlock stronger benefits",
      },
      {
        title: "Reward programs",
        description: "Sales rewards and special campaigns",
      },
      {
        title: "Complete support",
        description: "Partner guidance around the clock",
      },
    ],
    tiers: [
      {
        subtitle: "Flexible start",
        requirement: "No minimum",
        benefits: [
          "Basic white-label site",
          "24/7 technical guidance",
          "Regular product updates",
        ],
      },
      {
        subtitle: "Accelerated growth",
        requirement: "≥ 200 SIM/month",
        benefits: [
          "Advanced white-label site",
          "Priority support",
          "Monthly sales rewards",
        ],
      },
      {
        subtitle: "Strategic partner",
        requirement: "≥ 1,000 SIM/month",
        benefits: [
          "Advanced API and custom integration",
          "Dedicated account manager",
          "Sales rewards and special benefits",
        ],
      },
    ],
    partnerBenefits: [
      {
        title: "Marketing support",
        description: "Sales materials, banners, and enablement tools",
      },
      {
        title: "Free training",
        description: "Product knowledge and sales-skill guidance",
      },
      {
        title: "Agency programs",
        description: "Campaigns tailored to each period",
      },
      {
        title: "Clear and transparent",
        description: "Transparent policy and timely settlement",
      },
      {
        title: "Grow together",
        description: "Build sustainable markets with YSim",
      },
    ],
    labels: {
      policyTitle: "Discount policy by partner tier",
      policyDescription: "Move up a tier to unlock stronger benefits.",
      discount: "Discount",
      salesRequirement: "Sales requirement",
      otherBenefits: "Other benefits",
      breadcrumb: "Breadcrumb",
      home: "Home",
      offers: "Offers",
      heroLine1: "Attractive benefits",
      heroLine2: "– Built to help you",
      heroAccent: "grow",
      heroDescription:
        "Competitive, transparent, and flexible policies help partners improve margins and grow sustainably.",
      visualAria: "eSIM business growth illustration",
      visualLabel: "Connect globally and grow sales with YSim",
      highlightsAria: "Partner program highlights",
      maxDiscount: "Discount up to",
      partnerTierNote: "Based on partner tier",
      salesReward: "Sales rewards",
      salesRewardDescription: "Attractive performance rewards",
      fastSettlement: "Fast settlement",
      flexibleSupport: "Flexible support",
      tabsAria: "Partner offer program content",
      contact: "Discuss the partner program",
    },
  },
  lo: {
    tabs: [
      { label: "ນະໂຍບາຍສ່ວນຫຼຸດ" },
      {
        label: "ລາງວັນຍອດຂາຍ",
        placeholderTitle: "ໂຄງການລາງວັນຍອດຂາຍ",
        placeholderDescription:
          "ວິທີຄິດລາງວັນ ແລະ ຮອບກວດສອບຈະປະກາດຫຼັງອະນຸມັດ.",
      },
      {
        label: "ໂປຣໂມຊັນພິເສດ",
        placeholderTitle: "ໂປຣໂມຊັນສຳລັບຄູ່ຮ່ວມງານ",
        placeholderDescription:
          "ແຄມເປນຕາມລະດູ, ຕະຫຼາດ ແລະ ກຸ່ມສິນຄ້າກຳລັງຈັດທຳ.",
      },
      {
        label: "ການຊຳລະ",
        placeholderTitle: "ການກວດສອບ ແລະ ຊຳລະ",
        placeholderDescription: "ກົດການຊຳລະ ແລະ ກວດສອບຈະປະກາດຕໍ່ໄປ.",
      },
      {
        label: "ເງື່ອນໄຂ",
        placeholderTitle: "ເງື່ອນໄຂໂຄງການ",
        placeholderDescription: "ເນື້ອຫາຈະປະກາດຫຼັງການກວດກົດໝາຍ ແລະ ດຳເນີນງານ.",
      },
    ],
    heroBenefits: [
      { title: "ສ່ວນຫຼຸດສູງ", description: "ກຳໄລຄູ່ຮ່ວມງານທີ່ໜ້າສົນໃຈ" },
      { title: "ເຕີບໂຕຍືນຍົງ", description: "ຍິ່ງຂາຍຫຼາຍ ຍິ່ງໄດ້ສິດຫຼາຍ" },
      { title: "ລາງວັນ", description: "ລາງວັນຍອດຂາຍ ແລະ ແຄມເປນ" },
      {
        title: "ຊ່ວຍເຫຼືອຄົບວົງຈອນ",
        description: "ຄຳແນະນຳສຳລັບຄູ່ຮ່ວມງານ 24/7",
      },
    ],
    tiers: [
      {
        subtitle: "ເລີ່ມຕົ້ນຍືດຫຍຸ່ນ",
        requirement: "ບໍ່ມີຂັ້ນຕ່ຳ",
        benefits: [
          "ເວັບ White Label ພື້ນຖານ",
          "ຄຳແນະນຳເຕັກນິກ 24/7",
          "ອັບເດດສິນຄ້າສະໝ່ຳສະເໝີ",
        ],
      },
      {
        subtitle: "ເຕີບໂຕໄວ",
        requirement: "≥ 200 SIM/ເດືອນ",
        benefits: [
          "ເວັບ White Label ຂັ້ນສູງ",
          "ຊ່ວຍເຫຼືອກ່ອນ",
          "ລາງວັນຍອດຂາຍລາຍເດືອນ",
        ],
      },
      {
        subtitle: "ຄູ່ຮ່ວມງານຍຸດທະສາດ",
        requirement: "≥ 1,000 SIM/ເດືອນ",
        benefits: [
          "API ແລະ ການເຊື່ອມຕໍ່ສະເພາະ",
          "ຜູ້ຈັດການບັນຊີສ່ວນຕົວ",
          "ລາງວັນ ແລະ ສິດພິເສດ",
        ],
      },
    ],
    partnerBenefits: [
      {
        title: "ຊ່ວຍເຫຼືອການຕະຫຼາດ",
        description: "ເອກະສານ, ແບນເນີ ແລະ ເຄື່ອງມືຂາຍ",
      },
      { title: "ຝຶກອົບຮົມຟຣີ", description: "ຄວາມຮູ້ສິນຄ້າ ແລະ ທັກສະການຂາຍ" },
      { title: "ໂຄງການຕົວແທນ", description: "ແຄມເປນຕາມແຕ່ລະໄລຍະ" },
      { title: "ໂປ່ງໃສ", description: "ນະໂຍບາຍຊັດເຈນ ແລະ ຊຳລະທັນເວລາ" },
      { title: "ເຕີບໂຕນຳກັນ", description: "ພັດທະນາຕະຫຼາດຍືນຍົງກັບ YSim" },
    ],
    labels: {
      policyTitle: "ນະໂຍບາຍສ່ວນຫຼຸດຕາມລະດັບ",
      policyDescription: "ຍົກລະດັບເພື່ອຮັບສິດທີ່ສູງຂຶ້ນ.",
      discount: "ສ່ວນຫຼຸດ",
      salesRequirement: "ຍອດຂາຍທີ່ຕ້ອງການ",
      otherBenefits: "ສິດອື່ນ",
      breadcrumb: "ເສັ້ນທາງ",
      home: "ໜ້າຫຼັກ",
      offers: "ໂປຣໂມຊັນ",
      heroLine1: "ສິດປະໂຫຍດໜ້າສົນໃຈ",
      heroLine2: "– ຊ່ວຍໃຫ້ທ່ານ",
      heroAccent: "ເຕີບໂຕ",
      heroDescription:
        "ນະໂຍບາຍທີ່ແຂ່ງຂັນ, ໂປ່ງໃສ ແລະ ຍືດຫຍຸ່ນ ຊ່ວຍໃຫ້ຄູ່ຮ່ວມງານເຕີບໂຕ.",
      visualAria: "ຮູບການເຕີບໂຕທຸລະກິດ eSIM",
      visualLabel: "ເຊື່ອມຕໍ່ທົ່ວໂລກ ແລະ ເຕີບໂຕກັບ YSim",
      highlightsAria: "ຈຸດເດັ່ນຂອງໂຄງການ",
      maxDiscount: "ສ່ວນຫຼຸດສູງສຸດ",
      partnerTierNote: "ຕາມລະດັບຄູ່ຮ່ວມງານ",
      salesReward: "ລາງວັນຍອດຂາຍ",
      salesRewardDescription: "ລາງວັນທີ່ໜ້າສົນໃຈ",
      fastSettlement: "ຊຳລະໄວ",
      flexibleSupport: "ຊ່ວຍເຫຼືອຍືດຫຍຸ່ນ",
      tabsAria: "ເນື້ອຫາໂຄງການຄູ່ຮ່ວມງານ",
      contact: "ສົນທະນາກ່ຽວກັບໂຄງການ",
    },
  },
} as const satisfies Readonly<Record<ShellLocale, OffersPartnerCopy>>;

export function createOffersPartnerCopy(
  localeInput: unknown,
): OffersPartnerCopy {
  return OFFERS_PARTNER_COPY[normalizeShellLocale(localeInput)];
}
