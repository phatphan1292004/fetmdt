"use client";

import Link from "next/link";

export function SearchWithAI() {
  return (
    <div className="mt-4 flex justify-center">
      <Link
        href="/search-ai"
        className="group relative inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/35 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/45 hover:border-cyan-400/50 hover:shadow-cyan-500/25 hover:shadow-xl active:translate-y-0"
      >
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <svg
          className="h-4.5 w-4.5 text-cyan-400 transition-transform duration-500 group-hover:rotate-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM18 5.25L17.25 9l-.75-3.75L12.75 4.5l3.75-.75L17.25 0l.75 3.75 3.75.75-3.75.75z" />
        </svg>
        <span className="tracking-wide">Trải nghiệm Tìm kiếm phòng thông minh bằng AI</span>
      </Link>
    </div>
  );
}
