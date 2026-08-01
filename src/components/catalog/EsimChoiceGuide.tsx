"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import styles from "./EsimDestinationExplorer.module.css";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createListingTranslator } from "@/i18n/listing/listing.registry";
import { localizeShellHref } from "@/i18n/shell/shell.href";

export function EsimChoiceGuide() {
  const { locale } = useStorefrontLocale();
  const t = createListingTranslator(locale);
  const steps = [
    {
      number: 1,
      title: t("ordinary.choiceDestinationTitle"),
      description: t("ordinary.choiceDestinationDescription"),
    },
    {
      number: 2,
      title: t("ordinary.choiceDurationTitle"),
      description: t("ordinary.choiceDurationDescription"),
    },
    {
      number: 3,
      title: t("ordinary.choiceDataTitle"),
      description: t("ordinary.choiceDataDescription"),
    },
  ] as const;
  return (
    <section
      aria-labelledby="esim-choice-guide-title"
      className={styles.choiceGuide}
    >
      <div className={styles.choiceIntro}>
        <h2 id="esim-choice-guide-title" className={styles.choiceIntroTitle}>
          {t("ordinary.choiceTitle")}
        </h2>

        <p className={styles.choiceIntroDescription}>
          {t("ordinary.choiceDescription")}
        </p>
      </div>

      {steps.map((step) => (
        <article key={step.number} className={styles.stepCard}>
          <span className={styles.stepNumber}>{step.number}</span>

          <h3 className={styles.stepTitle}>{step.title}</h3>

          <p className={styles.stepDescription}>{step.description}</p>
        </article>
      ))}

      <Link
        href={localizeShellHref("/destinations", locale)}
        className={styles.choiceCta}
      >
        {t("ordinary.choiceAction")}

        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}
