"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 프로덕션 환경에서는 에러 로깅 서비스로 전송
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
        }}>
          <div style={{
            textAlign: "center",
            maxWidth: "28rem",
          }}>
            <div style={{
              fontSize: "6rem",
              fontWeight: 900,
              color: "rgba(239, 68, 68, 0.2)",
              marginBottom: "1.5rem",
            }}>
              500
            </div>
            <h1 style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}>
              심각한 오류가 발생했습니다
            </h1>
            <p style={{
              color: "#94a3b8",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}>
              일시적인 문제가 발생했습니다.<br />
              앱을 다시 시작해주세요.
            </p>
            {process.env.NODE_ENV === "development" && (
              <div style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                padding: "1rem",
                borderRadius: "0.5rem",
                marginBottom: "2rem",
                textAlign: "left",
              }}>
                <p style={{
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                  color: "#ef4444",
                  wordBreak: "break-word",
                }}>
                  {error.message}
                </p>
              </div>
            )}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#c084fc",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: "9999px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "transparent",
                  color: "#c084fc",
                  fontWeight: 700,
                  borderRadius: "9999px",
                  border: "2px solid #c084fc",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
