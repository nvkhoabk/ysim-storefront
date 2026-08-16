import {
  CartPagePreview,
} from "@/components/cart/refactor";

export const metadata = {
  title:
    "Cart Refactor Preview | YSim",

  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default function CartRefactorPreviewPage() {
  return (
    <CartPagePreview />
  );
}
