"use client";

import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { ChevronRight } from "lucide-react";

import type {
  EsimCatalogCategory,
  EsimCatalogCategoryKey,
} from "./types";

export interface EsimCategorySelectorProps {
  title?: string;

  categories: EsimCatalogCategory[];

  activeCategory: EsimCatalogCategoryKey;

  onChange: (
    category: EsimCatalogCategoryKey,
  ) => void;

  renderIcon?: (
    category: EsimCatalogCategory,
  ) => ReactNode;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

interface CategoryButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange"
  > {
  category: EsimCatalogCategory;

  active: boolean;

  visual?: ReactNode;
}

function CategoryButton({
  category,
  active,
  visual,
  className,
  ...props
}: CategoryButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={category.disabled}
      className={joinClasses(
        "group flex w-full items-center gap-4 rounded-2xl border px-4 py-5 text-left transition",

        active
          ? "border-green-200 bg-gradient-to-r from-green-50 to-white shadow-sm"
          : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50",

        category.disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer",

        className,
      )}
      {...props}
    >
      {visual ? (
        <span
          aria-hidden="true"
          className={joinClasses(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",

            active
              ? "bg-white text-green-700 shadow-sm"
              : "bg-slate-50 text-slate-500 group-hover:text-green-700",
          )}
        >
          {visual}
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span
          className={joinClasses(
            "block text-base font-bold",

            active
              ? "text-green-800"
              : "text-slate-900",
          )}
        >
          {category.title}
        </span>

        <span
          className={joinClasses(
            "mt-1 block text-sm leading-6",

            active
              ? "text-green-700"
              : "text-slate-500",
          )}
        >
          {category.description}
        </span>
      </span>

      <ChevronRight
        aria-hidden="true"
        className={joinClasses(
          "h-5 w-5 shrink-0 transition-transform",

          active
            ? "translate-x-0.5 text-green-700"
            : "text-slate-400 group-hover:translate-x-0.5 group-hover:text-green-700",
        )}
      />
    </button>
  );
}

export function EsimCategorySelector({
  title = "Loại eSIM",
  categories,
  activeCategory,
  onChange,
  renderIcon,
  className,
}: EsimCategorySelectorProps) {
  return (
    <section
      aria-labelledby="esim-category-selector-title"
      className={className}
    >
      <h2
        id="esim-category-selector-title"
        className="text-sm font-bold uppercase tracking-[0.08em] text-slate-800"
      >
        {title}
      </h2>

      <div
        className="mt-5 space-y-3"
        role="group"
        aria-label="Chọn loại eSIM"
      >
        {categories.map((category) => (
          <CategoryButton
            key={category.key}
            category={category}
            active={
              category.key === activeCategory
            }
            visual={
              renderIcon?.(category) ??
              category.icon
            }
            onClick={() => {
              if (!category.disabled) {
                onChange(category.key);
              }
            }}
          />
        ))}
      </div>
    </section>
  );
}