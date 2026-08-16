"use client";

import { useMemo } from "react";

import { useStorefrontLocale } from "../runtime";
import { createTransactionTranslator } from "./transaction.registry";

export function useTransactionTranslations() {
  const { locale } = useStorefrontLocale();
  return useMemo(() => createTransactionTranslator(locale), [locale]);
}
