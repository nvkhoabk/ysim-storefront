import {
  ProductDetailPageComposition,
} from "@/components/product/refactor/detail";

import {
  productDetailPreviewPage,
} from "@/config/storefront-product-detail-preview";

export const metadata = {
  title: "Product Detail Refactor Preview | YSim",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductDetailRefactorPreviewPage() {
  return (
    <ProductDetailPageComposition
      page={productDetailPreviewPage}
      cartCount={2}
    />
  );
}
