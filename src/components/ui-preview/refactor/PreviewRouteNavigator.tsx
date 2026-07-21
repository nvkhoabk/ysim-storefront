"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Route,
} from "lucide-react";

import type {
  PreviewPackageViewModel,
} from "@/types/view-models/ui-preview-registry";

export function PreviewRouteNavigator({
  packages,
}: {
  packages:
    readonly PreviewPackageViewModel[];
}) {
  const router =
    useRouter();

  const [
    value,
    setValue,
  ] =
    useState("");

  const routes =
    useMemo(
      () =>
        packages.flatMap(
          (item) =>
            item.routes.map(
              (route) => ({
                ...route,

                packageNumber:
                  item.packageNumber,

                packageTitle:
                  item.title,
              }),
            ),
        ),
      [
        packages,
      ],
    );

  function openRoute() {
    if (!value) {
      return;
    }

    router.push(
      value,
    );
  }

  return (
    <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-brand-200)] bg-[var(--ysim-color-brand-50)] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--ysim-radius-md)] bg-white text-[var(--ysim-color-brand-700)]">
          <Route className="h-5 w-5" />
        </span>

        <div>
          <h2 className="text-lg font-bold text-[var(--ysim-color-brand-900)]">
            Mở nhanh preview route
          </h2>

          <p className="mt-1 text-sm text-[var(--ysim-color-brand-800)]/75">
            Chọn một màn hình rồi mở trực tiếp từ Hub.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <select
          value={
            value
          }
          onChange={(
            event,
          ) =>
            setValue(
              event.target.value,
            )
          }
          className="min-h-12 min-w-0 flex-1 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-200)] bg-white px-3.5 text-sm font-semibold text-[var(--ysim-color-text)] outline-none focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[var(--ysim-color-brand-100)]"
        >
          <option value="">
            Chọn preview route
          </option>

          {routes.map(
            (route) => (
              <option
                key={
                  `${route.packageNumber}-${route.href}`
                }
                value={
                  route.href
                }
              >
                {String(
                  route.packageNumber,
                ).padStart(
                  2,
                  "0",
                )}{" "}
                ·{" "}
                {
                  route.packageTitle
                }{" "}
                ·{" "}
                {
                  route.label
                }
              </option>
            ),
          )}
        </select>

        <button
          type="button"
          disabled={
            !value
          }
          onClick={
            openRoute
          }
          className="min-h-12 shrink-0 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 text-sm font-bold text-white hover:bg-[var(--ysim-color-brand-800)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Mở route
        </button>
      </div>
    </div>
  );
}
