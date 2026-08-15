# F07 GPay VA durable-before-commerce corrective R3

## Runtime finding from sandbox order 6405

The signed Virtual Account webhook recorded payment and created exactly one
Gigago order. Gigago returned `Processing`, but WooCommerce had no parseable
`_ysim_gpay_reconciliation_job`. This proves that R2 still left a failure
window: it ran commerce before persisting the continuation job.

The signed-VA eligibility predicate itself matches the production
`reconcileVerifiedGPayVAWebhook` result. The defect is therefore the ordering
boundary, not the signed callback identity checks.

## Corrective contract

For a verified and fully bound signed VA success callback, the webhook now uses
the existing fast-ACK durability path even when the optional query fast-ACK
feature flag is false:

1. record payment only;
2. persist a `provider-confirmed` reconciliation job to WooCommerce;
3. acknowledge the callback;
4. schedule commerce after the durable write;
5. create a Gigago order only when the durable job has no prior submission
   evidence;
6. when Gigago is `Processing`, persist `pending-fulfillment` and continue with
   status-only polling against the existing request ID;
7. never call `submitGigagoFulfillment` or `createPartnerOrder` from the
   pending-fulfillment polling function.

The existing query-based fast-ACK path remains controlled by
`GPAY_FAST_ACK_ENABLED`. Signed VA durability is mandatory because the signed
callback is already the payment confirmation boundary.

## Acceptance

A new sandbox VA order is acceptable only when evidence shows:

- reconciliation job exists before the first Gigago submit;
- exactly one Gigago request and agency order are recorded;
- `Processing` transitions to `pending-fulfillment`;
- later attempts are status-only;
- delivery snapshot becomes `ready` with one eSIM;
- customer email is sent exactly once;
- WooCommerce becomes `completed`;
- reconciliation becomes `succeeded` with terminal delivery evidence.

Sandbox order 6405 is not a fresh acceptance order. It may only be recovered by
status polling against its existing Gigago request; it must never be submitted
again.
