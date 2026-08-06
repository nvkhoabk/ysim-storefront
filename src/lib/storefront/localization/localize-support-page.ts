import { createSupportUiCopy } from "@/i18n/support/support.config";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import type { SupportPageViewModel } from "@/types/view-models/support";

export function localizeSupportPageViewModel(
  page: SupportPageViewModel,
  locale: ShellLocale,
): SupportPageViewModel {
  const copy = createSupportUiCopy(locale);
  const localizedHref = (href: string) =>
    href.startsWith("/") ? localizeShellHref(href, locale) : href;

  return {
    ...page,
    hero: {
      ...page.hero,
      eyebrow: copy.hero.eyebrow,
      title: copy.hero.title,
      highlightedText: copy.hero.highlight,
      description: copy.hero.description,
      benefits: page.hero.benefits?.map((benefit, index) => ({
        ...benefit,
        label: copy.hero.benefits[index] ?? benefit.label,
      })),
      media: page.hero.media
        ? { ...page.hero.media, alt: copy.hero.mediaAlt }
        : page.hero.media,
    },
    topics: page.topics.map((topic) => ({
      ...topic,
      ...(copy.topics[topic.id] ?? {}),
      href: localizedHref(topic.href),
    })),
    devices: page.devices.map((device) => {
      const statusCopy = copy.status[device.status];
      return {
        ...device,
        statusLabel: statusCopy?.title ?? device.statusLabel,
        description: statusCopy?.description ?? device.description,
        notes: copy.deviceNotes,
      };
    }),
    manualChecks: page.manualChecks.map((step, index) => ({
      ...step,
      ...(copy.manualChecks[index] ?? {}),
    })),
    faqs: page.faqs.map((faq) => ({
      ...faq,
      ...(copy.faqs[faq.id] ?? {}),
    })),
    contacts: page.contacts.map((contact) => {
      const copyId = contact.id.replace(/^production-/u, "");
      return {
        ...contact,
        ...(copy.contacts[copyId] ?? {}),
        href: localizedHref(contact.href),
      };
    }),
  };
}
