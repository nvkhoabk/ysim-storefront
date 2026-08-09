import type {
  CheckoutCandidateFormErrors,
  CheckoutCandidateFormState,
} from "@/types/view-models/checkout-route-candidate";

function emailValid(
  value: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim(),
  );
}

export function validateCheckoutCandidate(
  value:
    CheckoutCandidateFormState,
): CheckoutCandidateFormErrors {
  const errors:
    CheckoutCandidateFormErrors = {};

  if (
    value.fullName
      .trim()
      .length <
    2
  ) {
    errors.fullName =
      "Vui lòng nhập họ và tên.";
  }

  if (
    !emailValid(
      value.email,
    )
  ) {
    errors.email =
      "Email không hợp lệ.";
  }

  if (
    value.phone
      .trim()
      .replace(
        /\D/g,
        "",
      )
      .length <
    8
  ) {
    errors.phone =
      "Số điện thoại không hợp lệ.";
  }

  if (
    value.country
      .trim()
      .length !==
    2
  ) {
    errors.country =
      "Mã quốc gia không hợp lệ.";
  }

  if (
    value.purchaseFor ===
    "gift"
  ) {
    if (
      value.recipientName
        .trim()
        .length <
      2
    ) {
      errors.recipientName =
        "Vui lòng nhập tên người nhận.";
    }

    if (
      !emailValid(
        value.recipientEmail,
      )
    ) {
      errors.recipientEmail =
        "Email người nhận không hợp lệ.";
    }
  }

  if (
    !value.paymentMethod
  ) {
    errors.paymentMethod =
      "Vui lòng chọn phương thức thanh toán.";
  }

  if (
    !value.acceptTerms
  ) {
    errors.acceptTerms =
      "Bạn cần đồng ý với điều khoản.";
  }

  return errors;
}

export function hasCheckoutCandidateErrors(
  errors:
    CheckoutCandidateFormErrors,
): boolean {
  return Object.values(
    errors,
  ).some(Boolean);
}
