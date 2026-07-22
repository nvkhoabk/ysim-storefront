"use client";

import {
  useState,
} from "react";

import {
  AlertTriangle,
  Inbox,
  LoaderCircle,
  MapPinOff,
  WifiOff,
} from "lucide-react";

import type {
  GlobalStateKind,
  GlobalStatePreviewViewModel,
} from "@/types/view-models/global-state";

import {
  GlobalEmptyState,
} from "./GlobalEmptyState";

import {
  GlobalErrorState,
} from "./GlobalErrorState";

import {
  GlobalLoadingState,
} from "./GlobalLoadingState";

import {
  GlobalNotFoundState,
} from "./GlobalNotFoundState";

import {
  GlobalOfflineState,
} from "./GlobalOfflineState";

const labels:
  Record<
    GlobalStateKind,
    string
  > = {
    loading:
      "Loading",
    error:
      "Error",
    empty:
      "Empty",
    "not-found":
      "404",
    offline:
      "Offline",
  };

const icons:
  Record<
    GlobalStateKind,
    typeof LoaderCircle
  > = {
    loading:
      LoaderCircle,
    error:
      AlertTriangle,
    empty:
      Inbox,
    "not-found":
      MapPinOff,
    offline:
      WifiOff,
  };

export function GlobalStatePreviewExplorer({
  preview,
}: {
  preview:
    GlobalStatePreviewViewModel;
}) {
  const [
    active,
    setActive,
  ] =
    useState<
      GlobalStateKind
    >(
      "loading",
    );

  const [
    retrying,
    setRetrying,
  ] =
    useState(
      false,
    );

  function retry() {
    setRetrying(
      true,
    );

    window.setTimeout(
      () => {
        setRetrying(
          false,
        );
      },
      700,
    );
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Chọn trạng thái xem trước"
        className="mb-8 flex gap-2 overflow-x-auto pb-2"
      >
        {
          preview.states.map(
            (state) => {
              const Icon =
                icons[
                  state.kind
                ];

              const selected =
                active ===
                state.kind;

              return (
                <button
                  key={
                    state.id
                  }
                  type="button"
                  role="tab"
                  aria-selected={
                    selected
                  }
                  onClick={() =>
                    setActive(
                      state.kind,
                    )
                  }
                  className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border px-4 text-sm font-bold ${
                    selected
                      ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-700)] text-white"
                      : "border-[var(--ysim-color-border)] bg-white text-[var(--ysim-color-text-muted)] hover:border-[var(--ysim-color-brand-300)]"
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`h-4 w-4 ${state.kind === "loading" && selected ? "animate-spin" : ""}`}
                  />

                  {
                    labels[
                      state.kind
                    ]
                  }
                </button>
              );
            },
          )
        }
      </div>

      <div
        role="tabpanel"
        className="min-h-[32rem]"
      >
        {
          active ===
          "loading"
            ? (
                <GlobalLoadingState />
              )
            : null
        }

        {
          active ===
          "error"
            ? (
                <GlobalErrorState
                  retrying={
                    retrying
                  }
                  onRetry={
                    retry
                  }
                  detail="Candidate không hiển thị thông tin kỹ thuật nhạy cảm."
                />
              )
            : null
        }

        {
          active ===
          "empty"
            ? (
                <GlobalEmptyState />
              )
            : null
        }

        {
          active ===
          "not-found"
            ? (
                <GlobalNotFoundState />
              )
            : null
        }

        {
          active ===
          "offline"
            ? (
                <GlobalOfflineState
                  onRetry={
                    retry
                  }
                />
              )
            : null
        }
      </div>
    </div>
  );
}
