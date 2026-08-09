# F06.1C — GPay Virtual Account Portal Acceptance

## Acceptance status

Status: ACCEPTED
Environment: GPay Sandbox / YSim Sandbox
Acceptance date: 2026-07-29

## Source baseline

Baseline commit:

a552888fc23e534e75eda59d4d143880f94a45c3

Baseline tag:

f06-1b-1-fast-ack-durable-fulfillment-r5-1-sandbox-e2e-accepted

## GPay Developer Portal

Service:

Dịch vụ hỗ trợ thu hộ — Virtual Account

Portal status:

Đã hoàn thành

Acceptance coverage:

- Successful test cases: completed
- Failure test cases: completed
- GPay confirmation email: received
- Portal acceptance status: completed

The dashboard total is 19/29 because the separate payout service
"Dịch vụ hỗ trợ chi hộ" is not part of this acceptance scope.

## End-to-end acceptance order

WooCommerce order ID:

3887

Payment method:

gpay_virtual_account

Payment result:

- GPay webhook HTTP 200
- Provider confirmed: true
- Reconciliation state: succeeded
- Next attempt: null
- Payment status: SUCCESS
- Transaction ID present: true

Fulfillment result:

- Gigago webhook HTTP 200
- Fulfillment completed
- WooCommerce order status: completed

Mail result:

Customer:

- status: sent
- attempts: 1
- error: none

Administrator:

- status: sent
- attempts: 1
- error: none

## Security and operational evidence

- Unified GPay webhook used
- Invalid signatures rejected by regression tests
- Fast ACK enabled
- Durable reconciliation enabled
- Canonical and flat reconciliation state converged
- Webhook tokens excluded from Nginx access logs
- Duplicate mail delivery not observed

## Acceptance decision

The GPay Virtual Account sandbox integration and Developer Portal
acceptance are complete.

The integration is ready to proceed to the remaining pre-go-live
workstreams:

1. Internationalization and multi-currency foundation
2. OnePay card payment integration
3. Combined regression testing
4. Production readiness and go-live
