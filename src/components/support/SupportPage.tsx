"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  supportContactMethods,
} from "@/content/support/contact";

import {
  supportFaqItems,
} from "@/content/support/faq";

import {
  supportHeroContent,
  supportTopics,
} from "@/content/support/support";

import {
  SiteContainer,
} from "@/components/layout/primitives";

import {
  SupportAvailabilityCard,
} from "./SupportAvailabilityCard";

import {
  SupportBottomCta,
} from "./SupportBottomCta";

import {
  SupportContactPanel,
} from "./SupportContactPanel";

import {
  SupportFaq,
} from "./SupportFaq";

import {
  SupportHero,
} from "./SupportHero";

import {
  SupportTopics,
} from "./SupportTopics";

function normalizeSearchValue(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("vi-VN");
}

export function SupportPage() {
  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const filteredTopics = useMemo(() => {
    const normalizedQuery =
      normalizeSearchValue(searchValue);

    if (!normalizedQuery) {
      return supportTopics;
    }

    return supportTopics.filter(
      (topic) =>
        normalizeSearchValue(
          topic.title,
        ).includes(normalizedQuery) ||
        normalizeSearchValue(
          topic.description,
        ).includes(normalizedQuery),
    );
  }, [searchValue]);

  return (
    <main className="bg-slate-50">
      <section className="py-6 sm:py-8">
        <SiteContainer size="wide">
          <SupportHero
            content={supportHeroContent}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onSearchSubmit={({ query }) => {
              setSearchValue(query);
            }}
          />

          {filteredTopics.length > 0 ? (
            <SupportTopics
              topics={filteredTopics}
            />
          ) : (
            <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <h2 className="text-xl font-bold text-slate-950">
                Chưa tìm thấy chủ đề hỗ trợ
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Hãy thử tìm kiếm bằng một từ khóa khác.
              </p>
            </section>
          )}

          <SupportAvailabilityCard
            className="mt-8 lg:hidden"
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
            <SupportFaq
              items={supportFaqItems}
            />

            <SupportContactPanel
              methods={supportContactMethods}
            />
          </div>

          <SupportBottomCta />
        </SiteContainer>
      </section>
    </main>
  );
}