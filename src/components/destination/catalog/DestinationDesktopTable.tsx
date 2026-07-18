import type { ReactNode } from "react";

import type {
  DestinationCatalogItem,
} from "./types";

import {
  DestinationDesktopRow,
} from "./DestinationDesktopRow";

export interface DestinationDesktopTableProps {
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

export function DestinationDesktopTable({
  items,
  renderFlag,
  emptyTitle = "Chưa tìm thấy điểm đến",
  emptyDescription =
    "Hãy thử thay đổi từ khóa hoặc bộ lọc để xem thêm kết quả.",
  className,
}: DestinationDesktopTableProps) {
  return (
    <section
      aria-label="Danh sách điểm đến eSIM"
      className={joinClasses(
        "hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[1020px]">
          <div
            role="row"
            className="sticky top-0 z-10 grid items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4"
            style={{
              gridTemplateColumns:
                "260px 140px 160px 220px 120px 56px",
            }}
          >
            <div
              role="columnheader"
              className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500"
            >
              Điểm đến
            </div>

            <div
              role="columnheader"
              className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500"
            >
              Khu vực
            </div>

            <div
              role="columnheader"
              className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500"
            >
              Thời hạn
            </div>

            <div
              role="columnheader"
              className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500"
            >
              Dung lượng
            </div>

            <div
              role="columnheader"
              className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500"
            >
              Giá từ
            </div>

            <div
              role="columnheader"
              className="text-center text-xs font-bold uppercase tracking-[0.06em] text-slate-500"
            >
              <span className="sr-only">
                Chi tiết
              </span>
            </div>
          </div>

          {items.length > 0 ? (
            <div role="rowgroup">
              {items.map((item) => (
                <DestinationDesktopRow
                  key={item.id}
                  item={item}
                  renderFlag={renderFlag}
                />
              ))}
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <h3 className="text-xl font-bold text-slate-950">
                {emptyTitle}
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                {emptyDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}