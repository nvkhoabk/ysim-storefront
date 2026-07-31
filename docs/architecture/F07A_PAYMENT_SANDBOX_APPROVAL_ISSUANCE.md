# F07A-3O — Payment Sandbox Approval Issuance Candidate

F07A-3O consumes the accepted F07A-3N approval candidate and prepares a preview-only approval issuance packet.

The packet remains unsigned, unsubmitted, and unpersisted. Approval records, approval tokens, activation tokens, provider requests, settlement instructions, and registry mutations remain absent.

Preview route: `/ui-preview/payment-sandbox-approval-issuance` with views `issuance`, `eligibility`, `issuance-envelope`, and `audit`.
