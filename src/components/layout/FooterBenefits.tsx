import {
  Clock3,
  Globe2,
  Headphones,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface FooterBenefitItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

const footerBenefits: FooterBenefitItem[] = [
  {
    title: "Kích hoạt tức thì",
    description:
      "Nhận eSIM và kết nối chỉ trong vài phút.",
    icon: Clock3,
  },
  {
    title: "Phủ sóng toàn cầu",
    description:
      "Hơn 200 quốc gia và vùng lãnh thổ.",
    icon: Globe2,
  },
  {
    title: "Kết nối an toàn",
    description:
      "Hạ tầng bảo mật cao, bảo vệ dữ liệu tuyệt đối.",
    icon: ShieldCheck,
  },
  {
    title: "Hỗ trợ 24/7",
    description:
      "Đội ngũ chuyên nghiệp luôn sẵn sàng hỗ trợ.",
    icon: Headphones,
  },
];

export function FooterBenefits() {
  return (
    <section className="bg-white px-5 pb-6 pt-2 sm:px-6 lg:px-8">
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          grid-cols-2
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
          lg:grid-cols-4
        "
      >
        {footerBenefits.map((benefit, index) => {
          const Icon = benefit.icon;

          return (
            <article
              key={benefit.title}
              className={`
                relative
                flex
                min-h-[84px]
                items-center
                gap-3
                px-4
                py-3
                sm:gap-4
                sm:px-5
                lg:min-h-[92px]
                lg:px-6
                ${
                  index % 2 === 0
                    ? "border-r border-slate-200"
                    : ""
                }
                ${
                  index < 2
                    ? "border-b border-slate-200 lg:border-b-0"
                    : ""
                }
                ${
                  index > 0
                    ? "lg:border-l lg:border-slate-200"
                    : ""
                }
                lg:border-r-0
              `}
            >
              <span
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-transparent
                  text-green-700
                  sm:h-10
                  sm:w-10
                "
              >
                <Icon
                  aria-hidden="true"
                  className="h-7 w-7 sm:h-10 sm:w-10"
                  strokeWidth={1.7}
                />
              </span>

              <div className="min-w-0">
                <h2 className="text-[14px] font-bold leading-5 text-slate-950 sm:text-[15px] leading-5">
                  {benefit.title}
                </h2>

                <p className="mt-1 text-[11px] leading-4 text-slate-600 sm:text-[11px] sm:leading-4">
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