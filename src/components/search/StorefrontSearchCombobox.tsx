"use client";

import {
  useId,
  useMemo,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";

import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Globe2, Search } from "lucide-react";

import {
  rankStorefrontSuggestions,
  type StorefrontSuggestionItem,
} from "@/lib/storefront/search/storefront-search";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import { cn } from "@/lib/ui/cn";

export interface StorefrontSearchComboboxProps {
  items: readonly StorefrontSuggestionItem[];
  locale: ShellLocale;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  resultsLabel: string;
  typeLabels: Readonly<Record<StorefrontSuggestionItem["type"], string>>;
  flagLabel: (name: string) => string;
  className?: string;
  inputClassName?: string;
  minResults?: number;
  maxResults?: number;
}

function countryFlagEmoji(countryCode: string | undefined): string | undefined {
  if (!countryCode || !/^[a-z]{2}$/iu.test(countryCode)) return undefined;
  return countryCode
    .toUpperCase()
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

export function StorefrontSearchCombobox({
  items,
  locale,
  value,
  onChange,
  label,
  placeholder,
  resultsLabel,
  typeLabels,
  flagLabel,
  className,
  inputClassName,
  minResults = 5,
  maxResults = 10,
}: StorefrontSearchComboboxProps) {
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestions = useMemo(
    () =>
      rankStorefrontSuggestions(items, locale, value, {
        minResults,
        maxResults,
      }),
    [items, locale, maxResults, minResults, value],
  );

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Enter"
    )
      return;

    if (event.key === "Enter") {
      const active = suggestions[activeIndex];
      if (open && active) {
        event.preventDefault();
        document.getElementById(`${listboxId}-option-${activeIndex}`)?.click();
      }
      return;
    }

    if (suggestions.length === 0) return;

    event.preventDefault();
    setOpen(true);
    const direction = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex((current) => {
      const start = current < 0 ? (direction > 0 ? -1 : 0) : current;
      return (start + direction + suggestions.length) % suggestions.length;
    });
  }

  return (
    <div
      className={cn("relative z-[var(--ysim-z-dropdown)]", className)}
      onFocus={() => setOpen(true)}
      onBlurCapture={handleBlur}
    >
      <label className="block">
        <span className="sr-only">{label}</span>
        <span className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[var(--ysim-color-text-soft)]"
          />
          <input
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={
              open && activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            aria-label={label}
            autoComplete="off"
            value={value}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              onChange(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-12 w-full appearance-none rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white py-3 pr-4 pl-12 text-sm font-semibold text-[var(--ysim-color-text)] transition outline-none placeholder:font-normal placeholder:text-[var(--ysim-color-text-soft)] focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[var(--ysim-color-brand-100)] [&::-webkit-search-cancel-button]:hidden",
              inputClassName,
            )}
          />
        </span>
      </label>

      {open && suggestions.length > 0 ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={resultsLabel}
          className="absolute inset-x-0 top-[calc(100%+0.65rem)] max-h-[min(34rem,68vh)] overflow-y-auto rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-2 shadow-[var(--ysim-shadow-md)]"
        >
          {suggestions.map((item, index) => {
            const flagAlt = flagLabel(item.label);
            const flagEmoji = countryFlagEmoji(item.countryCode);
            return (
              <Link
                id={`${listboxId}-option-${index}`}
                key={item.canonicalKey}
                href={item.href}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                className={cn(
                  "group flex min-h-14 items-center gap-3 rounded-[var(--ysim-radius-md)] px-3 py-2.5 transition-colors hover:bg-[var(--ysim-color-brand-50)] focus:bg-[var(--ysim-color-brand-50)] focus:outline-none",
                  index === activeIndex && "bg-[var(--ysim-color-brand-50)]",
                )}
              >
                {item.type === "destination" ? (
                  item.flagUrl ? (
                    <Image
                      src={item.flagUrl}
                      alt={flagAlt}
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full border border-[var(--ysim-color-border)] bg-white object-cover"
                    />
                  ) : flagEmoji ? (
                    <span
                      role="img"
                      aria-label={flagAlt}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--ysim-color-border)] bg-white text-xl"
                    >
                      {flagEmoji}
                    </span>
                  ) : (
                    <Globe2
                      aria-hidden="true"
                      className="h-8 w-8 shrink-0 rounded-full border border-[var(--ysim-color-border)] p-1.5 text-[var(--ysim-color-brand-700)]"
                    />
                  )
                ) : null}

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-[var(--ysim-color-text)]">
                      {item.label}
                    </span>
                    <span className="shrink-0 text-[0.65rem] font-bold tracking-[0.08em] text-[var(--ysim-color-brand-700)] uppercase">
                      {typeLabels[item.type]}
                    </span>
                  </span>
                  {item.description ? (
                    <span className="mt-0.5 block truncate text-xs text-[var(--ysim-color-text-muted)]">
                      {item.description}
                    </span>
                  ) : null}
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  {item.meta ? (
                    <span className="hidden text-xs font-semibold text-[var(--ysim-color-brand-700)] sm:inline">
                      {item.meta}
                    </span>
                  ) : null}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--ysim-color-brand-700)] transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
