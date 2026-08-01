import "server-only";

import type { Metadata } from "next";
import { headers } from "next/headers";

import { localizedAlternates } from "./runtime.metadata";
import { resolveStorefrontLocaleRequest } from "./runtime.request";
import type { StorefrontLocaleRequest } from "./runtime.types";

export async function getStorefrontLocaleRequest(): Promise<StorefrontLocaleRequest> {
  return resolveStorefrontLocaleRequest(await headers());
}

export function withLocalizedAlternates(
  metadata: Metadata,
  request: StorefrontLocaleRequest,
): Metadata {
  const alternates = localizedAlternates(request);
  return alternates ? { ...metadata, alternates } : metadata;
}

export async function localizeMetadata(metadata: Metadata): Promise<Metadata> {
  return withLocalizedAlternates(metadata, await getStorefrontLocaleRequest());
}
