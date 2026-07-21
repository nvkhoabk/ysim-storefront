import {
  Globe2,
  Headphones,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  Container,
} from "@/components/layout";

import type {
  TrustFeatureIcon,
  TrustFeatureItem,
} from "@/config/storefront-footer";

const iconMap:
  Record<TrustFeatureIcon, LucideIcon> = {
    instant:
      Zap,

    global:
      Globe2,

    secure:
      ShieldCheck,

    support:
      Headphones,
  };

export interface TrustFeatureRowProps {
  items:
    readonly TrustFeatureItem[];
}

export function TrustFeatureRow({
  items,
}: TrustFeatureRowProps) {
  return (
    <section
      aria-label="Cam kết dịch vụ"
      className="border-y border-[var(--ysim-color-border)] bg-white"
    >
      <Container>
        <div className="grid grid-cols-1 divide-y divide-[var(--ysim-color-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          {items.map(
            (item) => {
              const Icon =
                iconMap[
                  item.icon
                ];

              return (
                <article
                  key={
                    item.title
                  }
                  className="flex items-start gap-3 px-1 py-5 sm:px-5 xl:px-6"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                    <Icon
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                  </span>

                  <span>
                    <strong className="block text-sm font-bold text-[var(--ysim-color-text)]">
                      {
                        item.title
                      }
                    </strong>

                    <span className="mt-1 block text-xs leading-relaxed text-[var(--ysim-color-text-muted)]">
                      {
                        item.description
                      }
                    </span>
                  </span>
                </article>
              );
            },
          )}
        </div>
      </Container>
    </section>
  );
}
