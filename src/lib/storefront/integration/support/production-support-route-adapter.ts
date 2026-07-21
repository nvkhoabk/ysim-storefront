import {
  supportPreviewPage,
} from "@/config/storefront-support-preview";

import type {
  SupportPageViewModel,
} from "@/types/view-models/support";

import type {
  SupportContactGateway,
  SupportDeviceGateway,
  SupportFaqGateway,
} from "@/types/view-models/support-production";

import type {
  SupportRouteDiagnosticViewModel,
} from "@/types/view-models/support-route-candidate";

import type {
  SupportRouteDataAdapter,
} from "./support-route-adapter";

export interface ProductionSupportRouteAdapterOptions {
  faqGateway:
    SupportFaqGateway;
  deviceGateway:
    SupportDeviceGateway;
  contactGateway:
    SupportContactGateway;
}

function errorMessage(
  error: unknown,
): string {
  return error instanceof
    Error
    ? error.message
    : String(
        error,
      );
}

export function createProductionSupportRouteAdapter({
  faqGateway,
  deviceGateway,
  contactGateway,
}: ProductionSupportRouteAdapterOptions):
  SupportRouteDataAdapter {
  let diagnostics:
    SupportRouteDiagnosticViewModel[] = [];

  return {
    id:
      "production-support-route-adapter",

    async load():
      Promise<
        SupportPageViewModel
      > {
      diagnostics = [
        {
          domain:
            "topics",
          label:
            "Support topics",
          status:
            "live",
          statusLabel:
            "Configured",
          message:
            `${supportPreviewPage.topics.length} nhóm hỗ trợ từ presentation config.`,
          itemCount:
            supportPreviewPage.topics.length,
        },
      ];

      const [
        faqResult,
        deviceResult,
        contactResult,
      ] =
        await Promise.allSettled([
          faqGateway.load(),
          deviceGateway.load(),
          contactGateway.load(),
        ]);

      const faqs =
        faqResult.status ===
          "fulfilled" &&
        faqResult.value.length >
          0
          ? faqResult.value
          : supportPreviewPage
              .faqs;

      if (
        faqResult.status ===
          "fulfilled" &&
        faqResult.value.length >
          0
      ) {
        diagnostics.push({
          domain:
            "faq",
          label:
            "WordPress FAQ",
          status:
            "live",
          statusLabel:
            "Live",
          message:
            `${faqResult.value.length} FAQ đã được tải từ WordPress.`,
          itemCount:
            faqResult.value.length,
        });
      } else {
        diagnostics.push({
          domain:
            "faq",
          label:
            "WordPress FAQ",
          status:
            "fallback",
          statusLabel:
            "Fallback",
          message:
            faqResult.status ===
              "rejected"
              ? `Không tải được FAQ: ${errorMessage(
                  faqResult.reason,
                )}`
              : "WordPress chưa có FAQ phù hợp; dùng fixture đã review.",
          itemCount:
            supportPreviewPage
              .faqs.length,
        });
      }

      const devices =
        deviceResult.status ===
          "fulfilled" &&
        deviceResult.value.length >
          0
          ? deviceResult.value
          : supportPreviewPage
              .devices;

      if (
        deviceResult.status ===
          "fulfilled" &&
        deviceResult.value.length >
          0
      ) {
        diagnostics.push({
          domain:
            "devices",
          label:
            "Device dataset",
          status:
            "live",
          statusLabel:
            "Configured",
          message:
            `${deviceResult.value.length} thiết bị từ production-configured dataset.`,
          itemCount:
            deviceResult.value.length,
        });
      } else {
        diagnostics.push({
          domain:
            "devices",
          label:
            "Device dataset",
          status:
            "fallback",
          statusLabel:
            "Fallback",
          message:
            deviceResult.status ===
              "rejected"
              ? `Không tải được dataset: ${errorMessage(
                  deviceResult.reason,
                )}`
              : "Dataset production rỗng; dùng fixture Package 16.",
          itemCount:
            supportPreviewPage
              .devices.length,
        });
      }

      const contacts =
        contactResult.status ===
          "fulfilled" &&
        contactResult.value.length >
          0
          ? contactResult.value
          : supportPreviewPage
              .contacts;

      if (
        contactResult.status ===
          "fulfilled" &&
        contactResult.value.length >
          0
      ) {
        diagnostics.push({
          domain:
            "contacts",
          label:
            "Contact channels",
          status:
            "live",
          statusLabel:
            "Configured",
          message:
            `${contactResult.value.length} kênh liên hệ hợp lệ từ environment.`,
          itemCount:
            contactResult.value.length,
        });
      } else {
        diagnostics.push({
          domain:
            "contacts",
          label:
            "Contact channels",
          status:
            "fallback",
          statusLabel:
            "Fallback",
          message:
            contactResult.status ===
              "rejected"
              ? `Không tạo được contact config: ${errorMessage(
                  contactResult.reason,
                )}`
              : "Chưa có contact URL hợp lệ; dùng fixture Package 16.",
          itemCount:
            supportPreviewPage
              .contacts.length,
        });
      }

      return {
        ...supportPreviewPage,
        faqs,
        devices,
        contacts,
      };
    },

    getDiagnostics() {
      return diagnostics;
    },
  };
}
