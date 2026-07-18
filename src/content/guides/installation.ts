export interface InstallationGuideStep {
  id: number;

  title: string;

  description: string;

  image: string;

  imageAlt: string;
}

export const installationGuideSteps: InstallationGuideStep[] = [
  {
    id: 1,
    title: "Mua eSIM",
    description:
      "Chọn điểm đến, gói dữ liệu phù hợp và hoàn tất thanh toán.",
    image: "/images/guides/step-1.jpg",
    imageAlt:
      "Giao diện lựa chọn và thanh toán gói eSIM",
  },
  {
    id: 2,
    title: "Nhận eSIM",
    description:
      "Bạn sẽ nhận eSIM qua email kèm mã QR hoặc hướng dẫn cài đặt.",
    image: "/images/guides/step-2.jpg",
    imageAlt:
      "Mã QR eSIM được gửi qua email",
  },
  {
    id: 3,
    title: "Cài đặt & sử dụng",
    description:
      "Quét mã QR và làm theo hướng dẫn để kích hoạt eSIM. Bật dữ liệu di động và tận hưởng kết nối ngay!",
    image: "/images/guides/step-3.jpg",
    imageAlt:
      "Bật dữ liệu di động và sử dụng eSIM",
  },
];