import {
  manualPaymentProvider,
} from "./adapters/manual";

import {
  registerPaymentProvider,
} from "./providers";

let initialized = false;

export function initializePaymentProviders(): void {
  if (initialized) {
    return;
  }

  registerPaymentProvider(
    manualPaymentProvider,
  );

  initialized = true;
}