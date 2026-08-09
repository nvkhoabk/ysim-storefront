import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import {
  ProductRail,
} from "@/components/product/refactor";

import type {
  CartPageViewModel,
} from "@/types/view-models/cart-refactor";

import {
  CartItemList,
} from "./CartItemList";

import {
  CartSummary,
} from "./CartSummary";

import {
  EmptyCartState,
} from "./EmptyCartState";

export interface CartPageCompositionProps {
  cart:
    CartPageViewModel;
  promoValue: string;
  promoMessage?: string;
  onPromoChange:
    (value: string) => void;
  onApplyPromo:
    () => void;
  onQuantityChange:
    (
      lineId: string,
      quantity: number,
    ) => void;
  onRemove:
    (lineId: string) => void;
}

export function CartPageComposition({
  cart,
  promoValue,
  promoMessage,
  onPromoChange,
  onApplyPromo,
  onQuantityChange,
  onRemove,
}: CartPageCompositionProps) {
  return (
    <PageShell
      cartCount={
        cart.totals
          .itemCount
      }
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
                Giỏ hàng
              </p>

              <h1 className="mt-2 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em] text-[var(--ysim-color-text)]">
                Giỏ hàng của bạn
              </h1>

              <p className="mt-3 text-base text-[var(--ysim-color-text-muted)]">
                {
                  cart.totals
                    .itemCount
                }{" "}
                sản phẩm trong giỏ
              </p>
            </div>

            <Link
              href="/esim"
              className="inline-flex min-h-10 items-center gap-2 self-start rounded-[var(--ysim-radius-md)] px-3 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-100)]"
            >
              <ArrowLeft className="h-4 w-4" />

              Tiếp tục mua sắm
            </Link>
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          {cart.lines.length >
          0 ? (
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
              <CartItemList
                lines={
                  cart.lines
                }
                onQuantityChange={
                  onQuantityChange
                }
                onRemove={
                  onRemove
                }
              />

              <CartSummary
                totals={
                  cart.totals
                }
                canCheckout={
                  cart.canCheckout
                }
                unavailableLineCount={
                  cart.unavailableLineCount
                }
                promoValue={
                  promoValue
                }
                appliedCoupon={
                  cart.appliedCoupon
                }
                promoMessage={
                  promoMessage
                }
                onPromoChange={
                  onPromoChange
                }
                onApplyPromo={
                  onApplyPromo
                }
              />
            </div>
          ) : (
            <EmptyCartState />
          )}
        </Container>
      </Section>

      {cart.relatedProducts
        .length > 0 ? (
        <ProductRail
          eyebrow="Gợi ý cho bạn"
          title="Khám phá thêm các gói eSIM"
          description="Các lựa chọn phổ biến cho hành trình tiếp theo."
          actionLabel="Xem tất cả"
          actionHref="/esim"
          products={
            cart.relatedProducts
          }
          variant="subtle"
        />
      ) : null}
    </PageShell>
  );
}
