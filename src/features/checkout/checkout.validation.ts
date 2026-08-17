import { z } from "zod";

const checkoutPaymentProviderIdSchema = z.enum([
  "gpay_gateway_all",
  "gpay_virtual_account",
]);

export const checkoutFormSchema = z
  .object({
    locale: z.enum(["vi", "en", "lo"]),

    fullName: z.string().trim().min(2, "Vui lòng nhập họ và tên.").max(100),

    email: z.string().trim().email("Email không hợp lệ."),

    phone: z.string().trim().min(8, "Số điện thoại không hợp lệ.").max(20),

    country: z.string().trim().length(2, "Mã quốc gia không hợp lệ."),

    purchaseFor: z.enum(["self", "gift"]),

    recipientName: z.string().trim().max(100),

    recipientEmail: z.union([
      z.literal(""),
      z.string().trim().email("Email người nhận không hợp lệ."),
    ]),

    paymentMethod: checkoutPaymentProviderIdSchema,

    customerNote: z.string().trim().max(500),

    acceptTerms: z.boolean(),
  })
  .superRefine((values, context) => {
    if (!values.acceptTerms) {
      context.addIssue({
        code: "custom",
        path: ["acceptTerms"],
        message: "Bạn cần đồng ý với điều khoản.",
      });
    }

    if (values.purchaseFor === "gift") {
      if (!values.recipientName) {
        context.addIssue({
          code: "custom",
          path: ["recipientName"],
          message: "Vui lòng nhập tên người nhận.",
        });
      }

      if (!values.recipientEmail) {
        context.addIssue({
          code: "custom",
          path: ["recipientEmail"],
          message: "Vui lòng nhập email người nhận.",
        });
      }
    }
  });

export type CheckoutFormFields = z.input<typeof checkoutFormSchema>;
export type CheckoutFormInput = z.output<typeof checkoutFormSchema>;
