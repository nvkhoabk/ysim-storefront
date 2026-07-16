"use client";

import {
  Check,
  Send,
} from "lucide-react";
import {
  type FormEvent,
  useState,
} from "react";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] =
    useState(true);
  const [submitted, setSubmitted] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setSubmitted(false);

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (!normalizedEmail.includes("@")) {
      setError("Địa chỉ email chưa hợp lệ.");
      return;
    }

    if (!accepted) {
      setError(
        "Bạn cần đồng ý nhận thông tin từ YSim.",
      );
      return;
    }

    /*
     * TODO:
     * Gửi dữ liệu tới Newsletter API hoặc CRM.
     */
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section
      className="
        rounded-2xl
        border
        border-green-100
        bg-gradient-to-br
        from-green-50
        via-white
        to-emerald-50
        p-5
        sm:p-6
      "
      aria-labelledby="footer-newsletter-title"
    >
      <div className="flex items-start gap-3">
        <span
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-green-700
            text-white
            shadow-sm
          "
        >
          <Send
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </span>

        <div>
          <h2
            id="footer-newsletter-title"
            className="
              text-[15px]
              font-bold
              uppercase
              leading-5
              text-slate-950
            "
          >
            Đăng ký nhận tin
          </h2>

          <p className="mt-1 text-[11px] leading-4 text-slate-600">
            Ưu đãi và cập nhật mới nhất từ YSim.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5"
        noValidate
      >
        <label
          htmlFor="footer-newsletter-email"
          className="sr-only"
        >
          Địa chỉ email
        </label>

        <input
          id="footer-newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
            setSubmitted(false);
          }}
          placeholder="Nhập email của bạn"
          className="
            h-11
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-[13px]
            text-slate-900
            shadow-sm
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-green-600
            focus:ring-2
            focus:ring-green-100
          "
        />

        <button
          type="submit"
          className="
            mt-3
            flex
            h-11
            w-full
            items-center
            justify-center
            rounded-xl
            bg-green-700
            px-5
            text-[13px]
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
          Đăng ký
        </button>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5">
          <span className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => {
                setAccepted(
                  event.target.checked,
                );
                setError(null);
              }}
              className="peer sr-only"
            />

            <span
              className="
                flex
                h-4
                w-4
                items-center
                justify-center
                rounded
                border
                border-slate-300
                bg-white
                text-transparent
                transition
                peer-checked:border-green-700
                peer-checked:bg-green-700
                peer-checked:text-white
                peer-focus-visible:ring-2
                peer-focus-visible:ring-green-600
                peer-focus-visible:ring-offset-2
              "
            >
              <Check className="h-3 w-3" />
            </span>
          </span>

          <span className="text-[10px] leading-4 text-slate-600">
            Tôi đồng ý nhận thông tin khuyến mãi, ưu đãi và tin
            tức từ YSim.
          </span>
        </label>

        {error ? (
          <p
            role="alert"
            className="mt-3 text-[11px] leading-4 text-red-600"
          >
            {error}
          </p>
        ) : null}

        {submitted ? (
          <p
            role="status"
            className="mt-3 text-[11px] font-medium leading-4 text-green-700"
          >
            Cảm ơn bạn đã đăng ký nhận tin từ YSim.
          </p>
        ) : null}
      </form>
    </section>
  );
}