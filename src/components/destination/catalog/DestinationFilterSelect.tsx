"use client";

import type {
  ChangeEvent,
  SelectHTMLAttributes,
} from "react";

import { ChevronDown } from "lucide-react";

import type {
  DestinationFilterDefinition,
} from "./types";

export interface DestinationFilterSelectProps
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "value" | "onChange"
  > {
  definition: DestinationFilterDefinition;

  value: string;

  onChange: (value: string) => void;

  compact?: boolean;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function DestinationFilterSelect({
  definition,
  value,
  onChange,
  compact = false,
  className,
  disabled,
  ...selectProps
}: DestinationFilterSelectProps) {
  const handleChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    onChange(event.target.value);
  };

  return (
    <label
      className={joinClasses(
        "block min-w-0",
        className,
      )}
    >
      {!compact ? (
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
          {definition.label}
        </span>
      ) : null}

      <span className="relative block">
        <select
          {...selectProps}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          aria-label={definition.label}
          className={joinClasses(
            "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition",
            "hover:border-slate-300",
            "focus:border-green-600 focus:ring-4 focus:ring-green-100",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
            compact
              ? "min-w-[150px]"
              : "min-w-0",
          )}
        >
          {definition.options.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
                {typeof option.count === "number"
                  ? ` (${option.count})`
                  : ""}
              </option>
            ),
          )}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
      </span>
    </label>
  );
}