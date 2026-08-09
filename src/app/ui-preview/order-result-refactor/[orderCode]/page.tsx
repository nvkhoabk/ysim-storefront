import type {
  Metadata,
} from "next";

import {
  OrderResultPageComposition,
} from "@/components/payment/refactor";

import {
  createOrderResultPreview,
} from "@/config/storefront-payment-result-preview";

interface OrderResultPreviewPageProps {
  params: Promise<{
    orderCode: string;
  }>;
}

export async function generateMetadata({
  params,
}: OrderResultPreviewPageProps): Promise<Metadata> {
  const {
    orderCode,
  } =
    await params;

  return {
    title:
      `Order ${orderCode} Preview | YSim`,

    robots: {
      index:
        false,
      follow:
        false,
    },
  };
}

export default async function OrderResultPreviewPage({
  params,
}: OrderResultPreviewPageProps) {
  const {
    orderCode,
  } =
    await params;

  const order =
    createOrderResultPreview(
      orderCode,
      "success",
    );

  return (
    <OrderResultPageComposition
      order={
        order
      }
    />
  );
}
