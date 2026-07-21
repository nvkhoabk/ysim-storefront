import Image from "next/image";

import {
  MapPin,
  Plane,
  Smartphone,
  Wifi,
} from "lucide-react";

import type {
  HeroMediaViewModel,
} from "@/types/view-models/hero";

import {
  cn,
} from "@/lib/ui/cn";

export interface HeroMediaProps {
  media?: HeroMediaViewModel;
  className?: string;
  priority?: boolean;
}

export function HeroMedia({
  media,
  className,
  priority = false,
}: HeroMediaProps) {
  if (
    media?.imageUrl
  ) {
    return (
      <div
        className={cn(
          "relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-[var(--ysim-radius-xl)] border border-white/65 bg-white shadow-[var(--ysim-shadow-md)]",
          className,
        )}
      >
        <Image
          src={
            media.imageUrl
          }
          alt={
            media.alt || ""
          }
          fill
          priority={
            priority
          }
          sizes="(max-width: 1024px) 100vw, 44vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={
        media?.alt ||
        "Minh họa du lịch và kết nối eSIM"
      }
      role="img"
      className={cn(
        "relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-[var(--ysim-radius-xl)] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,var(--ysim-color-brand-50)_55%,var(--ysim-color-brand-100)_100%)] shadow-[var(--ysim-shadow-md)]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
        <span className="rounded-[var(--ysim-radius-pill)] bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-800)] shadow-[var(--ysim-shadow-sm)]">
          {media?.eyebrow ||
            "Travel connected"}
        </span>

        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ysim-color-brand-700)] text-white">
          <Plane
            aria-hidden="true"
            className="h-5 w-5"
          />
        </span>
      </div>

      <div className="absolute left-[8%] top-[30%] rounded-[var(--ysim-radius-lg)] bg-white p-4 shadow-[var(--ysim-shadow-md)]">
        <MapPin className="h-8 w-8 text-[var(--ysim-color-brand-700)]" />
      </div>

      <div className="absolute bottom-[10%] left-[14%] rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-[var(--ysim-color-brand-900)] shadow-[var(--ysim-shadow-md)]">
        200+ quốc gia
      </div>

      <div className="absolute bottom-[8%] right-[10%] top-[18%] w-[42%] rounded-[2rem] border-[0.55rem] border-[var(--ysim-color-brand-950)] bg-white shadow-[var(--ysim-shadow-card-hover)]">
        <div className="flex h-full flex-col items-center justify-center rounded-[1.35rem] bg-[linear-gradient(180deg,var(--ysim-color-brand-50),#ffffff)] p-5 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ysim-color-brand-700)] text-white">
            <Wifi className="h-7 w-7" />
          </span>

          <strong className="mt-4 text-lg text-[var(--ysim-color-brand-950)]">
            eSIM sẵn sàng
          </strong>

          <span className="mt-1 text-xs text-[var(--ysim-color-text-muted)]">
            Kích hoạt trong vài phút
          </span>

          <span className="mt-5 inline-flex items-center gap-2 rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-brand-100)] px-3 py-2 text-xs font-bold text-[var(--ysim-color-brand-800)]">
            <Smartphone className="h-4 w-4" />
            Đã kết nối
          </span>
        </div>
      </div>

      <div className="absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-[var(--ysim-color-accent-400)]/30 blur-2xl" />
      <div className="absolute -right-20 top-12 h-52 w-52 rounded-full bg-[var(--ysim-color-brand-300)]/35 blur-3xl" />
    </div>
  );
}
