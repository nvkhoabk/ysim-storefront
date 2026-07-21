import type {
  HomeRouteDataSourceMode,
} from "@/types/view-models/home-route-candidate";

import type {
  HomeRouteDataAdapter,
} from "./home-route-adapter";

import {
  createFixtureHomeRouteAdapter,
} from "./fixture-home-route-adapter";

type HomeDataSourceSetting =
  | "auto"
  | "fixture"
  | "production";

export interface HomeRouteRuntime {
  sourceMode:
    HomeRouteDataSourceMode;
  sourceModeLabel: string;
  adapter:
    HomeRouteDataAdapter;
}

export interface HomeRouteRuntimeOptions {
  productionAdapter?:
    HomeRouteDataAdapter;
}

function parseHomeDataSourceSetting(
  value:
    | string
    | undefined,
): HomeDataSourceSetting {
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

export function createHomeRouteRuntime(
  options:
    HomeRouteRuntimeOptions = {},
): HomeRouteRuntime {
  const setting =
    parseHomeDataSourceSetting(
      process.env
        .YSIM_HOME_DATA_SOURCE,
    );

  if (
    setting ===
    "production"
  ) {
    if (
      !options.productionAdapter
    ) {
      throw new Error(
        "YSIM_HOME_DATA_SOURCE=production requires an injected production HomeRouteDataAdapter.",
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
      createFixtureHomeRouteAdapter(),
  };
}
