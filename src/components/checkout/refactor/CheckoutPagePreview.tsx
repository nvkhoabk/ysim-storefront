"use client";

import {
  useState,
} from "react";

import {
  checkoutPreviewPage,
} from "@/config/storefront-checkout-preview";

import type {
  CheckoutCustomerFormState,
  CheckoutFormErrors,
  CheckoutPaymentMethodId,
  CheckoutRecipientFormState,
  CheckoutSubmitPreview,
} from "@/types/view-models/checkout-refactor";

import {
  CheckoutPageComposition,
} from "./CheckoutPageComposition";

const initialCustomer:
  CheckoutCustomerFormState = {
    fullName:
      "",
    email:
      "",
    phone:
      "",
  };

const initialRecipient:
  CheckoutRecipientFormState = {
    sendToAnotherPerson:
      false,
    fullName:
      "",
    email:
      "",
  };

function isValidEmail(
  value: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim(),
  );
}

function createDemoOrderCode():
  string {
  const stamp =
    new Date()
      .toISOString()
      .replace(
        /\D/g,
        "",
      )
      .slice(
        0,
        14,
      );

  return `YSIM-DEMO-${stamp}`;
}

export function CheckoutPagePreview() {
  const [
    customer,
    setCustomer,
  ] =
    useState(
      initialCustomer,
    );

  const [
    recipient,
    setRecipient,
  ] =
    useState(
      initialRecipient,
    );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<CheckoutPaymentMethodId>(
      checkoutPreviewPage
        .initialPaymentMethod,
    );

  const [
    acceptTerms,
    setAcceptTerms,
  ] =
    useState(false);

  const [
    errors,
    setErrors,
  ] =
    useState<CheckoutFormErrors>(
      {},
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    result,
    setResult,
  ] =
    useState<
      CheckoutSubmitPreview | undefined
    >();

  function validate():
    CheckoutFormErrors {
    const next:
      CheckoutFormErrors = {};

    if (
      !customer.fullName
        .trim()
    ) {
      next.customerFullName =
        "Hãy nhập họ và tên.";
    }

    if (
      !customer.email
        .trim()
    ) {
      next.customerEmail =
        "Hãy nhập email.";
    } else if (
      !isValidEmail(
        customer.email,
      )
    ) {
      next.customerEmail =
        "Email chưa đúng định dạng.";
    }

    if (
      !customer.phone
        .trim()
    ) {
      next.customerPhone =
        "Hãy nhập số điện thoại.";
    }

    if (
      recipient
        .sendToAnotherPerson
    ) {
      if (
        !recipient.fullName
          .trim()
      ) {
        next.recipientFullName =
          "Hãy nhập tên người nhận.";
      }

      if (
        !recipient.email
          .trim()
      ) {
        next.recipientEmail =
          "Hãy nhập email người nhận.";
      } else if (
        !isValidEmail(
          recipient.email,
        )
      ) {
        next.recipientEmail =
          "Email người nhận chưa đúng định dạng.";
      }
    }

    const selectedMethod =
      checkoutPreviewPage
        .paymentMethods
        .find(
          (method) =>
            method.id ===
            paymentMethod,
        );

    if (
      !selectedMethod ||
      !selectedMethod.enabled
    ) {
      next.paymentMethod =
        "Hãy chọn phương thức thanh toán.";
    }

    if (!acceptTerms) {
      next.acceptTerms =
        "Bạn cần đồng ý với điều khoản trước khi tiếp tục.";
    }

    return next;
  }

  function submit() {
    const nextErrors =
      validate();

    setErrors(
      nextErrors,
    );

    if (
      Object.keys(
        nextErrors,
      ).length >
      0
    ) {
      return;
    }

    setSubmitting(
      true,
    );

    const recipientEmail =
      recipient
        .sendToAnotherPerson
        ? recipient.email
            .trim()
        : customer.email
            .trim();

    window.setTimeout(
      () => {
        setResult({
          orderCode:
            createDemoOrderCode(),

          customerEmail:
            customer.email
              .trim(),

          recipientEmail,

          paymentMethod,

          total:
            checkoutPreviewPage
              .totals
              .total,
        });

        setSubmitting(
          false,
        );

        window.scrollTo({
          top:
            0,
          behavior:
            "smooth",
        });
      },
      450,
    );
  }

  function reset() {
    setResult(
      undefined,
    );

    setErrors(
      {},
    );

    setSubmitting(
      false,
    );

    setAcceptTerms(
      false,
    );
  }

  return (
    <CheckoutPageComposition
      page={
        checkoutPreviewPage
      }
      customer={
        customer
      }
      recipient={
        recipient
      }
      paymentMethod={
        paymentMethod
      }
      acceptTerms={
        acceptTerms
      }
      errors={
        errors
      }
      submitting={
        submitting
      }
      result={
        result
      }
      onCustomerChange={(
        value,
      ) => {
        setCustomer(
          value,
        );

        setErrors(
          (current) => ({
            ...current,

            customerFullName:
              undefined,

            customerEmail:
              undefined,

            customerPhone:
              undefined,
          }),
        );
      }}
      onRecipientChange={(
        value,
      ) => {
        setRecipient(
          value,
        );

        setErrors(
          (current) => ({
            ...current,

            recipientFullName:
              undefined,

            recipientEmail:
              undefined,
          }),
        );
      }}
      onPaymentMethodChange={(
        value,
      ) => {
        setPaymentMethod(
          value,
        );

        setErrors(
          (current) => ({
            ...current,

            paymentMethod:
              undefined,
          }),
        );
      }}
      onAcceptTermsChange={(
        value,
      ) => {
        setAcceptTerms(
          value,
        );

        setErrors(
          (current) => ({
            ...current,

            acceptTerms:
              undefined,
          }),
        );
      }}
      onSubmit={
        submit
      }
      onReset={
        reset
      }
    />
  );
}
