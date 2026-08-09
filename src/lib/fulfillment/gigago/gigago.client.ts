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
type GigagoOrderQueryMethod = "POST" | "PUT";

interface GigagoRequestOptions {
  allowEmptyFailure?: boolean;
}

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

function isEmptyQueryResult(
  envelope: GigagoApiEnvelope<unknown, unknown>,
): boolean {
  return (
    envelope.code === 200 &&
    isRejectedMessage(envelope.message) &&
    envelope.totalRecords === 0 &&
    envelope.result === null
  );
}

function configuredOrderQueryMethod(): GigagoOrderQueryMethod | null {
  const value = process.env.GIGAGO_GET_MY_ORDERS_METHOD?.trim().toUpperCase();

  return value === "POST" || value === "PUT" ? value : null;
}

export class GigagoClient {
  constructor(private readonly config: GigagoConfig = getGigagoConfig()) {}

  private async request<TResult, TExtra = unknown>(
    pathname: string,
    init: RequestInit,
    options: GigagoRequestOptions = {},
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

      if (
        options.allowEmptyFailure &&
        isEmptyQueryResult(
          envelope as unknown as GigagoApiEnvelope<unknown, unknown>,
        )
      ) {
        return envelope;
      }

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

  private orderQueryMethods(): GigagoOrderQueryMethod[] {
    const configured = configuredOrderQueryMethod();

    if (configured) {
      return [configured];
    }

    // Runtime sandbox ngày 24/07/2026 trả 405 cho PUT dù tài liệu ghi PUT.
    // Production vẫn ưu tiên contract trong tài liệu, sau đó fallback POST.
    return this.config.environment === "sandbox"
      ? ["POST", "PUT"]
      : ["PUT", "POST"];
  }

  private async requestOrderQueryWithMethodFallback<TResult>(
    pathname: string,
    payload: string,
  ): Promise<GigagoApiEnvelope<TResult, unknown>> {
    const methods = this.orderQueryMethods();
    let lastError: unknown = null;

    for (const [index, method] of methods.entries()) {
      try {
        return await this.request<TResult>(
          pathname,
          {
            method,
            body: payload,
          },
          {
            allowEmptyFailure: true,
          },
        );
      } catch (error) {
        lastError = error;
        const canRetry =
          index < methods.length - 1 &&
          error instanceof GigagoError &&
          error.code === "GIGAGO_HTTP_ERROR" &&
          error.status === 405;

        if (!canRetry) {
          throw error;
        }
      }
    }

    throw lastError;
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
    const envelope = await this.requestOrderQueryWithMethodFallback<
      GigagoAgencyOrder[]
    >(
      "/api/partner/getMyOrdersAgency",
      JSON.stringify({
        columnFilters: {
          request_id: requestId,
        },
        sort: [],
        page,
        pageSize,
      }),
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
      {
        allowEmptyFailure: true,
      },
    );

    return Array.isArray(envelope.result) ? envelope.result : [];
  }
}
