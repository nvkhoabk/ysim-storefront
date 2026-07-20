import {
  Globe2,
} from "lucide-react";

import type {
  LanguageOption,
} from "@/config/storefront-navigation";

import {
  cn,
} from "@/lib/ui/cn";

export interface LanguageSwitcherProps {
  languages:
    readonly LanguageOption[];
  defaultLocale: string;
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  languages,
  defaultLocale,
  compact = false,
  className,
}: LanguageSwitcherProps) {
  return (
    <label
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-[var(--ysim-radius-md)] border border-transparent px-3 text-sm font-semibold text-[var(--ysim-color-text)]",
        "transition-[background-color,border-color] duration-[var(--ysim-duration-fast)]",
        "hover:border-[var(--ysim-color-border)] hover:bg-[var(--ysim-color-surface-subtle)]",
        className,
      )}
    >
      <span className="sr-only">
        Chọn ngôn ngữ
      </span>

      <Globe2
        aria-hidden="true"
        className="h-5 w-5"
      />

      <select
        aria-label="Ngôn ngữ"
        defaultValue={defaultLocale}
        className={cn(
          "cursor-pointer appearance-none bg-transparent pr-1 text-sm font-semibold outline-none",
          compact &&
            "max-w-10",
        )}
      >
        {languages.map(
          (language) => (
            <option
              key={
                language.code
              }
              value={
                language.code
              }
            >
              {compact
                ? language.shortLabel
                : language.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
