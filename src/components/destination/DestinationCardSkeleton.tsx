import {
  Skeleton,
} from "@/components/ui";

export function DestinationCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white"
    >
      <Skeleton
        shape="card"
        className="aspect-[16/10] min-h-0 rounded-none"
      />

      <div className="p-5">
        <Skeleton className="w-20" />
        <Skeleton className="mt-4 h-6 w-2/3" />
        <Skeleton className="mt-3 w-full" />
        <Skeleton className="mt-2 w-4/5" />

        <div className="mt-7 flex items-end justify-between gap-4">
          <div className="w-32">
            <Skeleton className="w-12" />
            <Skeleton className="mt-2 h-6 w-full" />
          </div>

          <Skeleton className="h-10 w-28 rounded-[var(--ysim-radius-md)]" />
        </div>
      </div>
    </div>
  );
}
