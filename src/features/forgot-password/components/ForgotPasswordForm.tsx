"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success(data.message || "Đã gửi link khôi phục mật khẩu");
      } else {
        toast.error(data.message || "Gửi yêu cầu thất bại");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.1)] backdrop-blur sm:p-8">
      {!submitted ? (
        <>
          <div className="mb-6">
            <p className="text-sm font-semibold tracking-[0.08em] text-[#0b7ea9] uppercase">
              Khôi phục mật khẩu
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-[28px] leading-tight">
              Quên mật khẩu?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Nhập địa chỉ email liên kết với tài khoản của bạn. Chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu mới.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Email đăng ký
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="tenban@email.com"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(92deg,#045a84_0%,#25c3c8_100%)] px-5 text-base font-bold text-white shadow-[0_14px_30px_rgba(6,98,133,0.26)] transition hover:opacity-95 disabled:opacity-75"
            >
              {loading ? "Đang xử lý..." : "Gửi liên kết khôi phục"}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
            Kiểm tra hộp thư!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến <strong className="text-slate-900">{email}</strong>. Vui lòng kiểm tra hộp thư đến và cả thư mục thư rác (spam).
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 text-sm font-semibold text-[#0b7ea9] hover:underline"
          >
            Nhập lại email khác
          </button>
        </div>
      )}

      <div className="mt-6 border-t border-slate-100 pt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b7ea9] transition hover:text-[#045a84]"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại trang đăng nhập
        </Link>
      </div>
    </section>
  );
}
