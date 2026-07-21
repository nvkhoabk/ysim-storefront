import {
  createProductionSupportContactsFromEnvironment,
} from "@/config/storefront-production-support";

import type {
  SupportContactChannelViewModel,
} from "@/types/view-models/support";

import type {
  SupportContactGateway,
} from "@/types/view-models/support-production";

export function createEnvironmentSupportContactGateway():
  SupportContactGateway {
  return {
    async load():
      Promise<
        readonly SupportContactChannelViewModel[]
      > {
      return createProductionSupportContactsFromEnvironment();
    },
  };
}
