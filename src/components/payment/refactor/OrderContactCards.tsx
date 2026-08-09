import {
  Mail,
  Phone,
  User,
} from "lucide-react";

import type {
  OrderResultPageViewModel,
} from "@/types/view-models/payment-result";

export interface OrderContactCardsProps {
  order:
    OrderResultPageViewModel;
}

export function OrderContactCards({
  order,
}: OrderContactCardsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <section className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5">
        <h2 className="text-lg font-bold text-[var(--ysim-color-text)]">
          Thông tin khách hàng
        </h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

            <div>
              <dt className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                Họ và tên
              </dt>

              <dd className="mt-0.5 font-bold text-[var(--ysim-color-text)]">
                {
                  order.customer
                    .fullName
                }
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

            <div className="min-w-0">
              <dt className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                Email
              </dt>

              <dd className="mt-0.5 break-all font-bold text-[var(--ysim-color-text)]">
                {
                  order.customer
                    .email
                }
              </dd>
            </div>
          </div>

          {order.customer.phone ? (
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

              <div>
                <dt className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                  Số điện thoại
                </dt>

                <dd className="mt-0.5 font-bold text-[var(--ysim-color-text)]">
                  {
                    order.customer
                      .phone
                  }
                </dd>
              </div>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5">
        <h2 className="text-lg font-bold text-[var(--ysim-color-text)]">
          Người nhận eSIM
        </h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

            <div>
              <dt className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                Họ và tên
              </dt>

              <dd className="mt-0.5 font-bold text-[var(--ysim-color-text)]">
                {
                  order.recipient
                    .fullName
                }
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

            <div className="min-w-0">
              <dt className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                Email nhận eSIM
              </dt>

              <dd className="mt-0.5 break-all font-bold text-[var(--ysim-color-text)]">
                {
                  order.recipient
                    .email
                }
              </dd>
            </div>
          </div>
        </dl>
      </section>
    </div>
  );
}
