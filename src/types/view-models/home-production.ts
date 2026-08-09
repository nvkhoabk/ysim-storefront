import type {
  WooCommerceProduct,
} from "@/lib/woocommerce/types";

export type HomeProductionDomain =
  | "commerce"
  | "content";

export type HomeProductionDiagnosticStatus =
  | "live"
  | "fallback"
  | "skipped";

export interface HomeProductionDiagnosticViewModel {
  domain:
    HomeProductionDomain;
  label: string;
  status:
    HomeProductionDiagnosticStatus;
  statusLabel: string;
  message: string;
  itemCount?: number;
}

export interface WooCommerceStoreCategorySource {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  description?: string;
  image?: {
    id?: number;
    src?: string;
    thumbnail?: string;
    alt?: string;
  } | null;
}

export interface HomeCommerceSnapshot {
  categories:
    readonly WooCommerceStoreCategorySource[];
  products:
    readonly WooCommerceProduct[];
}

export interface HomeCommerceGateway {
  load():
    Promise<
      HomeCommerceSnapshot
    >;
}
