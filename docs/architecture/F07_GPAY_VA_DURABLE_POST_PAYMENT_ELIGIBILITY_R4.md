# F07 GPay VA durable post-payment eligibility R4

## Incident evidence

The controlled Sandbox acceptance order reached the WooCommerce paid
postcondition and moved to `processing`, but no durable reconciliation job or
Gigago request was present. The callback metadata proved that the signed VA
path had completed its payment-only `record` step.

The activation window intentionally configured
`GPAY_COMMERCE_ALLOWED_ORDER_STATUSES=pending,on-hold`. After payment was
recorded, durable persistence re-fetched the order and reused the pre-payment
eligibility assertion. That assertion rejected the now-paid `processing`
order before `persistJob()` could write the provider-confirmed durable job.

## Correction

Pre-payment automation keeps the configured status allowlist. Post-payment
durability now uses a separate paid-order identity assertion that requires:

- the exact Woo order ID, number and order key bound into signed `embed_data`;
- a GPay payment provider;
- a paid postcondition (`date_paid`, `date_paid_gmt`, `processing` or
  `completed`);
- the exact VND amount, currency and non-empty line items.

The paid assertion does not reuse the pre-payment status allowlist. It is used
by fast-ACK persistence, immediate-success durability persistence and delayed
commerce resume. The delayed enqueue path remains protected by the original
pre-payment allowlist.

## Safety invariants

- No provider order is created before the durable job is persisted.
- An unpaid pending order cannot pass the paid durability assertion.
- Amount, currency, line items and signed order binding remain mandatory.
- Optional query fast-ACK remains independent from the mandatory signed VA
  durable-before-commerce path.
- This corrective does not activate Sandbox or Production runtime flags.
