import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Trợ lý chọn gói eSIM",
  description:
    "Trả lời một vài câu hỏi để YSim đề xuất gói eSIM phù hợp.",
};

export default function PackageAssistantPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[65vh] bg-slate-50 px-6 py-16 lg:px-8">
        <div
          className="
            mx-auto
            max-w-2xl
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
            shadow-sm
          "
        >
          <Bot className="mx-auto h-14 w-14 text-green-700" />

          <h1 className="mt-5 text-3xl font-bold text-slate-950">
            Trợ lý chọn gói eSIM
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Công cụ đề xuất gói eSIM sẽ được hoàn thiện trong
            giai đoạn tiếp theo.
          </p>

          <Link
            href="/"
            className="
              mt-7
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              bg-green-700
              px-5
              text-sm
              font-semibold
              text-white
              hover:bg-green-800
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Trở về trang chủ
          </Link>
        </div>
      </main>
    </>
  );
}