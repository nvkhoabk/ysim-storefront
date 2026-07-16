import {
  Globe2,
  Headphones,
  QrCode,
  Tags,
  type LucideIcon,
} from "lucide-react";

interface BenefitItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

const benefits: BenefitItem[] = [
  {
    title: "Phủ sóng toàn cầu",
    description:
      "Kết nối tại hơn 200 quốc gia và vùng lãnh thổ.",
    icon: Globe2,
  },
  {
    title: "Giá cả minh bạch",
    description:
      "Hiển thị rõ chi phí, không phí ẩn.",
    icon: Tags,
  },
  {
    title: "Kích hoạt dễ dàng",
    description:
      "Quét mã QR và làm theo hướng dẫn đơn giản.",
    icon: QrCode,
  },
  {
    title: "Hỗ trợ 24/7",
    description:
      "Đội ngũ hỗ trợ sẵn sàng khi bạn cần.",
    icon: Headphones,
  },
];

export function WhyYSim() {
  return (
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        sm:p-5
      "
    >
      <h2 className="text-[17px] font-bold leading-6 text-slate-950">
        Vì sao chọn YSim?
      </h2>

      <div
        className="
          mt-3.5
          grid
          grid-cols-2
          gap-x-4
          gap-y-4
          lg:grid-cols-4
          lg:gap-3
        "
      >
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article
              key={benefit.title}
              className="flex min-w-0 items-start gap-2.5"
            >
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-green-50
                  text-green-700
                "
              >
                <Icon
                  aria-hidden="true"
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.8}
                />
              </span>

              <div className="min-w-0">
                <h3 className="text-[12px] font-bold leading-4 text-slate-950">
                  {benefit.title}
                </h3>

                <p className="mt-0.5 text-[10px] leading-4 text-slate-600">
                  {benefit.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}