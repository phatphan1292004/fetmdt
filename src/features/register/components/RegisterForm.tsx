"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { registerApi } from "../servers/register";

export function RegisterForm() {
    const [role, setRole] = useState<"nguoi_tim_tro" | "nguoi_cho_thue_tro">("nguoi_tim_tro");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isAgree, setIsAgree] = useState(false);
    const [loading, setLoading] = useState(false);

    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
        show: boolean;
    }>({
        type: "success",
        message: "",
        show: false,
    });

    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const showToast = (type: "success" | "error", message: string) => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        setToast({
            type,
            message,
            show: true,
        });

        toastTimeoutRef.current = setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3000);
    };

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password.length < 8) {
            showToast("error", "Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        if (password !== confirmPassword) {
            showToast("error", "Mật khẩu xác nhận không khớp");
            return;
        }

        if (!isAgree) {
            showToast("error", "Vui lòng đồng ý điều khoản trước khi đăng ký");
            return;
        }

        setLoading(true);

        try {
            const res = await registerApi({
                fullName,
                email,
                phone,
                password,
                role,
            });

            if (res.success) {
                showToast("success", "Đăng ký thành công");
                setTimeout(() => {
                    router.push("/login");
                }, 500);
            } else {
                showToast("error", res.message || "Đăng ký thất bại");
            }
        } catch (err: any) {
            showToast("error", err.message || "Lỗi hệ thống");
        } finally {
            setLoading(false);
        }
    };

    return (<>
        <section className="order-2 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_22px_48px_rgba(15,23,42,0.1)] backdrop-blur sm:p-8 lg:order-1">
            <div className="mb-6">
                <p className="text-sm font-semibold tracking-[0.08em] text-[#0b7ea9] uppercase">
                    Đăng ký
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-[30px]">
                    Bắt đầu cùng PhòngTốt
                </h1>
            </div>

            <form onSubmit={handleRegister} className="space-y-4" action="#" method="post">
                {/* Vai trò */}
                <fieldset className="space-y-2.5">
                    <legend className="text-sm font-semibold text-slate-700">
                        Bạn là ai?
                    </legend>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-300 bg-white p-3.5 transition hover:border-[#1dbdc2]">
                            <input
                                type="radio"
                                name="role"
                                value="nguoi_tim_tro"
                                checked={role === "nguoi_tim_tro"}
                                onChange={(e) => setRole(e.target.value as "nguoi_tim_tro" | "nguoi_cho_thue_tro")}
                                required
                                className="mt-0.5 h-4 w-4 text-[#0b7ea9]"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-slate-800">
                                    Người tìm trọ
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500">
                                    Cần tìm phòng theo giá và khu vực phù hợp
                                </span>
                            </span>
                        </label>

                        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-300 bg-white p-3.5 transition hover:border-[#1dbdc2]">
                            <input
                                type="radio"
                                name="role"
                                value="nguoi_cho_thue_tro"
                                checked={role === "nguoi_cho_thue_tro"}
                                onChange={(e) => setRole(e.target.value as "nguoi_tim_tro" | "nguoi_cho_thue_tro")}
                                required
                                className="mt-0.5 h-4 w-4 text-[#0b7ea9]"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-slate-800">
                                    Người cho thuê trọ
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500">
                                    Đăng tin phòng và nhận liên hệ từ khách thuê
                                </span>
                            </span>
                        </label>
                    </div>
                </fieldset>

                {/* Họ tên + SĐT */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                            Họ và tên
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Nguyễn Văn A"
                            autoComplete="name"
                            className="h-12 w-full rounded-xl border border-slate-300 px-4"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                            Số điện thoại
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="09xxxxxxxx"
                            autoComplete="tel"
                            className="h-12 w-full rounded-xl border border-slate-300 px-4"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="ban@email.com"
                        autoComplete="email"
                        className="h-12 w-full rounded-xl border border-slate-300 px-4"
                    />
                </div>

                {/* Mật khẩu */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Tối thiểu 8 ký tự"
                            autoComplete="new-password"
                            className="h-12 w-full rounded-xl border border-slate-300 px-4"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Nhập lại mật khẩu"
                            autoComplete="new-password"
                            className="h-12 w-full rounded-xl border border-slate-300 px-4"
                        />
                    </div>
                </div>

                {/* Điều khoản */}
                <label className="flex items-start gap-2.5 pt-1 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={isAgree}
                        onChange={(e) => setIsAgree(e.target.checked)}
                        required
                        className="mt-0.5 h-4 w-4"
                    />
                    <span>
                        Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của PhongTot.
                    </span>
                </label>

                {/* Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-12 w-full rounded-xl bg-linear-to-r from-[#045a84] to-[#25c3c8] font-bold text-white"
                >
                    Tạo tài khoản
                </button>
            </form>

            {/* Login link */}
            <p className="mt-5 text-center text-sm text-slate-600">
                Đã có tài khoản?{" "}
                <Link href="/login" className="font-semibold text-[#0b7ea9]">
                    Đăng nhập ngay
                </Link>
            </p>
        </section>

        {toast.show && (
            <div
                className={`fixed top-5 right-5 z-50 min-w-70 rounded-xl px-4 py-3 text-white shadow-lg transition-all ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
            >
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{toast.message}</p>
                    <button
                        type="button"
                        onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                        className="text-white/80 hover:text-white"
                    >
                        ×
                    </button>
                </div>
            </div>
        )}
    </>
    );
}