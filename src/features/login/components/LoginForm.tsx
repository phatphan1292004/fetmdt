"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginApi } from "../servers/login";
import { toast } from "react-toastify";

export function LoginForm() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginApi({
        account,
        password,
      });

      if (data.success) {
        sessionStorage.setItem("login_success", "true");

        setTimeout(() => {
          if (data.data?.role === "admin") {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/";
          }
        }, 500);
      } else {
        toast.error(data.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.1)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold tracking-[0.08em] text-[#0b7ea9] uppercase">
            Đăng nhập
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-[30px]">
            Quản lý phòng đã lưu
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          action="#"
          method="post"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              autoComplete="email"
              required
              placeholder="ban@email.com"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Mật khẩu
              </label>
              <Link
                href="/register"
                className="text-xs font-semibold text-[#0b7ea9] transition hover:text-[#045a84]"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="Nhap mat khau"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
            />
          </div>

          <label className="flex items-center gap-2.5 pt-1 text-sm text-slate-600">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-slate-300 text-[#0b7ea9] focus:ring-[#22c2c7]/30"
            />
            Ghi nhớ đăng nhập trên thiết bị này
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(92deg,#045a84_0%,#25c3c8_100%)] px-5 text-base font-bold text-white shadow-[0_14px_30px_rgba(6,98,133,0.26)] transition hover:opacity-95"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          Hoac
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 transition hover:border-[#1dbdc2]"
          >
            <span className="text-[#ea4335]">G</span>
            Google
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 transition hover:border-[#1dbdc2]"
          >
            <span className="text-[#1877f2]">f</span>
            Facebook
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#0b7ea9] transition hover:text-[#045a84]"
          >
            Tạo tài khoản mới
          </Link>
        </p>
      </section>
    </>
  );
}
