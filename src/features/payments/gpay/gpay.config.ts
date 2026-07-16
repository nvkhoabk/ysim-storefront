function requireServerEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function optionalServerEnv(
  name: string,
  fallback = "",
): string {
  return process.env[name]?.trim() || fallback;
}

export const gpayConfig = {
  environment: optionalServerEnv(
    "GPAY_ENV",
    "sandbox",
  ),

  baseUrl: requireServerEnv(
    "GPAY_QR_BASE_URL",
  ),

  merchantCode: requireServerEnv(
    "GPAY_QR_MERCHANT_CODE",
  ),

  password: requireServerEnv(
    "GPAY_QR_PASSWORD",
  ),

  storeCode: optionalServerEnv(
    "GPAY_QR_STORE_CODE",
  ),

  terminalId: optionalServerEnv(
    "GPAY_QR_TERMINAL_ID",
  ),

  accountName: optionalServerEnv(
    "GPAY_QR_ACCOUNT_NAME",
    "YSIM",
  ),

  sourceOfFund: optionalServerEnv(
    "GPAY_QR_SOURCE_OF_FUND",
    "VIETQR",
  ),

  /**
   * Private key của Merchant/YSim.
   * Dùng để ký request gửi tới GPay.
   */
  merchantPrivateKeyPath: requireServerEnv(
    "GPAY_PRIVATE_KEY_PATH",
  ),

  /**
   * X.509 certificate của Merchant/YSim.
   *
   * Certificate này được khai báo trên GPay Developer Portal
   * và có thể cần được gửi trong header hoặc request metadata
   * tùy theo đặc tả API chính thức.
   */
  merchantCertificatePath: requireServerEnv(
    "GPAY_CERTIFICATE_PATH",
  ),

  /**
   * Certificate/public certificate do GPay cung cấp.
   * Dùng để xác minh chữ ký response hoặc webhook từ GPay.
   */
  gpayVerifyCertificatePath:
    requireServerEnv(
      "GPAY_VERIFY_CERTIFICATE_PATH",
    ),

  webhookUrl: requireServerEnv(
    "GPAY_QR_WEBHOOK_URL",
  ),

  returnUrl: requireServerEnv(
    "GPAY_QR_RETURN_URL",
  ),
} as const;