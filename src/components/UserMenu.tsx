"use client";

import { useEffect, useRef, useState } from "react";

export type CurrentUser = {
    fullName: string;
    role: string;
};

type UserMenuProps = {
    currentUser: CurrentUser;
    variant?: "desktop" | "mobile";
};

function getRoleLabel(role: string) {
    if (role === "nguoi_cho_thue_tro") {
        return "Người cho thuê trọ";
    }

    if (role === "nguoi_tim_tro") {
        return "Người tìm trọ";
    }

    return role;
}

export function UserMenu({ currentUser, variant = "desktop" }: UserMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const initial = currentUser.fullName.trim().charAt(0).toUpperCase() || "U";

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent) => {
            if (!menuRef.current) {
                return;
            }

            if (!menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isMenuOpen]);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            const response = await fetch("/api/v1/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                window.location.reload();
            }
        } finally {
            setIsMenuOpen(false);
            setIsLoggingOut(false);
        }
    };

    if (variant === "mobile") {
        return (
            <div className="relative lg:hidden" ref={menuRef}>
                <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#28c3c8] text-sm font-bold text-white"
                >
                    {initial}
                </button>
                {isMenuOpen ? (
                    <div className="absolute top-12 right-0 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_35px_rgba(15,23,42,0.14)]">
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                        </button>
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#28c3c8]/40 bg-[#ecfdfe] px-3 py-2"
            >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#28c3c8] text-sm font-bold text-white">
                    {initial}
                </span>
                <div className="leading-tight text-left">
                    <p className="max-w-45 truncate text-sm font-semibold text-slate-800">
                        {currentUser.fullName}
                    </p>
                    <p className="text-xs text-slate-500">{getRoleLabel(currentUser.role)}</p>
                </div>
                <svg
                    className={`h-4 w-4 text-slate-500 transition ${isMenuOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                >
                    <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {isMenuOpen ? (
                <div className="absolute top-14 right-0 z-50 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_35px_rgba(15,23,42,0.14)]">
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden
                        >
                            <path
                                d="M10 7V5C10 4.44772 10.4477 4 11 4H18C18.5523 4 19 4.44772 19 5V19C19 19.5523 18.5523 20 18 20H11C10.4477 20 10 19.5523 10 19V17"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M15 12H4M4 12L7 9M4 12L7 15"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            ) : null}
        </div>
    );
}
