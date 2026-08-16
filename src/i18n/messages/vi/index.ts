// F07A-2A_STATIC_LOCALIZATION_R1

import type { LocaleMessages } from "../../i18n.types";
import { commonMessages } from "./common";
import { marketMessages } from "./market";
import { navigationMessages } from "./navigation";
import { validationMessages } from "./validation";

export const messages = {
  common: commonMessages,
  navigation: navigationMessages,
  market: marketMessages,
  validation: validationMessages,
} as const satisfies LocaleMessages;
