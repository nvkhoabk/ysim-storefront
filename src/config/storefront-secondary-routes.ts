import type {
  PolicyKey,
  PolicyPageViewModel,
} from "@/types/view-models/secondary-routes";

export const secondaryLocale =
  process.env.YSIM_SECONDARY_LOCALE?.trim() || "vi";

export const secondaryProductLimit =
  Math.max(1, Math.min(100, Number(
    process.env.YSIM_SECONDARY_PRODUCT_LIMIT || 100,
  )));

export const offersProductLimit =
  Math.max(1, Math.min(48, Number(
    process.env.YSIM_OFFERS_PRODUCT_LIMIT || 24,
  )));

export const policySlug:
  Readonly<Record<PolicyKey, string>> = {
    terms:
      process.env.YSIM_POLICY_TERMS_SLUG?.trim() || "terms",
    "privacy-policy":
      process.env.YSIM_POLICY_PRIVACY_SLUG?.trim() || "privacy-policy",
    "refund-policy":
      process.env.YSIM_POLICY_REFUND_SLUG?.trim() || "refund-policy",
  };

export const fallbackPolicy:
  Readonly<Record<PolicyKey, PolicyPageViewModel>> = {
    terms: {
      key: "terms",
      title: "Điều khoản sử dụng",
      description: "Điều kiện áp dụng khi sử dụng dịch vụ YSim.",
      source: "fallback",
      requiresLegalReview: true,
      fallbackParagraphs: [
        "YSim cung cấp nền tảng mua và nhận thông tin cài đặt eSIM du lịch.",
        "Khách hàng cần kiểm tra thiết bị hỗ trợ eSIM và không bị khóa mạng.",
        "Nội dung này là fallback để review UI và chưa phải văn bản pháp lý chính thức.",
      ],
    },
    "privacy-policy": {
      key: "privacy-policy",
      title: "Chính sách riêng tư",
      description: "Cách YSim xử lý và bảo vệ dữ liệu cá nhân.",
      source: "fallback",
      requiresLegalReview: true,
      fallbackParagraphs: [
        "Dữ liệu có thể gồm thông tin liên hệ, đơn hàng và người nhận eSIM.",
        "Dữ liệu được dùng để xử lý đơn hàng, hỗ trợ và chống gian lận.",
        "Nội dung này cần được phê duyệt trước production.",
      ],
    },
    "refund-policy": {
      key: "refund-policy",
      title: "Chính sách hoàn tiền",
      description: "Nguyên tắc xem xét và xử lý yêu cầu hoàn tiền.",
      source: "fallback",
      requiresLegalReview: true,
      fallbackParagraphs: [
        "Yêu cầu hoàn tiền phụ thuộc trạng thái kích hoạt và sử dụng của eSIM.",
        "Khách hàng cần cung cấp mã đơn và bằng chứng kỹ thuật liên quan.",
        "Nội dung này chưa phải chính sách hoàn tiền chính thức.",
      ],
    },
  };
