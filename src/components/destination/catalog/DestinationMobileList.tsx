import type { ReactNode } from "react";

import type {
  DestinationCatalogItem,
} from "./types";

import {
  DestinationMobileCard,
} from "./DestinationMobileCard";

export interface DestinationMobileListProps {
  items: DestinationCatalogItem[];

  renderFlag?: (
    countryCode: string,
  ) => ReactNode;

  emptyTitle?: string;

  emptyDescription?: string;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function DestinationMobileList({
  items,
  renderFlag,
  emptyTitle = "Chưa tìm thấy điểm đến",
  emptyDescription =
    "Hãy thử thay đổi từ khóa hoặc bộ lọc để xem thêm kết quả.",
  className,
}: DestinationMobileListProps) {
  return (
    <section
      aria-label="Danh sách điểm đến eSIM"
      className={joinClasses(
        "lg:hidden",
        className,
      )}
    >
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <DestinationMobileCard
              key={item.id}
              item={item}
              renderFlag={renderFlag}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h3 className="text-xl font-bold text-slate-950">
            {emptyTitle}
          </h3>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            {emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}