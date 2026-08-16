# F07 Production Payment Core Hardening R1

## Purpose

Close the remaining production-readiness gaps after
`F07-PRD-SRC-003A-R2` without enabling fulfillment, Gigago, or customer email.

## Crash-safe operation locks

The VA creation lock and payment-recording lock use the same durable local
filesystem primitive. A stale lock is reclaimed only when both conditions are
true:

- its age exceeds the configured stale threshold; and
- its recorded owner PID no longer exists.

Malformed locks, live owners, permission uncertainty, and unexpected process
errors fail closed. Every lock-path create or release first publishes a unique
mutation intent. Stale recovery acquires an exclusive sidecar recovery gate,
waits for pre-existing intents to drain, then re-reads and quarantines the stale
lock. New contenders cannot mutate the resource path while that gate exists,
so a second stale reclaimer cannot unlink a newer lock created by the first.
An orphaned or malformed recovery gate is not reclaimed automatically; it
fails closed for operator inspection.

After a stale VA-create lock is reclaimed, the WooCommerce `creating` and
`uncertain` states are still authoritative. They block a second provider create
call and require operator reconciliation.

## Cross-process payment idempotency

Every eligible GPay commerce automation run now acquires an order-scoped lock
before it re-reads WooCommerce and writes the paid state. The former in-memory
`inFlight` map has been removed because it could neither coordinate PM2 workers
nor distinguish two different transaction IDs for the same order.

Inside the locked region:

- an unpaid order can be recorded paid exactly once;
- the same provider transaction on an already-paid order is a duplicate and
  cannot run fulfillment again;
- a different transaction on an already-paid order is written only to manual
  review metadata and cannot replace the original transaction;
- lock timeout responses are non-acknowledging `503` responses so the provider
  can retry instead of losing the callback.

## Dependency security patch

The release moves Next.js from `16.2.10` to the Active LTS security patch
`16.2.11`. Overrides pin patched transitive versions used in production:

```text
nanoid=3.3.18
postcss=8.5.26
sharp=0.35.3
```

The package is acceptable only when `npm audit --omit=dev` reports zero known
vulnerabilities and the full application build succeeds.

## Preserved execution boundary

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
