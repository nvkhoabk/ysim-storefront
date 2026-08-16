# F07 GPay VA durable commerce resume R5

## Live incident

Sandbox acceptance order reached a durable `provider-confirmed` job, but all
three commerce attempts ended `action-required` before any Gigago request was
created. The order was already paid and `processing`; readiness was `ready`.

The delayed resume performed its paid-order identity check correctly, then
called `runGPayCommerceAutomation()`. That inner function fetched the paid order
again and unconditionally reused the pre-payment status allowlist. A paid
`processing` order therefore failed before the provider submission block.

## Correction

Commerce execution now classifies the fetched WooCommerce order once:

- a paid order uses the paid identity/value contract;
- an unpaid order retains the configured pre-payment status allowlist.

The signed VA route also no longer ACKs a same-transaction replay before the
durability branch. A replay can therefore recreate a missing durable job and
schedule it, while a different transaction against a paid order still enters
manual review.

## Safety invariants

- Unpaid first-payment automation still requires the configured status gate.
- Paid resume still requires exact order binding, amount, currency and items.
- Different-transaction paid replays remain blocked for manual review.
- Durable persistence remains before provider commerce on the signed VA path.
- The corrective does not enable runtime flags or call GPay, Gigago, email or
  WooCommerce during development application and tests.
