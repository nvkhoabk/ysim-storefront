import type {
  DestinationRouteDataSourceMode,
} from "@/types/view-models/destination-route-candidate";

import {
  createFixtureDestinationRouteAdapter,
} from "./fixture-destination-route-adapter";

import type {
  DestinationRouteDataAdapter,
} from "./destination-route-adapter";

type DestinationDataSourceSetting =
  | "auto"
  | "fixture"
  | "production";

export interface DestinationRouteRuntime {
  sourceMode:
    DestinationRouteDataSourceMode;
  sourceModeLabel: string;
  adapter:
    DestinationRouteDataAdapter;
}

export interface DestinationRouteRuntimeOptions {
  productionAdapter?:
    DestinationRouteDataAdapter;
}

function parseDestinationDataSourceSetting(
  value:
    | string
    | undefined,
): DestinationDataSourceSetting {
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

export function createDestinationRouteRuntime(
  options:
    DestinationRouteRuntimeOptions = {},
): DestinationRouteRuntime {
  const setting =
    parseDestinationDataSourceSetting(
      process.env
        .YSIM_DESTINATIONS_DATA_SOURCE,
    );

  if (
    setting ===
    "production"
  ) {
    if (
      !options.productionAdapter
    ) {
      throw new Error(
        "YSIM_DESTINATIONS_DATA_SOURCE=production requires NEXT_PUBLIC_WOOCOMMERCE_URL and a production DestinationRouteDataAdapter.",
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
      createFixtureDestinationRouteAdapter(),
  };
}
