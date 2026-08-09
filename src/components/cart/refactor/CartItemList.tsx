import type {
  CartLineItemViewModel,
} from "@/types/view-models/cart-refactor";

import {
  CartItemCard,
} from "./CartItemCard";

export interface CartItemListProps {
  lines:
    readonly CartLineItemViewModel[];
  onQuantityChange:
    (
      lineId: string,
      quantity: number,
    ) => void;
  onRemove:
    (lineId: string) => void;
}

export function CartItemList({
  lines,
  onQuantityChange,
  onRemove,
}: CartItemListProps) {
  return (
    <div className="space-y-4">
      {lines.map(
        (line) => (
          <CartItemCard
            key={
              line.lineId
            }
            line={
              line
            }
            onQuantityChange={
              onQuantityChange
            }
            onRemove={
              onRemove
            }
          />
        ),
      )}
    </div>
  );
}
