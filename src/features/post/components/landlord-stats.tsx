"use client";

import { useEffect, useState } from "react";
import { LuEye, LuBookmark, LuFileText } from "react-icons/lu";

type StatsData = {
  totalPosts: number;
  totalViews: number;
  totalSaved: number;
};

export function LandlordStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/v1/user/stats");
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Tổng tin đăng",
      value: stats.totalPosts,
      icon: <LuFileText size={22} />,
      color: "from-[#0b7ea9] to-[#06b6d4]",
      bg: "bg-cyan-50",
      textColor: "text-[#0b7ea9]",
    },
    {
      label: "Tổng lượt xem",
      value: stats.totalViews,
      icon: <LuEye size={22} />,
      color: "from-[#f59e0b] to-[#f97316]",
      bg: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Lượt lưu bài",
      value: stats.totalSaved,
      icon: <LuBookmark size={22} />,
      color: "from-[#10b981] to-[#059669]",
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          {/* Thanh gradient ở trên cùng */}
          <div
            className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${card.color}`}
          />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className={`mt-1 text-3xl font-bold ${card.textColor}`}>
                {card.value.toLocaleString("vi-VN")}
              </p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.textColor}`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
