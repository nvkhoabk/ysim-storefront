// F07A-2A_STATIC_LOCALIZATION_R1

"use client";

import { useContext } from "react";
import { I18nContext } from "./I18nProvider";
import type { TranslationFunction } from "./i18n.types";

export function useTranslations(): TranslationFunction {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("I18N_PROVIDER_REQUIRED");
  }
  return context.t;
}
