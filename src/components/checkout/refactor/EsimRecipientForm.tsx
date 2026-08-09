import {
  Gift,
  Mail,
  User,
} from "lucide-react";

import type {
  CheckoutCustomerFormState,
  CheckoutFormErrors,
  CheckoutRecipientFormState,
} from "@/types/view-models/checkout-refactor";

import {
  CheckoutField,
} from "./CheckoutField";

export interface EsimRecipientFormProps {
  customer:
    CheckoutCustomerFormState;
  value:
    CheckoutRecipientFormState;
  errors:
    CheckoutFormErrors;
  onChange:
    (
      value:
        CheckoutRecipientFormState,
    ) => void;
}

export function EsimRecipientForm({
  customer,
  value,
  errors,
  onChange,
}: EsimRecipientFormProps) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] p-4">
        <input
          type="checkbox"
          checked={
            value.sendToAnotherPerson
          }
          onChange={(
            event,
          ) =>
            onChange({
              ...value,

              sendToAnotherPerson:
                event.target.checked,
            })
          }
          className="mt-1 h-4 w-4 accent-[var(--ysim-color-brand-700)]"
        />

        <span className="flex min-w-0 gap-3">
          <Gift className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ysim-color-brand-700)]" />

          <span>
            <strong className="block text-sm text-[var(--ysim-color-text)]">
              Gửi eSIM cho người khác
            </strong>

            <span className="mt-1 block text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
              Nhập tên và email người sẽ trực tiếp nhận mã QR eSIM.
            </span>
          </span>
        </span>
      </label>

      {value.sendToAnotherPerson ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <CheckoutField
            name="recipientFullName"
            label="Tên người nhận"
            value={
              value.fullName
            }
            error={
              errors.recipientFullName
            }
            icon={
              <User />
            }
            placeholder="Tên người nhận eSIM"
            onChange={(
              event,
            ) =>
              onChange({
                ...value,

                fullName:
                  event.target.value,
              })
            }
          />

          <CheckoutField
            name="recipientEmail"
            label="Email nhận eSIM"
            type="email"
            value={
              value.email
            }
            error={
              errors.recipientEmail
            }
            icon={
              <Mail />
            }
            placeholder="nguoinhan@example.com"
            onChange={(
              event,
            ) =>
              onChange({
                ...value,

                email:
                  event.target.value,
              })
            }
          />
        </div>
      ) : (
        <div className="mt-5 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-brand-200)] bg-[var(--ysim-color-brand-50)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--ysim-color-brand-900)]">
            eSIM sẽ được gửi tới:
          </p>

          <p className="mt-1 break-all text-sm text-[var(--ysim-color-brand-800)]">
            {
              customer.email ||
              "Email khách hàng"
            }
          </p>
        </div>
      )}
    </div>
  );
}
