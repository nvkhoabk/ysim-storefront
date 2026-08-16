# F07 GPay VA durable fulfillment corrective R2

## Incident reproduced by sandbox order 6404

The signed Virtual Account callback durably recorded payment and submitted one
Gigago order. Gigago returned `Processing`, so the callback returned with the
Woo order still `processing`. No `_ysim_gpay_reconciliation_job` was stored
because the immediate-success durability predicate only accepted gateway
query reconciliation and excluded the already-confirmed signed VA webhook.

## Corrective contract

A signed VA callback is eligible for immediate-success durability only when all
of the following evidence is present:

- the provider signature is verified;
- callback and reconciliation status are both successful;
- a GPay transaction ID is present;
- reconciliation mode is `signed-webhook` and provider kind is
  `virtual-account-webhook`;
- merchant order, VA account, callback status and amount all match;
- reconciliation is explicitly confirmed.

After the immediate commerce attempt, the durable job is written to
WooCommerce before the asynchronous schedule is registered. A provider
`Processing` result becomes `pending-fulfillment`. Its continuation uses
`getGigagoFulfillmentStatus` against the existing request ID and cannot call
`submitGigagoFulfillment` or `createPartnerOrder`.

The existing query-based immediate-success predicate remains unchanged. This
keeps the fast-ACK decision boundary unchanged while adding only the signed VA
durability path required by the incident.

## Sandbox acceptance

Use a new paid sandbox order. The callback must persist a reconciliation job
when Gigago is not yet terminal, and the order must converge automatically to:

- WooCommerce `completed`;
- delivery snapshot `ready` with exactly one delivered eSIM;
- customer fulfillment email `sent` with one attempt;
- mail orchestration `completed`;
- reconciliation terminal state `succeeded` with reason
  `FULFILLMENT_EMAIL_COMPLETED_EXACTLY_ONCE`;
- zero additional provider-create calls during reconciliation.
