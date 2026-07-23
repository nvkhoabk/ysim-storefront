export type PolicyKey =
  | "terms"
  | "privacy-policy"
  | "refund-policy";

export interface SecondaryProductViewModel {
  id: number;
  slug: string;
  name: string;
  destination?: string;
  filterTerms?: readonly string[];
  imageUrl: string;
  price: number;
  regularPrice?: number;
  onSale: boolean;
  inStock: boolean;
  href: string;
}

export interface PolicyPageViewModel {
  key: PolicyKey;
  title: string;
  description: string;
  html?: string;
  updatedAt?: string;
  source: "wordpress" | "fallback";
  requiresLegalReview: boolean;
  fallbackParagraphs: readonly string[];
}

export interface SecondaryDiagnostic {
  label: string;
  status: "live" | "fallback" | "ready" | "warning";
  message: string;
}
