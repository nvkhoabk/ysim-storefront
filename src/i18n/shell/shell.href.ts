// F07A-2B_GLOBAL_SHELL_LOCALIZATION_R2

import type { ShellLocale } from "./shell.types";

const EXCLUDED_PREFIXES = ["/api", "/_next", "/ui-preview"] as const;

export function localizeShellHref(href: string, locale: ShellLocale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (
    EXCLUDED_PREFIXES.some(
      (prefix) => href === prefix || href.startsWith(`${prefix}/`),
    )
  )
    return href;

  const match = href.match(/^\/(vi|en|lo)(?=\/|$)/);
  if (match) return href.replace(/^\/(vi|en|lo)(?=\/|$)/, `/${locale}`);
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}
