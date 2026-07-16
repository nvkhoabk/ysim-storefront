import type {
  WooCommerceCart,
  WooCommerceCartTotals,
} from "@/lib/woocommerce/cart-types";

export interface CheckoutAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface CheckoutPaymentResult {
  payment_status: string;
  payment_details: Array<{
    key: string;
    value: string;
  }>;
  redirect_url: string;
}

export interface WooCommerceCheckout {
  order_id: number;
  order_number?: string;
  status: string;
  order_key: string;
  customer_note: string;
  customer_id: number;

  billing_address: CheckoutAddress;

  shipping_address: Omit<CheckoutAddress, "email" | "phone">;

  payment_method: string;
  payment_result: CheckoutPaymentResult | null;

  additional_fields?: Record<string, unknown>;
  extensions?: Record<string, unknown>;

  __experimentalCart?: WooCommerceCart;
}

export interface CheckoutFormValues {
  fullName: string;
  email: string;
  phone: string;
  country: string;

  purchaseFor: "self" | "gift";

  recipientName: string;
  recipientEmail: string;

  paymentMethod: string;
  customerNote: string;

  acceptTerms: boolean;
}

export interface CheckoutOrderSummary {
  items: WooCommerceCart["items"];
  itemsCount: number;
  totals: WooCommerceCartTotals;
  coupons: WooCommerceCart["coupons"];
}
