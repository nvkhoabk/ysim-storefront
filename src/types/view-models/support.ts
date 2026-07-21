import type {
  HeroViewModel,
} from "@/types/view-models/hero";

export type SupportTopicIcon =
  | "installation"
  | "device"
  | "payment"
  | "order";

export type DeviceCompatibilityStatus =
  | "supported"
  | "conditional"
  | "unsupported";

export type DevicePlatform =
  | "ios"
  | "android";

export type SupportContactIcon =
  | "email"
  | "chat"
  | "telegram"
  | "phone";

export interface SupportTopicViewModel {
  id: string;
  title: string;
  description: string;
  href: string;
  icon:
    SupportTopicIcon;
}

export interface DeviceCompatibilityViewModel {
  id: string;
  brand: string;
  model: string;
  platform:
    DevicePlatform;
  status:
    DeviceCompatibilityStatus;
  statusLabel: string;
  description: string;
  notes:
    readonly string[];
}

export interface DeviceManualCheckViewModel {
  step: number;
  title: string;
  description: string;
}

export interface SupportFaqViewModel {
  id: string;
  question: string;
  answer: string;
}

export interface SupportContactChannelViewModel {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  icon:
    SupportContactIcon;
  availability?: string;
}

export interface SupportPageViewModel {
  hero:
    HeroViewModel;
  topics:
    readonly SupportTopicViewModel[];
  devices:
    readonly DeviceCompatibilityViewModel[];
  manualChecks:
    readonly DeviceManualCheckViewModel[];
  faqs:
    readonly SupportFaqViewModel[];
  contacts:
    readonly SupportContactChannelViewModel[];
}
