import Image from "next/image";
import {
  Bolt,
  Globe2,
  Headphones,
  Plane,
  Search,
  Smartphone,
  Users,
} from "lucide-react";

const benefits = [
  {
    icon: Globe2,
    title: "200+",
    description: "Quốc gia và vùng lãnh thổ",
  },
  {
    icon: Bolt,
    title: "1 phút",
    description: "Kích hoạt siêu nhanh",
  },
  {
    icon: Smartphone,
    title: "Không cần",
    description: "Thay SIM vật lý",
  },
  {
    icon: Headphones,
    title: "24/7",
    description: "Hỗ trợ tiếng Việt",
  },
];

const popularSearches = [
  "🇯🇵 Nhật Bản",
  "🇰🇷 Hàn Quốc",
  "🇹🇭 Thái Lan",
  "🇸🇬 Singapore",
  "🇪🇺 Châu Âu",
  "🇺🇸 Mỹ",
  "🌐 Toàn cầu",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Ảnh nền desktop */}
      <div className="absolute inset-0 hidden lg:block">
        <Image
          src="/images/hero/ysim-home-hero.png"
          alt="Du khách sử dụng eSIM YSim tại Nhật Bản"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-6 pb-12 lg:px-8 lg:pt-12 lg:pb-24">
        {/* Ảnh riêng mobile và tablet */}
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:hidden">
          <Image
            src="/images/hero/ysim-home-hero.png"
            alt="Du lịch Nhật Bản cùng YSim"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_center]"
          />
        </div>

        <div className="grid min-h-[560px] items-center sm:min-h-[520px] lg:min-h-[390px] lg:grid-cols-[48%_52%]">
          <div className="relative z-10 py-4">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-green-800 shadow-sm">
              <Plane className="h-4 w-4" />
              eSIM du lịch quốc tế
            </div>

            <h1 className="max-w-2xl text-[38px] leading-[1.08] font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[56px]">
              Internet sẵn sàng
              <br />
              ngay khi bạn <span className="text-green-700">hạ cánh</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 lg:text-lg">
              eSIM du lịch giúp bạn kết nối Internet nhanh chóng, ổn định và
              thuận tiện tại hơn 200 quốc gia và vùng lãnh thổ.
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 h-6 w-6 shrink-0 text-green-700" />

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {benefit.title}
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-slate-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xl lg:-mb-20 lg:p-6">
          <div className="mb-5 flex items-center gap-8 border-b border-slate-200">
            <button
              type="button"
              className="flex items-center gap-2 border-b-2 border-green-700 px-2 pb-4 text-sm font-semibold text-green-700"
            >
              <Search className="h-4 w-4" />
              Tìm eSIM phù hợp
            </button>

            <button
              type="button"
              className="flex items-center gap-2 px-2 pb-4 text-sm font-medium text-slate-600"
            >
              <Smartphone className="h-4 w-4" />
              Kiểm tra thiết bị
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_0.8fr_1.15fr]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-800">
                Bạn sẽ đi đâu?
              </span>

              <div className="flex h-12 items-center rounded-xl border border-slate-300 px-4 transition focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100">
                <input
                  type="text"
                  placeholder="Nhập quốc gia, thành phố hoặc khu vực"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />

                <Search className="h-5 w-5 shrink-0 text-slate-500" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-800">
                Ngày đi
              </span>

              <input
                type="date"
                className="h-12 w-full rounded-xl border border-slate-300 px-3 text-sm transition outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-800">
                Ngày về
              </span>

              <input
                type="date"
                className="h-12 w-full rounded-xl border border-slate-300 px-3 text-sm transition outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-800">
                Số lượng eSIM
              </span>

              <div className="relative">
                <Users className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <select className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white pr-3 pl-10 text-sm transition outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                className="h-12 w-full rounded-xl bg-green-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:outline-none"
              >
                Tìm eSIM phù hợp →
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-semibold text-slate-700">
              Tìm kiếm phổ biến:
            </span>

            {popularSearches.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm transition hover:border-green-300 hover:text-green-700"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
