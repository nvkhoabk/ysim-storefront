import {
  getProductionRouteFlag,
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import type {
  SupportRouteCandidateViewModel,
} from "@/types/view-models/support-route-candidate";

import type {
  SupportRouteDataAdapter,
} from "./support-route-adapter";

import {
  createSupportRouteRuntime,
} from "./support-route-runtime";

export async function loadSupportRouteCandidate(
  options: {
    productionAdapter?:
      SupportRouteDataAdapter;
  } = {},
): Promise<
  SupportRouteCandidateViewModel
> {
  const runtime =
    createSupportRouteRuntime(
      options,
    );

  const routeMode =
    getProductionRouteMode(
      "support",
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
    "Production route /support is unchanged.",
    "Legacy Support remains the rollback path.",
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
    routeMode ===
    "legacy"
  ) {
    warnings.push(
      "YSIM_UI_SUPPORT is still legacy, which is the safe default.",
    );
  }

  warnings.push(
    "Compatibility results are illustrative until a production dataset is connected.",
  );

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
        "support",
      ),

    dataSourceFlag:
      "YSIM_SUPPORT_DATA_SOURCE",

    diagnostics,

    warnings,

    page,
  };
}
