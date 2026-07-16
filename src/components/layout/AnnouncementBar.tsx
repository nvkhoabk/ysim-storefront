import { Gift, X } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="relative bg-green-50 px-10 py-2.5 text-center text-sm text-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <Gift aria-hidden="true" className="h-4 w-4 text-green-700" />

        <p>
          <span className="font-semibold">
            Kích hoạt eSIM chỉ trong vài phút
          </span>
          <span className="hidden sm:inline">
            {" "}
            – Hỗ trợ 24/7 trong suốt hành trình.
          </span>
        </p>
      </div>

      <button
        type="button"
        aria-label="Đóng thông báo"
        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-md p-1 hover:bg-green-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
