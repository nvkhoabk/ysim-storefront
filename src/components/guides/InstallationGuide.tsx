"use client";

import Image from "next/image";

import {
  ChevronDown,
  MoveRight,
} from "lucide-react";

import { useState } from "react";

import type {
  InstallationGuideStep,
} from "@/content/guides/installation";

export interface InstallationGuideProps {
  steps: InstallationGuideStep[];

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function InstallationGuide({
  steps,
  className,
}: InstallationGuideProps) {
  const [
    activeStep,
    setActiveStep,
  ] = useState<number | null>(null);

  const toggleStep = (stepId: number) => {
    setActiveStep((current) =>
      current === stepId ? null : stepId,
    );
  };

  return (
    <section
      id="installation"
      aria-labelledby="installation-guide-title"
      className={joinClasses(
        "bg-white",
        className,
      )}
    >
      <div className="mb-6">
        <h2
          id="installation-guide-title"
          className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
        >
          Hướng dẫn cài đặt eSIM
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Chỉ với 3 bước đơn giản để kết nối Internet ngay lập tức.
        </p>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)_48px_minmax(0,1fr)] items-stretch">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="contents"
            >
              <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="px-5 pb-4 pt-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
                      {step.id}
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-950">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative mt-auto min-h-[210px] overflow-hidden bg-gradient-to-b from-white to-slate-50">
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    fill
                    sizes="(max-width: 1200px) 30vw, 360px"
                    className="object-contain object-bottom px-5 pt-3"
                  />
                </div>
              </article>

              {index < steps.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center text-slate-400"
                >
                  <MoveRight className="h-6 w-6" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-3 lg:hidden">
        {steps.map((step) => {
          const expanded =
            activeStep === step.id;

          return (
            <article
              key={step.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`installation-step-${step.id}`}
                onClick={() =>
                  toggleStep(step.id)
                }
                className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                  {step.id}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-950">
                    {step.title}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-600">
                    {step.description}
                  </span>
                </span>

                <ChevronDown
                  aria-hidden="true"
                  className={joinClasses(
                    "mt-1 h-4 w-4 shrink-0 text-slate-500 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </button>

              {expanded ? (
                <div
                  id={`installation-step-${step.id}`}
                  className="border-t border-slate-100 px-4 pb-4 pt-3"
                >
                  <div className="relative h-44 overflow-hidden rounded-xl bg-slate-50">
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      fill
                      sizes="100vw"
                      className="object-contain object-bottom"
                    />
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}