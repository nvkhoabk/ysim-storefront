// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

import { Container } from "@/components/layout";
import type { StorefrontNavigationConfig } from "@/config/storefront-navigation";
import { DEFAULT_LOCALIZED_SHELL_LABELS } from "@/i18n/shell/shell.defaults";
import type { LocalizedShellLabels } from "@/i18n/shell/shell.types";

export type AnnouncementConfig = StorefrontNavigationConfig["announcement"];

export interface AnnouncementBarProps {
  config: AnnouncementConfig;
  labels?: Pick<LocalizedShellLabels, "announcementClose">;
}

const ANNOUNCEMENT_DISMISS_EVENT = "ysim:announcement-dismissed";

function subscribeToAnnouncementDismissal(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ANNOUNCEMENT_DISMISS_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(ANNOUNCEMENT_DISMISS_EVENT, onStoreChange);
  };
}

function getServerDismissedSnapshot() {
  return false;
}

export function AnnouncementBar({
  config,
  labels = DEFAULT_LOCALIZED_SHELL_LABELS,
}: AnnouncementBarProps) {
  const getDismissedSnapshot = useCallback(
    () =>
      config.enabled &&
      window.sessionStorage.getItem(config.storageKey) === "dismissed",
    [config.enabled, config.storageKey],
  );

  const dismissed = useSyncExternalStore(
    subscribeToAnnouncementDismissal,
    getDismissedSnapshot,
    getServerDismissedSnapshot,
  );

  function dismiss() {
    window.sessionStorage.setItem(config.storageKey, "dismissed");
    window.dispatchEvent(new Event(ANNOUNCEMENT_DISMISS_EVENT));
  }

  if (!config.enabled || dismissed) return null;

  return (
    <div className="bg-[var(--ysim-color-brand-900)] text-white">
      <Container>
        <div className="flex min-h-10 items-center justify-between gap-3 py-2 text-xs sm:text-sm">
          <div className="flex min-w-0 flex-1 items-center justify-center gap-3 text-center">
            <span>{config.message}</span>
            {config.actionLabel && config.actionHref ? (
              <Link
                href={config.actionHref}
                className="hidden shrink-0 items-center gap-1 font-bold underline-offset-4 hover:underline sm:inline-flex"
              >
                {config.actionLabel}
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
          <button
            type="button"
            aria-label={labels.announcementClose}
            onClick={dismiss}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </Container>
    </div>
  );
}
