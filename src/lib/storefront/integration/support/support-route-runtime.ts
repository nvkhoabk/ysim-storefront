import type {
  SupportRouteDataSourceMode,
} from "@/types/view-models/support-route-candidate";

import {
  createFixtureSupportRouteAdapter,
} from "./fixture-support-route-adapter";

import type {
  SupportRouteDataAdapter,
} from "./support-route-adapter";

type SupportDataSourceSetting =
  | "auto"
  | "fixture"
  | "production";

export interface SupportRouteRuntime {
  sourceMode:
    SupportRouteDataSourceMode;
  sourceModeLabel: string;
  adapter:
    SupportRouteDataAdapter;
}

export interface SupportRouteRuntimeOptions {
  productionAdapter?:
    SupportRouteDataAdapter;
}

function parseSupportDataSourceSetting(
  value:
    | string
    | undefined,
): SupportDataSourceSetting {
  const normalized =
    value
      ?.trim()
      .toLowerCase();

  if (
    normalized ===
      "fixture" ||
    normalized ===
      "production"
  ) {
    return normalized;
  }

  return "auto";
}

export function createSupportRouteRuntime(
  options:
    SupportRouteRuntimeOptions = {},
): SupportRouteRuntime {
  const setting =
    parseSupportDataSourceSetting(
      process.env
        .YSIM_SUPPORT_DATA_SOURCE,
    );

  if (
    setting ===
    "production"
  ) {
    if (
      !options.productionAdapter
    ) {
      throw new Error(
        "YSIM_SUPPORT_DATA_SOURCE=production requires an injected SupportRouteDataAdapter.",
      );
    }

    return {
      sourceMode:
        "production",

      sourceModeLabel:
        "Production adapter",

      adapter:
        options.productionAdapter,
    };
  }

  if (
    setting ===
      "auto" &&
    options.productionAdapter
  ) {
    return {
      sourceMode:
        "production",

      sourceModeLabel:
        "Production adapter",

      adapter:
        options.productionAdapter,
    };
  }

  return {
    sourceMode:
      "fixture",

    sourceModeLabel:
      "Reviewed fixture",

    adapter:
      createFixtureSupportRouteAdapter(),
  };
}
