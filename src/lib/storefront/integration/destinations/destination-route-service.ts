import {
  getProductionRouteFlag,
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import type {
  DestinationRouteCandidateViewModel,
} from "@/types/view-models/destination-route-candidate";

import {
  createFixtureDestinationRouteAdapter,
} from "./fixture-destination-route-adapter";

import type {
  DestinationRouteDataAdapter,
} from "./destination-route-adapter";

import {
  createDestinationRouteRuntime,
} from "./destination-route-runtime";

function errorMessage(
  error: unknown,
): string {
  return error instanceof
    Error
    ? error.message
    : String(
        error,
      );
}

export async function loadDestinationRouteCandidate(
  options: {
    productionAdapter?:
      DestinationRouteDataAdapter;
  } = {},
): Promise<
  DestinationRouteCandidateViewModel
> {
  const runtime =
    createDestinationRouteRuntime(
      options,
    );

  const routeMode =
    getProductionRouteMode(
      "destinations",
    );

  let page;
  let diagnostics;
  let sourceMode =
    runtime.sourceMode;
  let sourceModeLabel =
    runtime.sourceModeLabel;

  try {
    page =
      await runtime
        .adapter
        .load();

    diagnostics =
      runtime.adapter
        .getDiagnostics?.() ||
      [];
  } catch (error) {
    const fallback =
      createFixtureDestinationRouteAdapter();

    page =
      await fallback
        .load();

    diagnostics = [
      {
        domain:
          "commerce" as const,
        label:
          "WooCommerce",
        status:
          "fallback" as const,
        statusLabel:
          "Fallback",
        message:
          `Production destination adapter failed: ${errorMessage(
            error,
          )}`,
      },
      ...(
        fallback
          .getDiagnostics?.() ||
        []
      ),
    ];

    sourceMode =
      "fixture";
    sourceModeLabel =
      "Fixture fallback";
  }

  const warnings: string[] = [
    "Production route /destinations is unchanged.",
    "Legacy Destination page remains the rollback path.",
  ];

  if (
    sourceMode ===
    "fixture"
  ) {
    warnings.push(
      "Candidate is using reviewed fixture data.",
    );
  }

  if (
    diagnostics.some(
      (item) =>
        item.status ===
          "warning",
    )
  ) {
    warnings.push(
      "Một số Destination assets vẫn dùng đường dẫn preview.",
    );
  }

  if (
    routeMode ===
    "legacy"
  ) {
    warnings.push(
      "YSIM_UI_DESTINATIONS is still legacy, which is the safe default.",
    );
  }

  return {
    routeMode,
    routeModeLabel:
      getProductionRouteModeLabel(
        routeMode,
      ),
    sourceMode,
    sourceModeLabel,
    environmentFlag:
      getProductionRouteFlag(
        "destinations",
      ),
    dataSourceFlag:
      "YSIM_DESTINATIONS_DATA_SOURCE",
    diagnostics,
    warnings,
    page,
  };
}
