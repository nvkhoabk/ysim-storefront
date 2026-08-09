"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import { GlobalStateFrame } from "./GlobalStateFrame";
import { globalStateMessages, useStorefrontLocale } from "@/i18n/runtime";
import { localizeShellHref } from "@/i18n/shell/shell.href";

export function GlobalErrorState({
  title,
  description,
  detail,
  reference,
  onRetry,
  retrying = false,
}: {
  title?: string;
  description?: string;
  detail?: string;
  reference?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const shell = useStorefrontLocale();
  const copy = globalStateMessages(shell.locale);

  return (
    <GlobalStateFrame
      tone="danger"
      icon={<AlertTriangle className="h-7 w-7" />}
      eyebrow={copy.errorEyebrow}
      title={title ?? copy.errorTitle}
      description={description ?? copy.errorDescription}
      detail={
        detail ?? (reference ? `${copy.reference}: ${reference}` : undefined)
      }
      role="alert"
      ariaLive="assertive"
      secondaryAction={{
        label: copy.support,
        href: localizeShellHref("/support", shell.locale),
        variant: "outline",
      }}
      customPrimaryAction={
        onRetry ? (
          <button
            type="button"
            disabled={retrying}
            onClick={onRetry}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 text-sm font-bold text-white hover:bg-[var(--ysim-color-brand-800)] disabled:cursor-wait disabled:opacity-55"
          >
            <RefreshCcw
              aria-hidden="true"
              className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
            />

            {retrying ? copy.retrying : copy.retry}
          </button>
        ) : undefined
      }
    />
  );
}
