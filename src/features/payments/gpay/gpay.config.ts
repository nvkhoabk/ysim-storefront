function requireServerEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const gpayConfig = {
  environment: process.env.GPAY_ENV ?? "sandbox",

  baseUrl: requireServerEnv("GPAY_QR_BASE_URL"),
  merchantCode: requireServerEnv(
    "GPAY_QR_MERCHANT_CODE",
  ),
  password: requireServerEnv("GPAY_QR_PASSWORD"),

  storeCode: process.env.GPAY_QR_STORE_CODE ?? "",
  terminalId:
    process.env.GPAY_QR_TERMINAL_ID ?? "",

  accountName:
    process.env.GPAY_QR_ACCOUNT_NAME ?? "YSIM",

  sourceOfFund:
    process.env.GPAY_QR_SOURCE_OF_FUND ?? "VIETQR",

  privateKeyPath: requireServerEnv(
    "GPAY_PRIVATE_KEY_PATH",
  ),

  gpayPublicKeyPath: requireServerEnv(
    "GPAY_PUBLIC_KEY_PATH",
  ),

  webhookUrl: requireServerEnv(
    "GPAY_QR_WEBHOOK_URL",
  ),

  returnUrl: requireServerEnv(
    "GPAY_QR_RETURN_URL",
  ),
};
