import { gpayConfig } from "./gpay.config";
import type { GPayTokenResponse } from "./gpay.types";

function joinApiUrl(path: string): string {
  return `${gpayConfig.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function getGPayAccessToken(): Promise<string> {
  const response = await fetch(joinApiUrl("authentication/token/create"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant_code: gpayConfig.merchantCode,
      password: gpayConfig.password,
    }),
    cache: "no-store",
  });

  const responseText = await response.text();

  let data: GPayTokenResponse;

  try {
    data = JSON.parse(responseText) as GPayTokenResponse;
  } catch {
    throw new Error(
      `GPay returned invalid JSON: ${responseText.slice(0, 300)}`,
    );
  }

  if (!response.ok || !data.response?.token) {
    throw new Error(
      data.meta?.internal_msg ||
        data.meta?.msg ||
        `Cannot get GPay token: HTTP ${response.status}`,
    );
  }

  return data.response.token;
}
