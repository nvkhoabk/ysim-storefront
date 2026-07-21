import {
  Mail,
  Phone,
  User,
} from "lucide-react";

import type {
  CheckoutCustomerFormState,
  CheckoutFormErrors,
} from "@/types/view-models/checkout-refactor";

import {
  CheckoutField,
} from "./CheckoutField";

export interface CustomerInformationFormProps {
  value:
    CheckoutCustomerFormState;
  errors:
    CheckoutFormErrors;
  onChange:
    (
      value:
        CheckoutCustomerFormState,
    ) => void;
}

export function CustomerInformationForm({
  value,
  errors,
  onChange,
}: CustomerInformationFormProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <CheckoutField
          name="customerFullName"
          label="Họ và tên"
          autoComplete="name"
          value={
            value.fullName
          }
          error={
            errors.customerFullName
          }
          icon={
            <User />
          }
          placeholder="Nguyễn Văn A"
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
      </div>

      <CheckoutField
        name="customerEmail"
        label="Email"
        type="email"
        autoComplete="email"
        value={
          value.email
        }
        error={
          errors.customerEmail
        }
        icon={
          <Mail />
        }
        placeholder="ban@example.com"
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

      <CheckoutField
        name="customerPhone"
        label="Số điện thoại"
        type="tel"
        autoComplete="tel"
        value={
          value.phone
        }
        error={
          errors.customerPhone
        }
        icon={
          <Phone />
        }
        placeholder="+84 912 345 678"
        onChange={(
          event,
        ) =>
          onChange({
            ...value,

            phone:
              event.target.value,
          })
        }
      />
    </div>
  );
}
