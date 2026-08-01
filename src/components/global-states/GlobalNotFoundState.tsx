"use client";

import { MapPinOff } from "lucide-react";

import { globalStateMessages, useStorefrontLocale } from "@/i18n/runtime";
import { localizeShellHref } from "@/i18n/shell/shell.href";

import { GlobalStateFrame } from "./GlobalStateFrame";

export function GlobalNotFoundState({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const shell = useStorefrontLocale();
  const copy = globalStateMessages(shell.locale);

  return (
    <GlobalStateFrame
      tone="warning"
      icon={<MapPinOff className="h-7 w-7" />}
      eyebrow="404"
      title={title ?? copy.notFoundTitle}
      description={description ?? copy.notFoundDescription}
      primaryAction={{
        label: copy.home,
        href: localizeShellHref("/", shell.locale),
        variant: "primary",
      }}
      secondaryAction={{
        label: copy.destinations,
        href: localizeShellHref("/destinations", shell.locale),
        variant: "outline",
      }}
    />
  );
}
