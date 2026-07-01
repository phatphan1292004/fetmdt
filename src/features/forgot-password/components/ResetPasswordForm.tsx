"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token") || "";
    const e = searchParams.get("email") || "";
    setToken(t);
    setEmail(e);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error("Thiếu thông tin xác thực. Vui lòng sử dụng liên kết trong email.");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu mới phải có tối thiểu 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        toast.success(data.message || "Đặt lại mật khẩu thành công");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        toast.error(data.message || "Không thể đặt lại mật khẩu");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối hệ thống");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.1)] backdrop-blur text-center sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Liên kết không hợp lệ</h2>
        <p className="mt-2 text-sm text-slate-600">
          Không tìm thấy mã bảo mật (token) hoặc địa chỉ email để thiết lập lại mật khẩu. Vui lòng nhấp vào đường dẫn chính xác được gửi trong hòm thư của bạn.
        </p>
        <div className="mt-6 border-t border-slate-100 pt-5">
          <Link
            href="/forgot-password"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 px-5 text-sm font-semibold text-slate-800 transition"
          >
            Yêu cầu liên kết mới
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.1)] backdrop-blur sm:p-8">
      {!success ? (
        <>
          <div className="mb-6">
            <p className="text-sm font-semibold tracking-[0.08em] text-[#0b7ea9] uppercase">
              Thiết lập lại
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-[28px] leading-tight">
              Mật khẩu mới
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Nhập mật khẩu mới cho tài khoản đăng ký dưới email: <strong className="text-slate-900">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Mật khẩu mới
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tối thiểu 6 ký tự"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-slate-700"
              >
                Xác nhận mật khẩu mới
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Nhập lại mật khẩu mới"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(92deg,#045a84_0%,#25c3c8_100%)] px-5 text-base font-bold text-white shadow-[0_14px_30px_rgba(6,98,133,0.26)] transition hover:opacity-95 disabled:opacity-75"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
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
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Thành công!</h2>
          <p className="mt-2 text-sm text-slate-600">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được tự động chuyển hướng về trang đăng nhập sau vài giây.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(92deg,#045a84_0%,#25c3c8_100%)] px-5 text-base font-bold text-white shadow-[0_14px_30px_rgba(6,98,133,0.26)] transition hover:opacity-95"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}
    </section>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.1)] backdrop-blur text-center sm:p-8">
        <p className="text-slate-600">Đang tải...</p>
      </div>
    }>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
