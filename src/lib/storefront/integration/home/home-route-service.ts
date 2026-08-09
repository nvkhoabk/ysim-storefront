import {
  getProductionRouteFlag,
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import type {
  HomeRouteCandidateViewModel,
} from "@/types/view-models/home-route-candidate";

import type {
  HomeRouteDataAdapter,
} from "./home-route-adapter";

import {
  createHomeRouteRuntime,
} from "./home-route-runtime";

export async function loadHomeRouteCandidate(
  options: {
    productionAdapter?:
      HomeRouteDataAdapter;
  } = {},
): Promise<
  HomeRouteCandidateViewModel
> {
  const runtime =
    createHomeRouteRuntime(
      options,
    );

  const routeMode =
    getProductionRouteMode(
      "home",
    );

  const page =
    await runtime
      .adapter
      .load();

  const diagnostics =
    runtime.adapter
      .getDiagnostics?.() ||
    [];

  const warnings: string[] = [
    "Production route / is unchanged.",
    "Legacy Home remains the rollback path.",
  ];

  if (
    runtime.sourceMode ===
    "fixture"
  ) {
    warnings.push(
      "Candidate currently uses reviewed fixture data.",
    );
  }

  if (
    diagnostics.some(
      (item) =>
        item.status ===
        "fallback",
    )
  ) {
    warnings.push(
      "Một hoặc nhiều production sources đang fallback; xem diagnostics.",
    );
  }

  if (
    routeMode ===
    "legacy"
  ) {
    warnings.push(
      "YSIM_UI_HOME is still legacy, which is the safe default.",
    );
  }

  return {
    routeMode,

    routeModeLabel:
      getProductionRouteModeLabel(
        routeMode,
      ),

    sourceMode:
      runtime.sourceMode,

    sourceModeLabel:
      runtime.sourceModeLabel,

    environmentFlag:
      getProductionRouteFlag(
        "home",
      ),

    dataSourceFlag:
      "YSIM_HOME_DATA_SOURCE",

    warnings,

    diagnostics,

    page,
  };
}
