"use client";

import {
  useState,
} from "react";

import {
  DestinationProductHero,
} from "@/components/destination-products";

import type {
  DestinationProductSortValue,
} from "@/components/destination-products";

import {
  destinationProductSortOptions,
  japanDestinationProductHeroContent,
} from "@/content/destination-products/japan";

import {
  SiteContainer,
} from "@/components/layout/primitives";

export default function JapanDestinationProductsPreviewPage() {
  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const [
    sortValue,
    setSortValue,
  ] =
    useState<DestinationProductSortValue>(
      "popular",
    );

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <SiteContainer size="wide">
        <DestinationProductHero
          content={
            japanDestinationProductHeroContent
          }
          searchValue={searchValue}
          sortValue={sortValue}
          sortOptions={
            destinationProductSortOptions
          }
          onSearchChange={setSearchValue}
          onSearchSubmit={({ query }) => {
            setSearchValue(query);
          }}
          onSortChange={setSortValue}
          onOpenFilters={() => {
            console.log(
              "Open destination product filters",
            );
          }}
        />

        <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-950">
            Danh sách gói eSIM Nhật Bản
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Product Grid sẽ được bổ sung tại
            UI-04B.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-xl bg-slate-50 p-4 text-left text-sm leading-7 text-slate-600">
            <p>
              Tìm kiếm:{" "}
              <strong className="text-slate-900">
                {searchValue || "—"}
              </strong>
            </p>

            <p>
              Sắp xếp:{" "}
              <strong className="text-slate-900">
                {sortValue}
              </strong>
            </p>
          </div>
        </section>
      </SiteContainer>
    </main>
  );
}