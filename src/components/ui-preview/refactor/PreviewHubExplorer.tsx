"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Search,
} from "lucide-react";

import type {
  PreviewPackagePhase,
  PreviewPackageViewModel,
  PreviewPhaseOptionViewModel,
} from "@/types/view-models/ui-preview-registry";

import {
  cn,
} from "@/lib/ui/cn";

import {
  PreviewPackageCard,
} from "./PreviewPackageCard";

export function PreviewHubExplorer({
  packages,
  phases,
}: {
  packages:
    readonly PreviewPackageViewModel[];
  phases:
    readonly PreviewPhaseOptionViewModel[];
}) {
  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    phase,
    setPhase,
  ] =
    useState<
      | "all"
      | PreviewPackagePhase
    >(
      "all",
    );

  const filtered =
    useMemo(
      () => {
        const normalized =
          query
            .trim()
            .toLowerCase();

        return packages.filter(
          (item) => {
            const matchesPhase =
              phase ===
                "all" ||
              item.phase ===
                phase;

            const haystack =
              [
                item.title,
                item.description,
                item.phase,
                item.statusLabel,
                item.note,
                ...item.checks,
                ...item.routes.map(
                  (route) =>
                    `${route.label} ${route.href}`,
                ),
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesQuery =
              !normalized ||
              haystack.includes(
                normalized,
              );

            return (
              matchesPhase &&
              matchesQuery
            );
          },
        );
      },
      [
        packages,
        phase,
        query,
      ],
    );

  return (
    <div>
      <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-4 shadow-[var(--ysim-shadow-sm)] sm:p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[var(--ysim-color-text)]">
            Tìm package hoặc route
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
              placeholder="Ví dụ: checkout, destination, /ui-preview/..."
              className="min-h-12 w-full rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white pl-10 pr-3.5 text-sm font-semibold outline-none focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[var(--ysim-color-brand-100)]"
            />
          </span>
        </label>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {phases.map(
            (item) => (
              <button
                key={
                  item.id
                }
                type="button"
                aria-pressed={
                  phase ===
                  item.id
                }
                onClick={() =>
                  setPhase(
                    item.id,
                  )
                }
                className={cn(
                  "min-h-10 shrink-0 rounded-[var(--ysim-radius-pill)] border px-4 text-sm font-bold",
                  phase ===
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

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[var(--ysim-color-text-muted)]">
          {
            filtered.length
          }{" "}
          package phù hợp
        </p>

        {(query ||
          phase !==
            "all") ? (
          <button
            type="button"
            onClick={() => {
              setQuery(
                "",
              );

              setPhase(
                "all",
              );
            }}
            className="rounded-[var(--ysim-radius-md)] px-3 py-2 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-100)]"
          >
            Đặt lại
          </button>
        ) : null}
      </div>

      {filtered.length >
      0 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(
            (item) => (
              <PreviewPackageCard
                key={
                  item.packageNumber
                }
                item={
                  item
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-[var(--ysim-radius-xl)] border border-dashed border-[var(--ysim-color-border-strong)] bg-white px-6 py-14 text-center">
          <Search className="mx-auto h-10 w-10 text-[var(--ysim-color-text-soft)]" />

          <h2 className="mt-4 text-lg font-bold text-[var(--ysim-color-text)]">
            Không tìm thấy package
          </h2>

          <p className="mt-2 text-sm text-[var(--ysim-color-text-muted)]">
            Hãy thử từ khóa hoặc nhóm khác.
          </p>
        </div>
      )}
    </div>
  );
}
