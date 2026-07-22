"use client";

/* YSIM_PACKAGE_35_BOUNDARY:global-error */

import {
  GlobalErrorDocument,
} from "@/components/global-states/GlobalErrorDocument";

export default function GlobalError({
  error,
  reset,
}: {
  error:
    Error & {
      digest?: string;
    };
  reset:
    () => void;
}) {
  return (
    <GlobalErrorDocument
      error={
        error
      }
      reset={
        reset
      }
    />
  );
}
