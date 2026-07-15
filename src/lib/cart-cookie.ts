import { cookies } from "next/headers";

export const CART_COOKIE_NAME = "ysim_cart_token";

export async function getCartTokenCookie(): Promise<
  string | null
> {
  const cookieStore = await cookies();

  return cookieStore.get(CART_COOKIE_NAME)?.value ?? null;
}

export async function setCartTokenCookie(
  token: string,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: CART_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}