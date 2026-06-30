"use client";

import Link from "next/link";

export function SearchWithAI() {
  return (
    <div className="mt-4 flex justify-center">
      <Link
        href="/search-ai"
        className="group relative inline-flex items-center gap-3 rounded-full border border-white/20 bg-gradient-to-r from-[#0b7ea9] via-[#2cc3c8] to-[#0b7ea9] bg-[length:200%_auto] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0b7ea9]/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[position:right_center] hover:shadow-xl hover:shadow-[#2cc3c8]/40 active:translate-y-0 active:scale-98"
      >
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <svg
          className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM18 5.25L17.25 9l-.75-3.75L12.75 4.5l3.75-.75L17.25 0l.75 3.75 3.75.75-3.75.75z" />
        </svg>
        <span className="tracking-wide">Tìm kiếm phòng thông minh bằng AI ngay</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1.5 font-bold">→</span>
      </Link>
    </div>
  );
}
