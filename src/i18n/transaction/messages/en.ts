// F07A-2D-1_LOCALIZED_TRANSACTION_CANDIDATE_R1

import type { TransactionMessages } from "../transaction.types";

export const transactionMessagesEn: TransactionMessages = {
  "preview.title": "Localized transaction flow",
  "preview.description":
    "A candidate interface for Cart, Checkout, Payment Status, and Order Result.",
  "preview.candidate":
    "Enabled only in UI preview; production transaction routes remain unchanged.",
  "preview.sourceMoney":
    "Prices and totals below are source VND data and are not converted to {currency}.",
  "preview.noMutation":
    "The candidate does not submit forms, call payment providers, or mutate cart, order, or fulfillment data.",
  "tabs.cart": "Cart",
  "tabs.checkout": "Checkout details",
  "tabs.payment": "Payment",
  "tabs.orderResult": "Order result",
  "common.sourceNotice":
    "Source product data and amounts are preserved pending catalog and currency localization policies.",
  "common.previewOnly": "Illustrative data only; no real transaction occurs.",
  "common.quantity": "Quantity",
  "common.unitPrice": "Source unit price",
  "common.lineTotal": "Source line total",
  "common.subtotal": "Source subtotal",
  "common.total": "Source total",
  "common.currency": "Source currency",
  "common.continue": "Continue",
  "common.back": "Back",
  "common.status": "Status",
  "common.reference": "Reference",
  "common.provider": "Provider",
  "common.notAvailable": "Not available",
  "common.loading": "Loading status…",
  "common.error": "Status could not be loaded.",
  "common.retry": "Try again",
  "cart.eyebrow": "YSim cart",
  "cart.title": "Review packages before checkout",
  "cart.description":
    "Confirm products, quantities, and source totals before entering recipient details.",
  "cart.emptyTitle": "Your cart is empty",
  "cart.emptyDescription":
    "Choose an eSIM package from the catalog to continue.",
  "cart.sourceTitle": "Source title: {title}",
  "cart.checkoutAction": "Continue to checkout details",
  "cart.removeDisabled": "Item removal is disabled in this candidate.",
  "checkout.eyebrow": "Customer details",
  "checkout.title": "Enter eSIM delivery information",
  "checkout.description":
    "The fields below are disabled so the preview cannot submit data.",
  "checkout.contactTitle": "Contact details",
  "checkout.emailLabel": "eSIM delivery email",
  "checkout.emailPlaceholder": "customer@example.com",
  "checkout.phoneLabel": "Phone number",
  "checkout.phonePlaceholder": "+84 9xx xxx xxx",
  "checkout.recipientTitle": "eSIM recipient",
  "checkout.fullNameLabel": "Full name",
  "checkout.fullNamePlaceholder": "Nguyen Van A",
  "checkout.noteLabel": "Order note",
  "checkout.notePlaceholder": "Optional support request",
  "checkout.summaryTitle": "Order summary",
  "checkout.paymentAction": "Continue to payment",
  "checkout.disabledNotice":
    "Checkout submission is disabled in this candidate.",
  "payment.eyebrow": "Payment methods",
  "payment.title": "Choose a payment method",
  "payment.description":
    "Methods are displayed for localization review and do not initialize a transaction.",
  "payment.gpayTitle": "GPay QR",
  "payment.gpayDescription": "Pay by bank QR through GPay.",
  "payment.onepayTitle": "OnePay",
  "payment.onepayDescription": "Pay by international card through OnePay.",
  "payment.manualTitle": "Manual bank transfer",
  "payment.manualDescription":
    "An operator confirms the transaction under the operating process.",
  "payment.pendingTitle": "Illustrative status",
  "payment.pendingStatus": "Waiting for payment",
  "payment.createAction": "Create payment request",
  "payment.disabledNotice":
    "Payment initialization is disabled in this candidate.",
  "order.eyebrow": "Order result",
  "order.title": "The order has been recorded",
  "order.description":
    "This result page illustrates payment, fulfillment, and eSIM delivery states.",
  "order.codeLabel": "Order code",
  "order.paymentTitle": "Payment",
  "order.paymentStatus": "Confirmed in fixture",
  "order.fulfillmentTitle": "Fulfillment",
  "order.fulfillmentStatus": "Preparing eSIM in fixture",
  "order.deliveryTitle": "eSIM delivery",
  "order.deliveryStatus": "Waiting for delivery via {channel}",
  "order.securityNotice":
    "Real eSIM QR and activation data are not included in this candidate.",
  "order.startAgain": "Return to cart",
  "labels.preview": "Localized transaction candidate",
  "labels.tabs": "Choose transaction step",
  "labels.cartItems": "Cart item list",
  "labels.orderSummary": "Source amount summary",
  "labels.checkoutFields": "Illustrative checkout fields",
  "labels.paymentMethods": "Illustrative payment methods",
  "labels.orderTimeline": "Illustrative order timeline",
  "labels.localeNavigation": "Select preview language",
};
