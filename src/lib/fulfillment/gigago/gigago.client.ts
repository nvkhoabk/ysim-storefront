import { getGigagoConfig, type GigagoConfig } from "./gigago.config";
import { GigagoError } from "./gigago.errors";
import type {
  GigagoAgencyOrder,
  GigagoApiEnvelope,
  GigagoCreateOrderExtra,
  GigagoCreatePartnerOrderInput,
  GigagoDeliveredEsim,
  GigagoOrderQueryInput,
  GigagoPackage,
  GigagoPackageFilters,
} from "./gigago.types";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEnvelope<TResult, TExtra>(
  value: unknown,
): GigagoApiEnvelope<TResult, TExtra> {
  if (
    !isRecord(value) ||
    typeof value.code !== "number" ||
    typeof value.message !== "string" ||
    typeof value.totalRecords !== "number"
  ) {
    throw new GigagoError({
      code: "GIGAGO_RESPONSE_INVALID",
      message: "Gigago trả về payload không đúng cấu trúc envelope.",
      details: value,
    });
  }

  return value as unknown as GigagoApiEnvelope<TResult, TExtra>;
}

function isRejectedMessage(message: string): boolean {
  return /^failed!?$/i.test(message.trim());
}

export class GigagoClient {
  constructor(private readonly config: GigagoConfig = getGigagoConfig()) {}

  private async request<TResult, TExtra = unknown>(
    pathname: string,
    init: RequestInit,
  ): Promise<GigagoApiEnvelope<TResult, TExtra>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.config.baseUrl}${pathname}`, {
        ...init,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          apiKey: this.config.apiKey,
          ...init.headers,
        },
        cache: "no-store",
        signal: controller.signal,
      });

      const text = await response.text();
      let body: unknown = null;

      if (text) {
        try {
          body = JSON.parse(text);
        } catch (error) {
          throw new GigagoError({
            code: "GIGAGO_RESPONSE_INVALID",
            message: "Gigago trả về nội dung không phải JSON hợp lệ.",
            status: response.status,
            details: text.slice(0, 500),
            cause: error,
          });
        }
      }

      if (!response.ok) {
        throw new GigagoError({
          code: "GIGAGO_HTTP_ERROR",
          message: `Gigago HTTP ${response.status}.`,
          status: response.status,
          details: body,
        });
      }

      const envelope = parseEnvelope<TResult, TExtra>(body);

      // Gigago có thể trả HTTP 200 và code 200 nhưng message="failed".
      if (envelope.code !== 200 || isRejectedMessage(envelope.message)) {
        throw new GigagoError({
          code: "GIGAGO_API_REJECTED",
          message: envelope.message || "Gigago từ chối yêu cầu.",
          status: response.status,
          details: envelope,
        });
      }

      return envelope;
    } catch (error) {
      if (error instanceof GigagoError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new GigagoError({
          code: "GIGAGO_TIMEOUT",
          message: `Gigago không phản hồi trong ${this.config.timeoutMs}ms.`,
          cause: error,
        });
      }

      throw new GigagoError({
        code: "GIGAGO_HTTP_ERROR",
        message: "Không thể kết nối tới Gigago.",
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  async getBalance(): Promise<number> {
    const envelope = await this.request<number>("/api/partner/getBalance", {
      method: "GET",
    });

    if (typeof envelope.result !== "number") {
      throw new GigagoError({
        code: "GIGAGO_RESPONSE_INVALID",
        message: "Gigago getBalance không trả về số dư hợp lệ.",
        details: envelope,
      });
    }

    return envelope.result;
  }

  async getPackages(
    filters: GigagoPackageFilters = {},
    languageCode = "vi",
  ): Promise<GigagoPackage[]> {
    const envelope = await this.request<GigagoPackage[]>(
      "/api/partner/getPackages",
      {
        method: "POST",
        body: JSON.stringify({
          columnFilters: filters,
          sort: [],
          page: 0,
          pageSize: 0,
          language_code: languageCode,
        }),
      },
    );

    if (!Array.isArray(envelope.result)) {
      throw new GigagoError({
        code: "GIGAGO_RESPONSE_INVALID",
        message: "Gigago getPackages không trả về danh sách hợp lệ.",
        details: envelope,
      });
    }

    return envelope.result;
  }

  async createPartnerOrder(
    input: GigagoCreatePartnerOrderInput,
  ): Promise<GigagoCreateOrderExtra> {
    const envelope = await this.request<unknown, GigagoCreateOrderExtra>(
      "/api/partner/createPartnerOrder",
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
    );

    if (!envelope.extra) {
      throw new GigagoError({
        code: "GIGAGO_RESPONSE_INVALID",
        message: "Gigago createPartnerOrder không trả về extra.",
        details: envelope,
      });
    }

    return envelope.extra;
  }

  async getMyOrdersAgency({
    requestId,
    page = 1,
    pageSize = 100,
  }: GigagoOrderQueryInput): Promise<GigagoAgencyOrder[]> {
    const envelope = await this.request<GigagoAgencyOrder[]>(
      "/api/partner/getMyOrdersAgency",
      {
        method: "PUT",
        body: JSON.stringify({
          columnFilters: {
            request_id: requestId,
          },
          sort: [],
          page,
          pageSize,
        }),
      },
    );

    return Array.isArray(envelope.result) ? envelope.result : [];
  }

  async getOrderDetailAgency({
    requestId,
    page = 1,
    pageSize = 100,
  }: GigagoOrderQueryInput): Promise<GigagoDeliveredEsim[]> {
    const envelope = await this.request<GigagoDeliveredEsim[]>(
      "/api/partner/getOrderDetailAgency",
      {
        method: "POST",
        body: JSON.stringify({
          columnFilters: {
            request_id: requestId,
          },
          sort: [],
          page,
          pageSize,
        }),
      },
    );

    return Array.isArray(envelope.result) ? envelope.result : [];
  }
}
