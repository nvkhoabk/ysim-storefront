"use client";

import {
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Search,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  SecondaryProductViewModel,
} from "@/types/view-models/secondary-routes";

export function SecondaryProductGrid({
  products,
  searchable = true,
}: {
  products: readonly SecondaryProductViewModel[];
  searchable?: boolean;
}) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return products;

    return products.filter((product) =>
      `${product.name} ${product.destination || ""}`
        .toLowerCase()
        .includes(value)
    );
  }, [products, query]);

  return (
    <>
      {searchable ? (
        <label className="relative mb-6 block max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ysim-color-text-soft)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm điểm đến hoặc gói eSIM"
            className="min-h-12 w-full rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border-strong)] bg-white pl-12 pr-4 text-sm font-semibold"
          />
        </label>
      ) : null}

      {visible.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <Link
              key={product.id}
              href={product.href}
              className="group overflow-hidden rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white shadow-[var(--ysim-shadow-sm)] transition hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] bg-[var(--ysim-color-surface-subtle)]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 25vw, 50vw"
                  className="object-cover"
                />
                {product.onSale ? (
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--ysim-color-brand-700)] px-3 py-1 text-xs font-bold text-white">
                    Ưu đãi
                  </span>
                ) : null}
              </div>

              <div className="p-5">
                {product.destination ? (
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-brand-700)]">
                    {product.destination}
                  </p>
                ) : null}

                <h2 className="mt-2 line-clamp-2 font-bold text-[var(--ysim-color-text)]">
                  {product.name}
                </h2>

                <div className="mt-4">
                  <Price
                    amount={product.price}
                    originalAmount={product.regularPrice}
                    size="compact"
                  />
                </div>

                {!product.inStock ? (
                  <p className="mt-3 text-xs font-bold text-red-700">
                    Tạm hết hàng
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--ysim-radius-xl)] border border-dashed border-[var(--ysim-color-border-strong)] p-10 text-center">
          <h2 className="text-xl font-bold">Không có kết quả</h2>
        </div>
      )}
    </>
  );
}
