import {
  productionSupportDevices,
} from "@/config/storefront-production-support";

import type {
  DeviceCompatibilityViewModel,
} from "@/types/view-models/support";

import type {
  SupportDeviceGateway,
} from "@/types/view-models/support-production";

export function createConfiguredSupportDeviceGateway():
  SupportDeviceGateway {
  return {
    async load():
      Promise<
        readonly DeviceCompatibilityViewModel[]
      > {
      return productionSupportDevices;
    },
  };
}
