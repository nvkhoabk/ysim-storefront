import {
  Skeleton,
} from "@/components/ui";

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white md:flex">
      <Skeleton
        shape="card"
        className="aspect-[16/10] min-h-0 rounded-none md:aspect-auto md:w-[42%]"
      />

      <div className="flex-1 p-5 sm:p-6">
        <Skeleton className="w-24" />
        <Skeleton className="mt-4 h-6 w-3/4" />

        <div className="mt-5 flex gap-2">
          <Skeleton className="h-8 w-24 rounded-[var(--ysim-radius-pill)]" />
          <Skeleton className="h-8 w-24 rounded-[var(--ysim-radius-pill)]" />
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div className="w-36">
            <Skeleton className="w-16" />
            <Skeleton className="mt-2 h-7 w-full" />
          </div>

          <Skeleton className="h-11 w-32 rounded-[var(--ysim-radius-md)]" />
        </div>
      </div>
    </div>
  );
}
