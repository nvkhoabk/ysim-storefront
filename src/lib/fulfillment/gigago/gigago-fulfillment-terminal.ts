export type GigagoFulfillmentTerminalState =
  | "pending"
  | "succeeded"
  | "action-required";

export interface GigagoFulfillmentTerminalEvidence {
  orderStatus: string | null;
  deliveryStatus: string | null;
  deliveryHash: string | null;
  deliveredCount: number;
  customerEmailStatus: string | null;
  customerEmailAttempts: number;
  customerEmailDeliveryHash: string | null;
  mailOrchestrationStatus: string | null;
  mailOrchestrationRequestedHash: string | null;
}

export interface GigagoFulfillmentTerminalAssessment {
  state: GigagoFulfillmentTerminalState;
  terminal: boolean;
  reason: string;
  orderCompleted: boolean;
  deliveryReady: boolean;
  emailSent: boolean;
  emailAttempts: number;
  emailHashMatches: boolean;
  mailOrchestrationCompleted: boolean;
  mailRequestHashMatches: boolean;
}

export type GigagoFulfillmentReplayAction =
  | "record-only"
  | "local-terminal"
  | "status-only"
  | "submit";

export function selectGigagoFulfillmentReplayAction(input: {
  sameTransactionDuplicate: boolean;
  mode: "record" | "fulfill";
  priorSubmissionEvidence: boolean;
  terminalState: GigagoFulfillmentTerminalState;
}): GigagoFulfillmentReplayAction {
  if (!input.sameTransactionDuplicate) {
    return "submit";
  }

  if (input.mode === "record") {
    return "record-only";
  }

  if (input.terminalState === "succeeded") {
    return "local-terminal";
  }

  return input.priorSubmissionEvidence ? "status-only" : "submit";
}

export function shouldPollGigagoProviderForTerminal(
  assessment: GigagoFulfillmentTerminalAssessment,
): boolean {
  return assessment.state === "pending";
}

export function requiresGPayFulfillmentTerminalRevalidation(input: {
  automationMode: string;
  state: string;
  terminal: boolean;
}): boolean {
  return (
    input.automationMode.trim().toLowerCase() === "fulfill" &&
    input.state.trim().toLowerCase() === "succeeded" &&
    input.terminal !== true
  );
}

function normalized(value: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

function validSha256(value: string | null): value is string {
  return /^[a-f0-9]{64}$/.test(value?.trim().toLowerCase() ?? "");
}

export function assessGigagoFulfillmentTerminal(
  evidence: GigagoFulfillmentTerminalEvidence,
): GigagoFulfillmentTerminalAssessment {
  const orderStatus = normalized(evidence.orderStatus);
  const deliveryStatus = normalized(evidence.deliveryStatus);
  const customerEmailStatus = normalized(evidence.customerEmailStatus);
  const mailOrchestrationStatus = normalized(
    evidence.mailOrchestrationStatus,
  );
  const deliveryHash = evidence.deliveryHash?.trim().toLowerCase() ?? "";
  const customerEmailDeliveryHash =
    evidence.customerEmailDeliveryHash?.trim().toLowerCase() ?? "";
  const mailOrchestrationRequestedHash =
    evidence.mailOrchestrationRequestedHash?.trim().toLowerCase() ?? "";
  const orderCompleted = orderStatus === "completed";
  const deliveryReady =
    deliveryStatus === "ready" &&
    validSha256(deliveryHash) &&
    evidence.deliveredCount > 0;
  const emailSent = customerEmailStatus === "sent";
  const emailHashMatches =
    validSha256(deliveryHash) && customerEmailDeliveryHash === deliveryHash;
  const mailOrchestrationCompleted = mailOrchestrationStatus === "completed";
  const mailRequestHashMatches =
    validSha256(deliveryHash) &&
    mailOrchestrationRequestedHash === deliveryHash;
  const base = {
    orderCompleted,
    deliveryReady,
    emailSent,
    emailAttempts: evidence.customerEmailAttempts,
    emailHashMatches,
    mailOrchestrationCompleted,
    mailRequestHashMatches,
  };

  if (["cancelled", "refunded", "failed", "trash"].includes(orderStatus)) {
    return {
      ...base,
      state: "action-required",
      terminal: false,
      reason: "WOO_ORDER_TERMINAL_FAILURE",
    };
  }

  if (evidence.customerEmailAttempts > 1) {
    return {
      ...base,
      state: "action-required",
      terminal: false,
      reason: "CUSTOMER_EMAIL_ATTEMPT_BUDGET_VIOLATED",
    };
  }

  if (
    customerEmailStatus === "failed" ||
    ["failed", "enqueue-failed", "paused"].includes(mailOrchestrationStatus)
  ) {
    return {
      ...base,
      state: "action-required",
      terminal: false,
      reason: "CUSTOMER_EMAIL_ORCHESTRATION_FAILED",
    };
  }

  if (deliveryStatus === "ready" && !validSha256(deliveryHash)) {
    return {
      ...base,
      state: "action-required",
      terminal: false,
      reason: "DELIVERY_HASH_INVALID",
    };
  }

  if (
    emailSent &&
    (evidence.customerEmailAttempts !== 1 || !emailHashMatches)
  ) {
    return {
      ...base,
      state: "action-required",
      terminal: false,
      reason: "CUSTOMER_EMAIL_BINDING_INVALID",
    };
  }

  if (mailOrchestrationCompleted && !mailRequestHashMatches) {
    return {
      ...base,
      state: "action-required",
      terminal: false,
      reason: "MAIL_ORCHESTRATION_BINDING_INVALID",
    };
  }

  if (
    orderCompleted &&
    deliveryReady &&
    emailSent &&
    evidence.customerEmailAttempts === 1 &&
    emailHashMatches &&
    mailOrchestrationCompleted &&
    mailRequestHashMatches
  ) {
    return {
      ...base,
      state: "succeeded",
      terminal: true,
      reason: "FULFILLMENT_EMAIL_COMPLETED_EXACTLY_ONCE",
    };
  }

  return {
    ...base,
    state: "pending",
    terminal: false,
    reason: !deliveryReady
      ? "DELIVERY_NOT_READY"
      : !emailSent
        ? "CUSTOMER_EMAIL_NOT_SENT"
        : !mailOrchestrationCompleted
          ? "MAIL_ORCHESTRATION_NOT_COMPLETED"
          : "WOO_ORDER_NOT_COMPLETED",
  };
}
