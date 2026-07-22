import type {
  ReleaseReadinessViewModel,
} from "@/types/view-models/release-readiness";

export function createReleaseReadinessViewModel():
  ReleaseReadinessViewModel {
  return {
    title:
      "Full Dev Acceptance & Preview Readiness",
    description:
      "Bộ quality gate cuối của nhánh UI refactor trước khi triển khai lên sandbox.ysim.vn.",
    gates: [
      {
        id:
          "source",
        order:
          1,
        title:
          "Source & Route Inventory",
        description:
          "Xác nhận candidate routes, Policy integration và global boundaries đã có trong source.",
        status:
          "required",
        checks: [
          "Package 33 Policy detail và rich content.",
          "Package 34 Global State components.",
          "Package 35 loading, not-found, error và global-error boundaries.",
          "Không có conflict marker.",
        ],
        command:
          "node .\\scripts\\run-package-36-readiness.mjs --project \"..\\ysim-storefront\" --branch \"refactor/storefront-ui-v1\"",
      },
      {
        id:
          "build",
        order:
          2,
        title:
          "TypeScript & Production Build",
        description:
          "Typecheck và Next.js production build phải PASS trên working tree đã review.",
        status:
          "required",
        checks: [
          "git diff --check.",
          "npm run typecheck.",
          "npm run build.",
        ],
      },
      {
        id:
          "content",
        order:
          3,
        title:
          "WordPress Content Contract",
        description:
          "Policy collection/detail phải đúng kind, locale, slug và contentHtml.",
        status:
          "required",
        checks: [
          "Plugin content-localization 0.1.1 hoặc mới hơn.",
          "Ba Policy detail trả 200.",
          "Guide slug dưới Policy route trả 404.",
        ],
        command:
          "node .\\scripts\\run-package-36-readiness.mjs --project \"..\\ysim-storefront\" --online",
      },
      {
        id:
          "runtime",
        order:
          4,
        title:
          "Local Runtime Smoke",
        description:
          "Chạy dev server và xác nhận các route chính trả response hợp lệ.",
        status:
          "required",
        checks: [
          "Candidate commerce routes.",
          "Secondary/Policy routes.",
          "Global State and Boundary dashboards.",
          "404 test.",
        ],
        command:
          "node .\\scripts\\smoke-package-36-runtime.mjs --base-url \"http://localhost:3000\"",
      },
      {
        id:
          "visual",
        order:
          5,
        title:
          "Human Visual Acceptance",
        description:
          "Kiểm tra responsive, content formatting, keyboard và các trạng thái giao dịch.",
        status:
          "manual",
        checks: [
          "390×844.",
          "768×1024.",
          "1440×900.",
          "H2, bullet, numbering.",
          "Loading, Empty, Error, 404.",
        ],
      },
      {
        id:
          "payment",
        order:
          6,
        title:
          "Payment Activation",
        description:
          "Payment Result không được chuyển khỏi legacy trước khi callback và reconciliation được nghiệm thu.",
        status:
          "blocked",
        checks: [
          "Giữ YSIM_UI_PAYMENT_RESULT=legacy.",
          "Không khởi tạo GPay trong UI preview.",
          "Không gửi giao dịch thật trong smoke test.",
        ],
      },
    ],
    safety: [
      "Report chỉ lưu tên biến môi trường, không lưu giá trị secret.",
      "Package không deploy hoặc restart server.",
      "Runtime error test chủ động trả lỗi nên không nằm trong normal smoke.",
      "Một commit/tag candidate phải được ghi lại trước preview deployment.",
      "Rollback commit trên Debian phải được ghi trước git pull.",
    ],
  };
}
