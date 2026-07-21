import {
  guideIntegrationFixtures,
} from "@/config/storefront-guide-integration-preview";

import type {
  ContentGateway,
} from "@/lib/content/refactor/content-gateway";

import type {
  GuideDataSourceMode,
} from "@/types/view-models/guide-integration";

import {
  createFixtureContentGateway,
} from "./fixture-content-gateway";

import {
  createYSimContentGateway,
} from "./ysim-content-gateway";

export interface GuideContentRuntime {
  mode:
    GuideDataSourceMode;
  gateway:
    ContentGateway;
}

type ContentSourceSetting =
  | "auto"
  | "fixture"
  | "wordpress";

function parseSourceSetting(
  value:
    | string
    | undefined,
): ContentSourceSetting {
  const normalized =
    value
      ?.trim()
      .toLowerCase();

  if (
    normalized ===
      "fixture" ||
    normalized ===
      "wordpress"
  ) {
    return normalized;
  }

  return "auto";
}

export function createGuideContentRuntime():
  GuideContentRuntime {
  const sourceSetting =
    parseSourceSetting(
      process.env
        .YSIM_CONTENT_SOURCE,
    );

  const baseUrl =
    process.env
      .YSIM_WORDPRESS_CONTENT_BASE_URL
      ?.trim();

  const namespace =
    process.env
      .YSIM_WORDPRESS_CONTENT_NAMESPACE
      ?.trim() ||
    "ysim/v1/content";

  if (
    sourceSetting ===
    "wordpress" &&
    !baseUrl
  ) {
    throw new Error(
      "YSIM_CONTENT_SOURCE=wordpress requires YSIM_WORDPRESS_CONTENT_BASE_URL.",
    );
  }

  if (
    sourceSetting ===
      "wordpress" ||
    (
      sourceSetting ===
        "auto" &&
      baseUrl
    )
  ) {
    return {
      mode:
        "wordpress",

      gateway:
        createYSimContentGateway({
          baseUrl:
            baseUrl as string,
          namespace,
        }),
    };
  }

  return {
    mode:
      "fixture",

    gateway:
      createFixtureContentGateway(
        guideIntegrationFixtures,
      ),
  };
}
