// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

"use client";

import type { ChangeEvent } from "react";
import { Globe2 } from "lucide-react";

import { MARKET_CONFIGS } from "@/config/markets";
import type { LanguageOption } from "@/config/storefront-navigation";
import { DEFAULT_LOCALIZED_SHELL_LABELS } from "@/i18n/shell/shell.defaults";
import type {
  LocalizedShellLabels,
  ShellLanguageSwitchConfig,
  ShellLocale,
} from "@/i18n/shell/shell.types";
import { cn } from "@/lib/ui/cn";

const DEFAULT_SWITCH_CONFIG: ShellLanguageSwitchConfig = { mode: "display" };

interface MarketPreferenceResponse {
  readonly success?: boolean;
  readonly redirectPath?: string;
}

export interface LanguageSwitcherProps {
  languages: readonly LanguageOption[];
  currentLocale: ShellLocale;
  labels?: Pick<LocalizedShellLabels, "languageSelect" | "language">;
  switchConfig?: ShellLanguageSwitchConfig;
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  languages,
  currentLocale,
  labels = DEFAULT_LOCALIZED_SHELL_LABELS,
  switchConfig = DEFAULT_SWITCH_CONFIG,
  compact = false,
  className,
}: LanguageSwitcherProps) {
  const selectedLocale = languages.some(
    (language) => language.code === currentLocale,
  )
    ? currentLocale
    : (languages[0]?.code ?? currentLocale);

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as ShellLocale;
    if (nextLocale === currentLocale || switchConfig.mode === "display") return;

    if (switchConfig.mode === "preview") {
      const target = new URL(window.location.href);
      target.pathname =
        switchConfig.previewPath ?? "/ui-preview/localized-shell";
      target.searchParams.set("locale", nextLocale);
      window.location.assign(
        `${target.pathname}${target.search}${target.hash}`,
      );
      return;
    }

    const market = MARKET_CONFIGS.find(
      (candidate) => candidate.locale === nextLocale,
    );
    if (!market) return;

    const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const response = await fetch("/api/preferences/market", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketId: market.id, returnPath }),
    });
    if (!response.ok) return;

    const result = (await response.json()) as MarketPreferenceResponse;
    if (result.success === true && typeof result.redirectPath === "string") {
      window.location.assign(result.redirectPath);
    }
  }

  return (
    <label
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-[var(--ysim-radius-md)] border border-transparent px-3 text-sm font-semibold text-[var(--ysim-color-text)]",
        "transition-[background-color,border-color] duration-[var(--ysim-duration-fast)]",
        "hover:border-[var(--ysim-color-border)] hover:bg-[var(--ysim-color-surface-subtle)]",
        className,
      )}
    >
      <span className="sr-only">{labels.languageSelect}</span>
      <Globe2 aria-hidden="true" className="h-5 w-5" />
      <select
        aria-label={labels.language}
        value={selectedLocale}
        onChange={handleChange}
        className={cn(
          "cursor-pointer appearance-none bg-transparent pr-1 text-sm font-semibold outline-none",
          compact && "max-w-10",
        )}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {compact ? language.shortLabel : language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
