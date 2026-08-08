# F07 Production Payment Core Correction R1

## Purpose

Restore the real Storefront checkout flow while preserving controls that protect
money, order identity, and downstream delivery.

## Removed deployment scaffolding

- Wave 1 canary mode, pinned order, pinned amount, and budget file.
- Public checkout blocking while the canary was armed.
- Wave-specific payment route allowlist.
- Coupling between checkout availability and unrelated deferred flags.

The obsolete `YSIM_WAVE1_GPAY_VA_CANARY_*` variables have no runtime effect
after this correction and should be removed from the production environment.

## Preserved production controls

- `PAYMENT_EXECUTION_ENABLED` remains the payment kill switch.
- `GPAY_ENABLED` remains the GPay provider switch.
- `GPAY_VA_ENABLED` is now required explicitly for every VA provider call and
  VA route.
- Fulfillment, Gigago, customer email, scheduler, agency top-up, and payment
  ownership remain independently gated.
- Payment creation still derives amount, currency, order key, and customer
  identity from the WooCommerce order rather than trusting the browser.
- The VA webhook still requires the GPay signature, order reference, VA account,
  exact amount, and provider transaction ID to match before recording payment.

## Durable VA creation idempotency

VA creation now acquires one atomic cross-process lock per WooCommerce order.
The production lock directory is:

```text
/var/www/ysim.vn/storefront/shared/state/gpay-va-create-locks
```

The lock is acquired before the `creating` metadata transition and before the
GPay create call. A concurrent request fails with
`GPAY_VA_CREATE_IN_PROGRESS`. An uncertain provider response remains fail-closed
and requires operator review instead of an automatic second VA creation.

## Payment evidence semantics

`VA status = OPEN` only proves that a virtual account exists; it is no longer
treated as evidence that money was received.

For the GPay VA `CHANGE_BALANCE` contract, payment evidence is the signed
webhook combined with all of the following matches:

- provider transaction ID is present;
- WooCommerce order reference matches;
- VA account number matches the order metadata;
- received amount exactly matches the WooCommerce total;
- normalized callback state is successful.

A repeated callback with the same transaction ID is acknowledged as a
duplicate. A different transaction received for an already-paid order is
acknowledged but placed in manual review without replacing the original paid
transaction.

## Initial production boundary

```text
PAYMENT_EXECUTION_ENABLED=true
GPAY_ENABLED=true
GPAY_VA_ENABLED=true
GPAY_COMMERCE_AUTOMATION_MODE=record

FULFILLMENT_EXECUTION_ENABLED=false
GIGAGO_ENABLED=false
CUSTOMER_EMAIL_DELIVERY_ENABLED=false
SCHEDULER_ENABLED=false
```

This boundary permits checkout, VA creation, signed payment recording, and no
supplier order or customer delivery.
