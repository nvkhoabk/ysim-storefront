"use client";

import type {
  DestinationCatalogFilterState,
  DestinationFilterChangePayload,
  DestinationFilterDefinition,
  DestinationFilterId,
} from "./types";

import {
  DestinationFilterSelect,
} from "./DestinationFilterSelect";

export interface DestinationFiltersProps {
  definitions: DestinationFilterDefinition[];

  values: DestinationCatalogFilterState;

  onChange: (
    payload: DestinationFilterChangePayload,
  ) => void;

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

function getFilterValue(
  values: DestinationCatalogFilterState,
  id: DestinationFilterId,
): string {
  return values[id];
}

export function DestinationFilters({
  definitions,
  values,
  onChange,
  compact = false,
  className,
}: DestinationFiltersProps) {
  return (
    <div
      className={joinClasses(
        compact
          ? "flex min-w-max items-end gap-3"
          : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {definitions.map((definition) => (
        <DestinationFilterSelect
          key={definition.id}
          definition={definition}
          value={getFilterValue(
            values,
            definition.id,
          )}
          compact={compact}
          onChange={(value) => {
            onChange({
              id: definition.id,
              value,
            });
          }}
        />
      ))}
    </div>
  );
}