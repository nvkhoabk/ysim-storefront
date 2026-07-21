import {
  supportPreviewPage,
} from "@/config/storefront-support-preview";

import type {
  SupportPageViewModel,
} from "@/types/view-models/support";

import type {
  SupportRouteDataAdapter,
} from "./support-route-adapter";

export function createFixtureSupportRouteAdapter():
  SupportRouteDataAdapter {
  return {
    id:
      "fixture-support-route-adapter",

    async load():
      Promise<
        SupportPageViewModel
      > {
      return supportPreviewPage;
    },

    getDiagnostics() {
      return [
        {
          domain:
            "topics" as const,
          label:
            "Support topics",
          status:
            "fixture" as const,
          statusLabel:
            "Fixture",
          message:
            `${supportPreviewPage.topics.length} nhóm hỗ trợ từ Package 16.`,
          itemCount:
            supportPreviewPage.topics.length,
        },
        {
          domain:
            "devices" as const,
          label:
            "Device compatibility",
          status:
            "fixture" as const,
          statusLabel:
            "Fixture",
          message:
            `${supportPreviewPage.devices.length} thiết bị mẫu; chưa phải dataset chính thức.`,
          itemCount:
            supportPreviewPage.devices.length,
        },
        {
          domain:
            "faq" as const,
          label:
            "FAQ",
          status:
            "fixture" as const,
          statusLabel:
            "Fixture",
          message:
            `${supportPreviewPage.faqs.length} FAQ từ config preview.`,
          itemCount:
            supportPreviewPage.faqs.length,
        },
        {
          domain:
            "contacts" as const,
          label:
            "Contact channels",
          status:
            "fixture" as const,
          statusLabel:
            "Fixture",
          message:
            `${supportPreviewPage.contacts.length} kênh liên hệ preview; chưa kích hoạt action thật.`,
          itemCount:
            supportPreviewPage.contacts.length,
        },
      ];
    },
  };
}
