import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { popularDestinations, type DestinationItem } from "@/data/destinations";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price);
}

function DestinationCard({ destination }: { destination: DestinationItem }) {
  return (
    <Link
      href={`/esim?destination=${encodeURIComponent(destination.slug)}`}
      aria-label={`Xem các gói eSIM ${destination.name}`}
      className="group relative block h-[146px] w-[164px] shrink-0 snap-start overflow-hidden rounded-lg bg-slate-100 shadow-sm ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:outline-none lg:h-[146px] lg:w-auto lg:min-w-0 lg:shrink"
    >
      <Image
        src={destination.image}
        alt={`Điểm đến eSIM ${destination.name}`}
        fill
        sizes="
          (max-width: 1279px) 164px,
          13vw
        "
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      {destination.featured ? (
        <span className="absolute top-2 right-2 rounded-full bg-green-700 px-2 py-1 text-[9px] leading-none font-semibold text-white shadow-sm">
          Phổ biến
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            aria-hidden="true"
            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-white/95 px-1 text-[9px] font-bold text-slate-700 uppercase shadow-sm"
          >
            {destination.id === "global" ? "🌐" : destination.id.toUpperCase()}
          </span>

          <h3 className="truncate text-[13px] leading-5 font-bold text-white drop-shadow-sm">
            {destination.name}
          </h3>
        </div>

        <p className="mt-0.5 text-[10px] leading-4 font-semibold text-white drop-shadow-sm">
          Từ {formatPrice(destination.priceFrom)}đ
        </p>
      </div>
    </Link>
  );
}

export function PopularDestinations() {
  return (
    <section className="bg-white px-5 pt-6 pb-4 sm:px-6 lg:px-8">
      <div className="max-w-7lg mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[17px] leading-6 font-bold text-slate-950 sm:text-lg">
            Điểm đến phổ biến
          </h2>

          <Link
            href="/destinations"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-700 transition hover:text-green-700 sm:text-xs"
          >
            Xem tất cả
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="-mx-5 mt-3 [scrollbar-width:none] overflow-x-auto px-5 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-3 lg:grid lg:grid-cols-8 lg:gap-3">
            {popularDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
