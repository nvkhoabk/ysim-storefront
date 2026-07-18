"use client";

import type {
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
} from "react";

import {
  Search,
  X,
} from "lucide-react";

import type {
  SupportSearchPayload,
} from "./types";

export interface SupportSearchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange" | "onSubmit"
  > {
  value: string;

  onChange: (value: string) => void;

  onSubmit?: (
    payload: SupportSearchPayload,
  ) => void;

  onClear?: () => void;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function SupportSearch({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder =
    "Tìm kiếm câu hỏi, chủ đề hỗ trợ...",
  className,
  disabled,
  ...inputProps
}: SupportSearchProps) {
  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    onChange(event.target.value);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    onSubmit?.({
      query: value.trim(),
    });
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <form
      role="search"
      aria-label="Tìm kiếm nội dung hỗ trợ"
      onSubmit={handleSubmit}
      className={joinClasses(
        "relative w-full",
        className,
      )}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
      />

      <input
        {...inputProps}
        type="search"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        className={joinClasses(
          "h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-12 text-sm text-slate-950 shadow-sm outline-none transition",
          "placeholder:text-slate-400",
          "hover:border-slate-300",
          "focus:border-green-600 focus:ring-4 focus:ring-green-100",
          "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />

      {value.length > 0 && !disabled ? (
        <button
          type="button"
          aria-label="Xóa nội dung tìm kiếm"
          onClick={handleClear}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <X
            aria-hidden="true"
            className="h-4 w-4"
          />
        </button>
      ) : null}
    </form>
  );
}