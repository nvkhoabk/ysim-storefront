import { z } from "zod";

export const paymentProviderIdSchema = z.enum([
  "gpay_gateway_all",
  "gpay_gateway_card",
  "gpay_gateway_atm",
  "gpay_gateway_qr",
  "cash_agent",
]);

export const createPaymentSchema = z.object({
  provider: paymentProviderIdSchema,

  orderId: z.number().int().positive(),
  orderNumber: z.string().trim().min(1),
  orderKey: z.string().trim().min(1),

  amount: z.number().positive(),
  currency: z.string().trim().length(3),

  customerName: z.string().trim().min(2),
  customerEmail: z.string().trim().email(),
  customerPhone: z.string().trim().min(8),

  description: z.string().trim().min(1).max(200),
});
