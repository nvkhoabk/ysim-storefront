export interface GPayCreateQrSignatureFields {
  merchantCode: string;
  accountName: string;
  qrType: "STATIC" | "DYNAMIC";
  sourceOfFund: string;
  billId: string;
}

export function buildCreateQrSignatureInput(
  fields: GPayCreateQrSignatureFields,
): string {
  return [
    `merchant_code=${fields.merchantCode}`,
    `account_name=${fields.accountName}`,
    `qr_type=${fields.qrType}`,
    `source_of_fund=${fields.sourceOfFund}`,
    `bill_id=${fields.billId}`,
  ].join("&");
}

export function buildQrResponseSignatureInput(
  fields: {
    qrCode: string;
    accountNumber: string;
    accountName: string;
    provider: string;
  },
): string {
  return [
    `qr_code=${fields.qrCode}`,
    `account_number=${fields.accountNumber}`,
    `account_name=${fields.accountName}`,
    `provider=${fields.provider}`,
  ].join("&");
}
