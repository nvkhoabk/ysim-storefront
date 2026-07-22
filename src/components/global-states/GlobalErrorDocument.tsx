"use client";

import {
  useEffect,
} from "react";

export function GlobalErrorDocument({
  error,
  reset,
}: {
  error:
    Error & {
      digest?: string;
    };
  reset:
    () => void;
}) {
  useEffect(
    () => {
      console.error(
        "YSim global error boundary:",
        error,
      );
    },
    [
      error,
    ],
  );

  return (
    <html lang="vi">
      <body
        style={{
          margin:
            0,
          minHeight:
            "100vh",
          background:
            "#f8fafc",
          color:
            "#17202a",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <main
          style={{
            minHeight:
              "100vh",
            display:
              "grid",
            placeItems:
              "center",
            padding:
              "24px",
          }}
        >
          <section
            role="alert"
            aria-live="assertive"
            style={{
              width:
                "min(100%, 680px)",
              border:
                "1px solid #fecaca",
              borderRadius:
                "24px",
              background:
                "#ffffff",
              padding:
                "40px 28px",
              boxShadow:
                "0 16px 40px rgba(15, 23, 42, 0.10)",
              textAlign:
                "center",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width:
                  "56px",
                height:
                  "56px",
                margin:
                  "0 auto",
                display:
                  "grid",
                placeItems:
                  "center",
                borderRadius:
                  "16px",
                background:
                  "#fef2f2",
                color:
                  "#b91c1c",
                fontSize:
                  "28px",
                fontWeight:
                  800,
              }}
            >
              !
            </div>

            <p
              style={{
                margin:
                  "20px 0 0",
                color:
                  "#b91c1c",
                fontSize:
                  "12px",
                fontWeight:
                  800,
                letterSpacing:
                  "0.12em",
                textTransform:
                  "uppercase",
              }}
            >
              YSim
            </p>

            <h1
              style={{
                margin:
                  "8px 0 0",
                fontSize:
                  "clamp(28px, 6vw, 40px)",
                lineHeight:
                  1.2,
              }}
            >
              Hệ thống đang gặp sự cố
            </h1>

            <p
              style={{
                maxWidth:
                  "540px",
                margin:
                  "16px auto 0",
                color:
                  "#64748b",
                fontSize:
                  "16px",
                lineHeight:
                  1.7,
              }}
            >
              Vui lòng thử lại. Nếu bạn vừa thanh toán, không gửi lại giao dịch cho tới khi kiểm tra trạng thái đơn hàng.
            </p>

            {
              error.digest
                ? (
                    <p
                      style={{
                        margin:
                          "14px 0 0",
                        color:
                          "#94a3b8",
                        fontSize:
                          "12px",
                      }}
                    >
                      Mã tham chiếu: {
                        error.digest
                      }
                    </p>
                  )
                : null
            }

            <div
              style={{
                marginTop:
                  "28px",
                display:
                  "flex",
                flexWrap:
                  "wrap",
                justifyContent:
                  "center",
                gap:
                  "12px",
              }}
            >
              <button
                type="button"
                onClick={
                  reset
                }
                style={{
                  minHeight:
                    "44px",
                  border:
                    0,
                  borderRadius:
                    "12px",
                  background:
                    "#15803d",
                  padding:
                    "0 20px",
                  color:
                    "#ffffff",
                  fontSize:
                    "14px",
                  fontWeight:
                    800,
                  cursor:
                    "pointer",
                }}
              >
                Thử lại
              </button>

              <a
                href="/"
                style={{
                  minHeight:
                    "42px",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  border:
                    "1px solid #15803d",
                  borderRadius:
                    "12px",
                  padding:
                    "0 20px",
                  color:
                    "#15803d",
                  fontSize:
                    "14px",
                  fontWeight:
                    800,
                  textDecoration:
                    "none",
                }}
              >
                Về trang chủ
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
