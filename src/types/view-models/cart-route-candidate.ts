import type {
  WooCommerceCart,
} from "@/lib/woocommerce/cart-types";

export type CartRouteDiagnosticStatus =
  | "live"
  | "ready"
  | "warning"
  | "error";

export interface CartRouteDiagnosticViewModel {
  domain:
    | "cart-api"
    | "session"
    | "product-bridge"
    | "coupon"
    | "checkout"
    | "payment";
  label: string;
  status:
    CartRouteDiagnosticStatus;
  statusLabel: string;
  message: string;
}

export interface CartRouteCandidateViewModel {
  title: string;
  description: string;
  checkoutCandidatePath: string;
  diagnostics:
    readonly CartRouteDiagnosticViewModel[];
}

export interface AddWooCommerceCartItemInput {
  productId: number;
  variationId?: number;
  quantity: number;
  variation?:
    readonly {
      attribute: string;
      value: string;
    }[];
}

export interface WooCommerceCartMutationResult {
  cart:
    WooCommerceCart;
}
