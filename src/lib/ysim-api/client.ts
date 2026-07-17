import { ApiConfig } from "@/lib/models/api-config";

export interface ApiClientOptions {
  timeout?: number;
  retries?: number;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message?: string
  ) {
    super(message ?? `API Error ${status}`);
  }
}

export class YSimApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      (baseUrl ??
        process.env.YSIM_API_BASE_URL ??
        "").replace(/\/$/, "");

    if (!this.baseUrl) {
      throw new Error(
        "YSIM_API_BASE_URL is not configured."
      );
    }
  }

  async get<T>(
    path: string,
    options: ApiClientOptions = {}
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        method: "GET",
      },
      options
    );
  }

  async post<T>(
    path: string,
    body: unknown,
    options: ApiClientOptions = {}
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      options
    );
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    options: ApiClientOptions
  ): Promise<T> {

    const timeout =
      options.timeout ?? 10000;

    const retries =
      options.retries ?? 1;

    let lastError: unknown;

    for (
      let attempt = 0;
      attempt <= retries;
      attempt++
    ) {
      try {

        const controller =
          new AbortController();

        const timer =
          setTimeout(
            () => controller.abort(),
            timeout
          );

        const response =
          await fetch(
            `${this.baseUrl}${path}`,
            {
              ...init,

              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
                ...init.headers,
              },

              signal:
                controller.signal,

              cache:
                options.cache ??
                "no-store",

              next:
                options.next,
            }
          );

        clearTimeout(timer);

        let payload: unknown =
          null;

        try {
          payload =
            await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok) {
          throw new ApiError(
            response.status,
            payload
          );
        }

        return payload as T;

      } catch (error) {

        lastError = error;

        if (attempt >= retries) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async getConfig(): Promise<ApiConfig> {
    return this.get<ApiConfig>(
      "/config",
      {
        cache: "force-cache",
        next: {
          revalidate: 300,
        },
      }
    );
  }
}

export const api =
  new YSimApiClient();
