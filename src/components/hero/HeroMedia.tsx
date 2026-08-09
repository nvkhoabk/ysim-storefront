"use client";

import Image from "next/image";

import { MapPin, Plane, Smartphone, Wifi } from "lucide-react";

import type { HeroMediaViewModel } from "@/types/view-models/hero";

import { cn } from "@/lib/ui/cn";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createShellTranslator } from "@/i18n/shell/shell.registry";

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
  const { locale } = useStorefrontLocale();
  const t = createShellTranslator(locale);
  if (media?.imageUrl) {
    return (
      <div
        className={cn(
          "relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-[var(--ysim-radius-xl)] border border-white/65 bg-white shadow-[var(--ysim-shadow-md)]",
          className,
        )}
      >
        <Image
          src={media.imageUrl}
          alt={media.alt || ""}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 44vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={media?.alt || t("heroMedia.fallbackAlt")}
      role="img"
      className={cn(
        "relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-[var(--ysim-radius-xl)] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,var(--ysim-color-brand-50)_55%,var(--ysim-color-brand-100)_100%)] shadow-[var(--ysim-shadow-md)]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
        <span className="rounded-[var(--ysim-radius-pill)] bg-white/90 px-3 py-1.5 text-xs font-bold tracking-[0.1em] text-[var(--ysim-color-brand-800)] uppercase shadow-[var(--ysim-shadow-sm)]">
          {media?.eyebrow || t("heroMedia.eyebrow")}
        </span>

        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ysim-color-brand-700)] text-white">
          <Plane aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>

      <div className="absolute top-[30%] left-[8%] rounded-[var(--ysim-radius-lg)] bg-white p-4 shadow-[var(--ysim-shadow-md)]">
        <MapPin className="h-8 w-8 text-[var(--ysim-color-brand-700)]" />
      </div>

      <div className="absolute bottom-[10%] left-[14%] rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-[var(--ysim-color-brand-900)] shadow-[var(--ysim-shadow-md)]">
        {t("heroMedia.coverage")}
      </div>

      <div className="absolute top-[18%] right-[10%] bottom-[8%] w-[42%] rounded-[2rem] border-[0.55rem] border-[var(--ysim-color-brand-950)] bg-white shadow-[var(--ysim-shadow-card-hover)]">
        <div className="flex h-full flex-col items-center justify-center rounded-[1.35rem] bg-[linear-gradient(180deg,var(--ysim-color-brand-50),#ffffff)] p-5 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ysim-color-brand-700)] text-white">
            <Wifi className="h-7 w-7" />
          </span>

          <strong className="mt-4 text-lg text-[var(--ysim-color-brand-950)]">
            {t("heroMedia.ready")}
          </strong>

          <span className="mt-1 text-xs text-[var(--ysim-color-text-muted)]">
            {t("heroMedia.activation")}
          </span>

          <span className="mt-5 inline-flex items-center gap-2 rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-brand-100)] px-3 py-2 text-xs font-bold text-[var(--ysim-color-brand-800)]">
            <Smartphone className="h-4 w-4" />
            {t("heroMedia.connected")}
          </span>
        </div>
      </div>

      <div className="absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-[var(--ysim-color-accent-400)]/30 blur-2xl" />
      <div className="absolute top-12 -right-20 h-52 w-52 rounded-full bg-[var(--ysim-color-brand-300)]/35 blur-3xl" />
    </div>
  );
}
