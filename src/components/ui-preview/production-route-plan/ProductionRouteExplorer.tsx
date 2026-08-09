"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Search,
} from "lucide-react";

import type {
  ProductionRoutePlanItemViewModel,
  ProductionRouteRisk,
} from "@/types/view-models/production-route-plan";

import {
  cn,
} from "@/lib/ui/cn";

import {
  ProductionRouteCard,
} from "./ProductionRouteCard";

type RiskFilter =
  | "all"
  | ProductionRouteRisk;

const riskOptions:
  readonly {
    id:
      RiskFilter;
    label: string;
  }[] = [
    {
      id:
        "all",
      label:
        "Tất cả",
    },
    {
      id:
        "low",
      label:
        "Low risk",
    },
    {
      id:
        "medium",
      label:
        "Medium risk",
    },
    {
      id:
        "high",
      label:
        "High risk",
    },
  ];

export function ProductionRouteExplorer({
  routes,
}: {
  routes:
    readonly ProductionRoutePlanItemViewModel[];
}) {
  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    risk,
    setRisk,
  ] =
    useState<RiskFilter>(
      "all",
    );

  const filtered =
    useMemo(
      () => {
        const normalized =
          query
            .trim()
            .toLowerCase();

        return routes.filter(
          (route) => {
            const matchesRisk =
              risk ===
                "all" ||
              route.risk ===
                risk;

            const haystack =
              [
                route.label,
                route.productionPath,
                route.previewPath,
                route.composition,
                route.environmentFlag,
                route.dataBoundary,
                route.readinessLabel,
                ...route.dependencies,
                ...route.acceptanceChecks,
              ]
                .join(" ")
                .toLowerCase();

            return (
              matchesRisk &&
              (
                !normalized ||
                haystack.includes(
                  normalized,
                )
              )
            );
          },
        );
      },
      [
        routes,
        query,
        risk,
      ],
    );

  return (
    <div>
      <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-4 shadow-[var(--ysim-shadow-sm)] sm:p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[var(--ysim-color-text)]">
            Tìm route hoặc dependency
          </span>

          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ysim-color-text-soft)]" />

            <input
              value={
                query
              }
              onChange={(
                event,
              ) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Ví dụ: checkout, WooCommerce, payment..."
              className="min-h-12 w-full rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white pl-10 pr-3.5 text-sm font-semibold outline-none focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[var(--ysim-color-brand-100)]"
            />
          </span>
        </label>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {riskOptions.map(
            (item) => (
              <button
                key={
                  item.id
                }
                type="button"
                aria-pressed={
                  risk ===
                  item.id
                }
                onClick={() =>
                  setRisk(
                    item.id,
                  )
                }
                className={cn(
                  "min-h-10 shrink-0 rounded-[var(--ysim-radius-pill)] border px-4 text-sm font-bold",
                  risk ===
                  item.id
                    ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-700)] text-white"
                    : "border-[var(--ysim-color-border)] bg-white text-[var(--ysim-color-text-muted)] hover:border-[var(--ysim-color-brand-300)]",
                )}
              >
                {
                  item.label
                }
              </button>
            ),
          )}
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
        {
          filtered.length
        }{" "}
        route phù hợp
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {filtered.map(
          (route) => (
            <ProductionRouteCard
              key={
                route.id
              }
              route={
                route
              }
            />
          ),
        )}
      </div>
    </div>
  );
}
