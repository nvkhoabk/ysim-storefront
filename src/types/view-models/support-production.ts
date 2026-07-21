import type {
  DeviceCompatibilityViewModel,
  SupportContactChannelViewModel,
  SupportFaqViewModel,
} from "@/types/view-models/support";

export interface SupportFaqGateway {
  load():
    Promise<
      readonly SupportFaqViewModel[]
    >;
}

export interface SupportDeviceGateway {
  load():
    Promise<
      readonly DeviceCompatibilityViewModel[]
    >;
}

export interface SupportContactGateway {
  load():
    Promise<
      readonly SupportContactChannelViewModel[]
    >;
}

export interface WordPressSupportFaqSource {
  id?:
    | string
    | number;
  slug?: string;
  title?:
    | string
    | {
        rendered?: string;
      };
  question?: string;
  content?:
    | string
    | {
        rendered?: string;
      };
  answer?: string;
  excerpt?:
    | string
    | {
        rendered?: string;
      };
}
