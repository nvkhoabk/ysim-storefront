import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
} from "lucide-react";

import {
  travelGuides,
  type TravelGuideItem,
} from "@/data/travel-guides";

function TravelGuideCard({
  guide,
}: {
  guide: TravelGuideItem;
}) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      aria-label={`Đọc bài viết: ${guide.title}`}
      className="
        group
        flex
        h-[136px]
        w-[310px]
        shrink-0
        snap-start
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        p-3
        shadow-sm
        transition
        duration-300
        hover:-translate-y-0.5
        hover:border-green-200
        hover:shadow-md
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-green-600
        focus-visible:ring-offset-2
        lg:w-auto
        lg:min-w-0
        lg:shrink
      "
    >
      <div
        className="
          relative
          h-full
          w-[104px]
          shrink-0
          overflow-hidden
          rounded-lg
          bg-slate-100
        "
      >
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          sizes="104px"
          className="
            object-cover
            transition
            duration-500
            group-hover:scale-105
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col pl-3">
        <span
          className="
            w-fit
            rounded-full
            bg-green-50
            px-2
            py-0.5
            text-[9px]
            font-semibold
            leading-4
            text-green-700
          "
        >
          {guide.category}
        </span>

        <h3
          className="
            mt-1.5
            line-clamp-2
            text-[12px]
            font-bold
            leading-4
            text-slate-950
          "
        >
          {guide.title}
        </h3>

        <p
          className="
            mt-1
            line-clamp-2
            text-[10px]
            leading-4
            text-slate-600
          "
        >
          {guide.excerpt}
        </p>

        <span
          className="
            mt-auto
            inline-flex
            items-center
            gap-1
            text-[10px]
            font-semibold
            text-green-700
          "
        >
          Đọc thêm
          <ArrowRight
            aria-hidden="true"
            className="
              h-3
              w-3
              transition-transform
              group-hover:translate-x-0.5
            "
          />
        </span>
      </div>
    </Link>
  );
}

export function TravelGuidesSection() {
  return (
    <section className="bg-white px-5 pb-4 pt-0 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-green-50
                text-green-700
              "
            >
              <BookOpen className="h-[18px] w-[18px]" />
            </span>

            <h2 className="text-[17px] font-bold leading-6 text-slate-950">
              Cẩm nang du lịch
            </h2>
          </div>

          <Link
            href="/guides"
            className="
              inline-flex
              shrink-0
              items-center
              gap-1
              text-[11px]
              font-medium
              text-slate-600
              transition
              hover:text-green-700
            "
          >
            Xem tất cả
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div
          className="
            -mx-5
            overflow-x-auto
            px-5
            pb-2
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
            sm:-mx-6
            sm:px-6
            lg:mx-0
            lg:overflow-visible
            lg:px-0
            lg:pb-0
          "
        >
          <div
            className="
              flex
              snap-x
              snap-mandatory
              gap-3
              lg:grid
              lg:grid-cols-3
            "
          >
            {travelGuides.map((guide) => (
              <TravelGuideCard
                key={guide.id}
                guide={guide}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}