"use client";

import Link from "next/link";

import {
  Mail,
  MessageCircle,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";

import { Container, Section, SectionHeader } from "@/components/layout";

import type {
  SupportContactChannelViewModel,
  SupportContactIcon,
} from "@/types/view-models/support";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createSupportUiCopy } from "@/i18n/support/support.config";

const iconMap: Record<SupportContactIcon, LucideIcon> = {
  email: Mail,

  chat: MessageCircle,

  telegram: Send,

  phone: Phone,
};

export interface SupportContactChannelsProps {
  channels: readonly SupportContactChannelViewModel[];
}

export function SupportContactChannels({
  channels,
}: SupportContactChannelsProps) {
  const { locale } = useStorefrontLocale();
  const copy = createSupportUiCopy(locale);

  return (
    <Section id="contact" variant="subtle">
      <Container>
        <SectionHeader
          eyebrow={copy.sections.contactsEyebrow}
          title={copy.sections.contactsTitle}
          description={copy.sections.contactsDescription}
          align="center"
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {channels.map((channel) => {
            const Icon = iconMap[channel.icon];

            return (
              <article
                key={channel.id}
                className="flex h-full flex-col rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 text-center shadow-[var(--ysim-shadow-sm)]"
              >
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                  <Icon className="h-6 w-6" />
                </span>

                <h2 className="mt-5 text-lg font-bold text-[var(--ysim-color-text)]">
                  {channel.title}
                </h2>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                  {channel.description}
                </p>

                {channel.availability ? (
                  <p className="mt-4 text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                    {channel.availability}
                  </p>
                ) : null}

                <Link
                  href={channel.href}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-4 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]"
                >
                  {channel.actionLabel}
                </Link>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
