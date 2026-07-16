import { z } from "zod";

export const createPaymentSchema = z.object({
  provider: z.enum(["gpay_qr", "onepay_card", "cash_agent"]),

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
