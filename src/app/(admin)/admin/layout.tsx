"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  LuBell,
  LuChartNoAxesColumn,
  LuCircleUserRound,
  LuFolder,
  LuHouse,
  LuLayoutDashboard,
  LuLogOut,
  LuMessageCircleMore,
  LuNotebookPen,
  LuSearch,
  LuSettings,
  LuShieldAlert,
  LuStar,
  LuUsers,
  LuWallet,
} from "react-icons/lu";

// Đã chuẩn hóa ngôn ngữ và bổ sung các module quan trọng
const sidebarItems = [
  { label: "Tổng quan", href: "/admin/dashboard", icon: LuLayoutDashboard },
  { label: "Quản lý tin đăng", href: "/admin/posts", icon: LuNotebookPen },
  { label: "Quản lý người dùng", href: "/admin/users", icon: LuUsers },
  { label: "Gói & Giao dịch", href: "/admin/transactions", icon: LuWallet },
  { label: "Báo cáo & Đánh giá", href: "/admin/reviews", icon: LuStar },
  { label: "Danh mục hệ thống", href: "/admin/categories", icon: LuFolder },
  { label: "Cài đặt hệ thống", href: "/admin/settings", icon: LuSettings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#dfe7ee]">
      <div className="flex min-h-screen w-full overflow-hidden bg-[#f8fafc]">
        {/* Sidebar */}
        <aside className="flex w-[340px] flex-col border-r border-slate-200/80 bg-[#fdfdfd] px-5 py-6">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <LuHouse size={18} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-slate-800">Stayvia</p>
              <p className="text-xs text-slate-400">Không gian quản trị</p>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href); // Dùng startsWith để active cả các trang con
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-4 text-sm transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <Icon size={17} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-slate-200 pt-5">
            <Link
              href="/admin/revenue"
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                pathname === "/admin/revenue"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <LuChartNoAxesColumn size={17} />
              Báo cáo doanh thu
            </Link>
            <Link
              href="/admin/chat"
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition border-b border-slate-100 pb-2.5 ${
                pathname === "/admin/chat"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <LuMessageCircleMore size={17} />
              Hỗ trợ & Tin nhắn
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition"
            >
              <LuLogOut size={17} />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex min-w-0 flex-1 flex-col bg-[#f9fafb]">
          <header className="flex h-20 items-center justify-between border-b border-slate-200/90 px-6 lg:px-8">
            <label className="flex w-[360px] max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <LuSearch size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng, mã tin đăng..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="flex items-center gap-4">
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-200 relative">
                <LuBell size={18} />
                {/* Dấu chấm đỏ thông báo (ví dụ) */}
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="relative group">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600 cursor-pointer hover:bg-slate-300 transition">
                  <LuCircleUserRound size={18} />
                </div>
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-100 bg-white p-1 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                  >
                    <LuLogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-auto p-5 lg:p-7">{children}</main>
        </section>
      </div>
    </div>
  );
}