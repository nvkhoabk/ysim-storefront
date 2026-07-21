import {
  CheckCircle2,
  CircleAlert,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

import type {
  DeviceCompatibilityStatus,
  DeviceCompatibilityViewModel,
} from "@/types/view-models/support";

import {
  cn,
} from "@/lib/ui/cn";

const iconMap:
  Record<
    DeviceCompatibilityStatus,
    LucideIcon
  > = {
    supported:
      CheckCircle2,

    conditional:
      HelpCircle,

    unsupported:
      CircleAlert,
  };

const classMap:
  Record<
    DeviceCompatibilityStatus,
    string
  > = {
    supported:
      "border-emerald-200 bg-emerald-50 text-emerald-950",

    conditional:
      "border-amber-200 bg-amber-50 text-amber-950",

    unsupported:
      "border-red-200 bg-red-50 text-red-950",
  };

export interface CompatibilityResultCardProps {
  device:
    DeviceCompatibilityViewModel;
}

export function CompatibilityResultCard({
  device,
}: CompatibilityResultCardProps) {
  const Icon =
    iconMap[
      device.status
    ];

  return (
    <article
      aria-live="polite"
      className={cn(
        "rounded-[var(--ysim-radius-xl)] border p-5 sm:p-6",
        classMap[
          device.status
        ],
      )}
    >
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/75">
          <Icon className="h-6 w-6" />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.1em] opacity-65">
            {
              device.brand
            }
          </p>

          <h3 className="mt-1 text-xl font-bold">
            {
              device.model
            }
          </h3>

          <p className="mt-3 inline-flex rounded-[var(--ysim-radius-pill)] bg-white/75 px-3 py-1 text-xs font-bold">
            {
              device.statusLabel
            }
          </p>

          <p className="mt-4 text-sm leading-relaxed opacity-80">
            {
              device.description
            }
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2 border-t border-current/15 pt-4 text-sm leading-relaxed">
        {device.notes.map(
          (note) => (
            <li
              key={
                note
              }
              className="flex gap-2"
            >
              <span aria-hidden="true">
                •
              </span>

              <span>
                {note}
              </span>
            </li>
          ),
        )}
      </ul>
    </article>
  );
}
