import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Smartphone,
} from "lucide-react";

const assistantQuestions = [
  "Bạn đi đâu?",
  "Đi bao nhiêu ngày?",
  "Bạn dùng Internet mức nào?",
];

export function PackageAssistant() {
  return (
    <section
      className="
        relative
        min-h-[148px]
        overflow-hidden
        rounded-xl
        border
        border-green-100
        bg-gradient-to-br
        from-green-50
        via-white
        to-emerald-50
        p-4
        shadow-sm
        sm:p-5
      "
    >
      <div className="relative z-10 max-w-[215px]">
        <h2 className="text-[17px] font-bold leading-6 text-slate-950">
          Không biết chọn gói nào?
        </h2>

        <p className="mt-1.5 text-xs leading-5 text-slate-600">
          Trả lời 3 câu hỏi, YSim sẽ đề xuất gói phù hợp nhất
          cho bạn.
        </p>

        <Link
          href="/package-assistant"
          className="
            mt-3.5
            inline-flex
            h-9
            items-center
            gap-1.5
            rounded-lg
            bg-green-700
            px-3.5
            text-xs
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-green-800
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-600
            focus-visible:ring-offset-2
          "
        >
          Bắt đầu ngay
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        aria-hidden="true"
        className="
          absolute
          bottom-0
          right-2
          hidden
          h-full
          w-[46%]
          sm:block
        "
      >
        <div className="absolute bottom-3 right-14">
          <div
            className="
              relative
              flex
              h-[102px]
              w-[54px]
              items-center
              justify-center
              rounded-[15px]
              border-[3px]
              border-slate-500
              bg-white
              shadow-lg
            "
          >
            <span className="absolute top-1.5 h-1.5 w-4 rounded-full bg-slate-400" />

            <Smartphone className="h-6 w-6 text-green-700" />

            <CheckCircle2 className="absolute bottom-2.5 h-5 w-5 fill-green-100 text-green-700" />
          </div>
        </div>

        <div className="absolute bottom-3 right-2">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-green-200
              bg-white
              shadow-md
            "
          >
            <Bot className="h-6 w-6 text-green-700" />
          </div>
        </div>

        <div className="absolute right-[92px] top-4 space-y-1.5">
          {assistantQuestions.map((question) => (
            <div
              key={question}
              className="
                max-w-[92px]
                rounded
                border
                border-green-200
                bg-white/95
                px-2
                py-1
                text-[8px]
                font-medium
                leading-3
                text-green-800
                shadow-sm
              "
            >
              {question}
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 right-0 h-20 w-32 rounded-full bg-green-100/60 blur-2xl" />
      </div>

      <div
        aria-hidden="true"
        className="
          absolute
          -bottom-8
          -right-8
          h-28
          w-28
          rounded-full
          bg-green-100/70
          blur-2xl
          sm:hidden
        "
      />
    </section>
  );
}