import {
  CheckCircle2,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import type {
  ContentCalloutTone,
  ContentCalloutViewModel,
} from "@/types/view-models/content";

import {
  cn,
} from "@/lib/ui/cn";

const toneIcon:
  Record<ContentCalloutTone, LucideIcon> = {
    info:
      Info,

    success:
      CheckCircle2,

    warning:
      TriangleAlert,
  };

const toneClasses:
  Record<ContentCalloutTone, string> = {
    info:
      "border-[var(--ysim-color-brand-200)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-900)]",

    success:
      "border-[var(--ysim-color-brand-300)] bg-[var(--ysim-color-surface-highlighted)] text-[var(--ysim-color-brand-900)]",

    warning:
      "border-amber-200 bg-[var(--ysim-color-warning-soft)] text-amber-950",
  };

export interface ContentCalloutProps {
  callout:
    ContentCalloutViewModel;
  className?: string;
}

export function ContentCallout({
  callout,
  className,
}: ContentCalloutProps) {
  const tone =
    callout.tone ||
    "info";

  const Icon =
    toneIcon[tone];

  return (
    <aside
      className={cn(
        "flex items-start gap-4 rounded-[var(--ysim-radius-xl)] border p-5 sm:p-6",
        toneClasses[
          tone
        ],
        className,
      )}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ysim-radius-md)] bg-white/70">
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <h2 className="font-bold">
          {callout.title}
        </h2>

        <p className="mt-1 text-sm leading-relaxed opacity-80">
          {
            callout.description
          }
        </p>
      </div>
    </aside>
  );
}
