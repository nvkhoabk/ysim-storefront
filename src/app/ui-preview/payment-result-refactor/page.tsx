import {
  PaymentResultPreview,
} from "@/components/payment/refactor";

export const metadata = {
  title:
    "Payment Result Refactor Preview | YSim",

  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default function PaymentResultRefactorPreviewPage() {
  return (
    <PaymentResultPreview />
  );
}
