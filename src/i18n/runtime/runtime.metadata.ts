import type { Metadata } from "next";

import { localizeShellHref } from "../shell/shell.href";
import type { ShellLocale } from "../shell/shell.types";
import type { StorefrontLocaleRequest } from "./runtime.types";

const LOCALIZED_PATH_PATTERN = /^\/(vi|en|lo)(?=\/|$)/;

function ordinaryPathname(publicPathname: string): string {
  const stripped = publicPathname.replace(LOCALIZED_PATH_PATTERN, "");
  return stripped || "/";
}

export function localizedAlternates(
  request: StorefrontLocaleRequest,
): Metadata["alternates"] | undefined {
  if (!request.localized) return undefined;

  const pathname = ordinaryPathname(request.publicPathname);
  const href = (locale: ShellLocale) => localizeShellHref(pathname, locale);

  return {
    canonical: href(request.shell.locale),
    languages: {
      vi: href("vi"),
      en: href("en"),
      lo: href("lo"),
      "x-default": href("vi"),
    },
  };
}
