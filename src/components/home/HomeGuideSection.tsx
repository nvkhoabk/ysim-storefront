import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Mail,
  QrCode,
  Smartphone,
  Wifi,
  type LucideIcon,
} from "lucide-react";

interface GuideStep {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

const guideSteps: GuideStep[] = [
  {
    number: 1,
    title: "Chọn điểm đến",
    description:
      "Tìm quốc gia hoặc khu vực bạn sắp đến.",
    icon: Globe2,
  },
  {
    number: 2,
    title: "Mua và nhận eSIM",
    description:
      "Thanh toán nhanh chóng, nhận eSIM qua email.",
    icon: Mail,
  },
  {
    number: 3,
    title: "Kích hoạt và kết nối",
    description:
      "Quét mã QR, bật eSIM và sử dụng ngay.",
    icon: Wifi,
  },
];

function GuideStepItem({
  step,
  isLast,
}: {
  step: GuideStep;
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <article className="relative flex min-w-0 flex-1 items-start gap-3">
      <div className="relative shrink-0">
        <span
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-green-700
            text-xs
            font-bold
            text-white
            shadow-sm
          "
        >
          {step.number}
        </span>

        <span
          className="
            absolute
            left-1/2
            top-10
            hidden
            -translate-x-1/2
            items-center
            justify-center
            text-green-700
            sm:flex
          "
        >
          <Icon
            aria-hidden="true"
            className="h-7 w-7"
            strokeWidth={1.7}
          />
        </span>
      </div>

      <div className="min-w-0 pb-1">
        <h3 className="text-[13px] font-bold leading-5 text-slate-950">
          {step.title}
        </h3>

        <p className="mt-0.5 max-w-[190px] text-[10px] leading-4 text-slate-600">
          {step.description}
        </p>
      </div>

      {!isLast ? (
        <div
          aria-hidden="true"
          className="
            ml-auto
            hidden
            h-full
            shrink-0
            items-center
            px-1
            text-slate-300
            md:flex
          "
        >
          <ArrowRight className="h-5 w-5" />
        </div>
      ) : null}
    </article>
  );
}

function HowYSimWorks() {
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
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[17px] font-bold leading-6 text-slate-950">
          Cách sử dụng YSim
        </h2>

        <Link
          href="/guides"
          className="
            hidden
            items-center
            gap-1
            text-[11px]
            font-medium
            text-slate-600
            transition
            hover:text-green-700
            sm:inline-flex
          "
        >
          Xem hướng dẫn chi tiết
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        className="
          mt-3
          grid
          gap-4
          sm:grid-cols-3
          sm:gap-3
        "
      >
        {guideSteps.map((step, index) => (
          <GuideStepItem
            key={step.number}
            step={step}
            isLast={
              index === guideSteps.length - 1
            }
          />
        ))}
      </div>

      <Link
        href="/guides"
        className="
          mt-3
          inline-flex
          items-center
          gap-1
          text-xs
          font-semibold
          text-green-700
          sm:hidden
        "
      >
        Xem hướng dẫn chi tiết
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

function DeviceCheckCard() {
  return (
    <section
      className="
        relative
        min-h-[146px]
        overflow-hidden
        rounded-xl
        border
        border-green-100
        bg-gradient-to-br
        from-white
        via-white
        to-green-50
        p-4
        shadow-sm
        sm:p-5
      "
    >
      <div className="relative z-10 max-w-[190px]">
        <h2 className="text-[17px] font-bold leading-6 text-slate-950">
          Kiểm tra thiết bị của bạn
        </h2>

        <p className="mt-1.5 text-[10px] leading-4 text-slate-600">
          Xem điện thoại của bạn có hỗ trợ eSIM hay không trước
          khi mua.
        </p>

        <Link
          href="/device-check"
          className="
            mt-3.5
            inline-flex
            h-9
            items-center
            gap-1.5
            rounded-lg
            border
            border-green-200
            bg-white
            px-3.5
            text-xs
            font-semibold
            text-green-700
            shadow-sm
            transition
            hover:border-green-700
            hover:bg-green-700
            hover:text-white
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-600
            focus-visible:ring-offset-2
          "
        >
          Kiểm tra ngay
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        aria-hidden="true"
        className="
          absolute
          bottom-2
          right-3
          hidden
          h-[120px]
          w-[112px]
          sm:block
        "
      >
        <div
          className="
            absolute
            bottom-0
            right-0
            flex
            h-[102px]
            w-[58px]
            items-center
            justify-center
            rounded-[16px]
            border-[3px]
            border-slate-500
            bg-white
            shadow-lg
          "
        >
          <span className="absolute top-1.5 h-1.5 w-4 rounded-full bg-slate-400" />

          <Smartphone className="h-6 w-6 text-green-700" />
        </div>

        <div
          className="
            absolute
            bottom-5
            left-0
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            border
            border-green-200
            bg-white
            shadow-md
          "
        >
          <CheckCircle2 className="h-7 w-7 fill-green-50 text-green-700" />
        </div>

        <QrCode
          className="
            absolute
            right-[-2px]
            top-0
            h-8
            w-8
            rounded-md
            bg-white
            p-1
            text-green-700
            shadow-sm
          "
        />
      </div>

      <div
        aria-hidden="true"
        className="
          absolute
          -bottom-8
          -right-8
          h-28
          w-28
          rounded-full
          bg-green-100/70
          blur-2xl
        "
      />
    </section>
  );
}

export function HomeGuideSection() {
  return (
    <section className="bg-white px-5 pb-4 pt-0 sm:px-6 lg:px-8">
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          items-stretch
          gap-3
          lg:grid-cols-[minmax(0,1fr)_300px]
        "
      >
        <HowYSimWorks />
        <DeviceCheckCard />
      </div>
    </section>
  );
}