"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CurrentUser, UserMenu } from "./UserMenu";
import Image from "next/image";
import { toast } from "react-toastify";

type HeaderLocation = {
  city: string;
  districts: string[];
};

type HeaderProps = {
  hotline: string;
  currentUser?: CurrentUser | null;
  locations?: HeaderLocation[];
};

export function Header({ hotline, currentUser, locations }: HeaderProps) {
  const safeLocations = (locations ?? []).filter(
    (location) => location.city.trim().length > 0,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loginSuccess = sessionStorage.getItem("login_success");
      if (loginSuccess) {
        toast.success("Đăng nhập thành công!");
        sessionStorage.removeItem("login_success");
      }

      const logoutSuccess = sessionStorage.getItem("logout_success");
      if (logoutSuccess) {
        toast.success("Đăng xuất thành công!");
        sessionStorage.removeItem("logout_success");
      }
    }
  }, []);


  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white">
      <div className="relative">
        <div className="mx-auto flex h-23 w-full max-w-500 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-7 xl:gap-9">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-2.5"
              aria-label="PhòngTốt"
            >
              <Image
                src="/logo2.png"
                alt="PhòngTốt"
                width={100}
                height={100}
                priority
                className="object-contain"
              />
              <span className="font-display -ml-8 text-[30px] font-black leading-none tracking-tight">
                <span className="text-[#045a84]">Phong</span>
                <span className="text-[#0a6e97]">Tot</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
              {safeLocations.map((location) => (
                <div key={location.city} className="relative group">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[17px] font-semibold text-slate-700 whitespace-nowrap hover:bg-slate-100 focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span>{location.city}</span>
                    <svg
                      className="ml-1 h-3.5 w-3.5 text-slate-500"
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
                  <div className="absolute left-0 top-full pt-2 opacity-0 pointer-events-none transition group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                    <div className="min-w-55 rounded-2xl border border-slate-200 bg-white shadow-xl">
                      <div className="flex max-h-150 flex-col gap-1 overflow-y-auto p-2">
                        {location.districts.length ? (
                          location.districts.map((district) => (
                            <Link
                              key={district}
                              href={`/category?city=${encodeURIComponent(location.city)}&district=${encodeURIComponent(district)}`}
                              className="rounded-xl px-3 py-2 text-[16px] font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              {district}
                            </Link>
                          ))
                        ) : (
                          <span className="rounded-xl px-3 py-2 text-[15px] text-slate-500">
                            Đang cập nhật
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[17px] font-semibold text-slate-700 whitespace-nowrap hover:bg-slate-100 focus:outline-none"
              >
                Cẩm nang
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[17px] font-semibold text-slate-700 whitespace-nowrap hover:bg-slate-100 focus:outline-none"
              >
                Liên hệ
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-5 text-[15px] text-slate-600 lg:flex">
            <p className="whitespace-nowrap">
              Hotline:{" "}
              <span className="font-semibold text-slate-900">{hotline}</span>
            </p>
            <Link
              href="/search"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-slate-500 whitespace-nowrap transition hover:bg-slate-100"
            >
              <svg
                className="h-4 w-4 text-[#f7cd00]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M9 3L3 9h4v6h4V9h4L9 3zm6 18l6-6h-4v-6h-4v6H9l6 6z" />
              </svg>
              So sánh
            </Link>
            <Link
              href="/phong-da-luu"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-slate-500 whitespace-nowrap transition hover:bg-slate-100"
            >
              <svg
                className="h-4 w-4 text-[#20bfc4]"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path d="M10 17.3L8.7 16.1C4 11.8 1 9 1 5.6C1 3 3 1 5.6 1C7.1 1 8.5 1.7 9.4 2.9C10.3 1.7 11.7 1 13.2 1C15.8 1 17.8 3 17.8 5.6C17.8 9 14.8 11.8 10.1 16.1L10 17.3Z" />
              </svg>
              Phòng đã lưu
            </Link>
            <Link
              href="/post"
              className="shrink-0 font-semibold text-slate-700 underline decoration-slate-400 decoration-1 underline-offset-2"
            >
              Đăng tin
            </Link>
            {currentUser ? (
              <UserMenu currentUser={currentUser} />
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-[#28c3c8] px-4 py-2 font-semibold text-[#18b9be] whitespace-nowrap transition hover:bg-[#ecfdfe]"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#28c3c8] text-white">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <circle cx="12" cy="8" r="4" fill="currentColor" />
                      <path
                        d="M5 19C5 15.686 8.134 13 12 13C15.866 13 19 15.686 19 19"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  Đăng ký
                </Link>
                <Link
                  href="/login"
                  className="shrink-0 font-semibold text-slate-700 underline underline-offset-2"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>

          {!currentUser ? (
            <Link
              href="/register"
              className="rounded-xl border border-[#22c2c7] px-4 py-2 text-sm font-semibold text-[#1ab7bc] lg:hidden"
            >
              Đăng ký
            </Link>
          ) : (
            <UserMenu currentUser={currentUser} variant="mobile" />
          )}
        </div>
      </div>
    </header>
  );
}
