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
   * Certificate này đã đăng ký trên GPay Developer Portal.
   */
  merchantCertificatePath: requireServerEnv(
    "GPAY_CERTIFICATE_PATH",
  ),

  /**
   * Certificate do GPay cung cấp để xác minh response/webhook.
   *
   * Đây là cấu hình tùy chọn ở thời điểm khởi tạo ứng dụng.
   * Hàm verify sẽ kiểm tra bắt buộc khi được gọi.
   */
  gpayVerifyCertificatePath: optionalServerEnv(
    "GPAY_VERIFY_CERTIFICATE_PATH",
  ),

  webhookUrl: requireServerEnv(
    "GPAY_QR_WEBHOOK_URL",
  ),

  returnUrl: requireServerEnv(
    "GPAY_QR_RETURN_URL",
  ),
} as const;