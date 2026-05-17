"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  LuBell,
  LuChartNoAxesColumn,
  LuCircleUserRound,
  LuHouse,
  LuLayoutDashboard,
  LuMessageCircleMore,
  LuNotebookPen,
  LuPackage,
  LuSearch,
  LuStar,
  LuUsers,
} from "react-icons/lu";

const sidebarItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LuLayoutDashboard },
  { label: "Post", href: "/admin/post", icon: LuNotebookPen },
  { label: "User", href: "/admin/user", icon: LuUsers },
  { label: "Review", href: "/admin/review", icon: LuStar },
  {
    label: "Goi tang tuong tac",
    href: "/admin/goi-tang-tuong-tac",
    icon: LuPackage,
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#dfe7ee]">
      <div className="flex min-h-screen w-full overflow-hidden bg-[#f8fafc]">
        <aside className="flex w-[340px] flex-col border-r border-slate-200/80 bg-[#fdfdfd] px-5 py-6">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <LuHouse size={18} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-slate-800">SyncRows</p>
              <p className="text-xs text-slate-400">Admin Workspace</p>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
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
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              <LuChartNoAxesColumn size={17} />
              Analytics
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              <LuMessageCircleMore size={17} />
              Messages
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[#f9fafb]">
          <header className="flex h-20 items-center justify-between border-b border-slate-200/90 px-6 lg:px-8">
            <label className="flex w-[360px] max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <LuSearch size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search here"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="flex items-center gap-4">
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-200">
                <LuBell size={18} />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                <LuCircleUserRound size={18} />
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-auto p-5 lg:p-7">{children}</main>
        </section>
      </div>
    </div>
  );
}
