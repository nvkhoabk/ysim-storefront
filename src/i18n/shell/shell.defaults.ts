// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

import { shellMessagesVi } from "./messages/vi";
import type { LocalizedShellLabels } from "./shell.types";

export const DEFAULT_LOCALIZED_SHELL_LABELS: LocalizedShellLabels = {
  ...shellMessagesVi.labels,
  quickAccessPopular: shellMessagesVi.quickAccess.popular,
};
