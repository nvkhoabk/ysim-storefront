import type {
  GlobalBoundaryActivationPlanViewModel,
} from "@/types/view-models/global-boundary-activation";

const project =
  '"..\\ysim-storefront"';

export function createGlobalBoundaryActivationPlan():
  GlobalBoundaryActivationPlanViewModel {
  const boundaries = [
    {
      id:
        "loading",
      order:
        1,
      label:
        "Root Loading",
      target:
        "src/app/loading.tsx",
      testPath:
        "/ui-preview/global-boundary-activation/slow",
      risk:
        "medium",
      notes: [
        "Kiểm tra bằng client-side navigation.",
        "Skeleton phải giữ bố cục ổn định.",
      ],
    },
    {
      id:
        "not-found",
      order:
        2,
      label:
        "Root Not Found",
      target:
        "src/app/not-found.tsx",
      testPath:
        "/ui-preview/global-boundary-activation/not-found-test",
      risk:
        "medium",
      notes: [
        "Áp dụng cho route hoặc entity gọi notFound().",
        "Giữ Header/Footer thông qua PageShell.",
      ],
    },
    {
      id:
        "route-error",
      order:
        3,
      label:
        "Route Error",
      target:
        "src/app/error.tsx",
      testPath:
        "/ui-preview/global-boundary-activation/route-error-test",
      risk:
        "high",
      notes: [
        "Bắt buộc là Client Component.",
        "Retry phải gọi reset().",
      ],
    },
    {
      id:
        "global-error",
      order:
        4,
      label:
        "Global Error",
      target:
        "src/app/global-error.tsx",
      risk:
        "high",
      notes: [
        "Bắt buộc chứa html và body.",
        "Không phụ thuộc Root Layout hoặc commerce API.",
      ],
    },
  ] as const;

  return {
    title:
      "Controlled Global Boundary Activation",
    description:
      "Kích hoạt từng Next.js loading, not-found và error boundary với backup và rollback độc lập.",
    boundaries:
      boundaries.map(
        (boundary) => ({
          ...boundary,
          activateCommand:
            `node .\\scripts\\activate-package-35-boundary.mjs --project ${project} --boundary ${boundary.id}`,
          verifyCommand:
            `node .\\scripts\\verify-package-35-activated-boundary.mjs --project ${project} --boundary ${boundary.id}`,
          rollbackCommand:
            `node .\\scripts\\rollback-package-35-boundary.mjs --project ${project} --boundary ${boundary.id}`,
        }),
      ),
    guardrails: [
      "Chỉ activation một boundary trong mỗi commit.",
      "Sau mỗi activation phải chạy typecheck và build.",
      "Rollback test trước khi giữ boundary.",
      "Route Error test chủ động ghi lỗi vào terminal; đây là hành vi dự kiến.",
      "Không chủ động phá Root Layout để test Global Error trên nhánh làm việc chính.",
    ],
  };
}
