"use client";

import React, { useState, useEffect } from "react";
import {
  LuCircleAlert,
  LuArrowDownRight,
  LuArrowUpRight,
  LuCircleCheck,
  LuClipboardList,
  LuClock,
  LuEllipsis,
  LuUsers,
  LuWallet,
} from "react-icons/lu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [revenueData7Days, setRevenueData7Days] = useState<any[]>([]);
  const [revenueDataThisMonth, setRevenueDataThisMonth] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [chartFilter, setChartFilter] = useState("7days");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/admin/dashboard");
      const result = await res.json();
      if (result.success && result.data) {
        setStatsData(result.data.stats);
        setRevenueData7Days(result.data.revenueData7Days);
        setRevenueDataThisMonth(result.data.revenueDataThisMonth);
        setPendingListings(result.data.pendingListings);
      } else {
        setError(result.message || "Không thể tải dữ liệu.");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Hàm xử lý duyệt tin
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/posts?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "published" }),
      });
      const result = await res.json();
      if (result.success) {
        setPendingListings((prev) => prev.filter((item) => item.id !== id));
        // Cập nhật lại statsData cục bộ
        if (statsData) {
          setStatsData({
            ...statsData,
            activePosts: statsData.activePosts + 1
          });
        }
      } else {
        alert(result.message || "Duyệt bài thất bại.");
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi khi duyệt bài.");
    }
  };

  // Format số tiền hiển thị trên biểu đồ (VD: 1200000 -> 1.2M)
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return `${value}đ`;
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[400px] w-full items-center justify-center space-y-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const statsCards = statsData ? [
    { title: "Tổng người dùng", value: statsData.totalUsers.toLocaleString("vi-VN"), trend: `${statsData.userGrowth >= 0 ? "+" : ""}${statsData.userGrowth}%`, isPositive: statsData.userGrowth >= 0, icon: LuUsers, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Tin đăng hiển thị", value: statsData.activePosts.toLocaleString("vi-VN"), trend: `${statsData.postGrowth >= 0 ? "+" : ""}${statsData.postGrowth}%`, isPositive: statsData.postGrowth >= 0, icon: LuClipboardList, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Doanh thu tháng này", value: formatRevenue(statsData.revenueThisMonth), trend: `${statsData.revenueGrowth >= 0 ? "+" : ""}${statsData.revenueGrowth}%`, isPositive: statsData.revenueGrowth >= 0, icon: LuWallet, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Báo cáo vi phạm", value: statsData.reportsThisMonth.toLocaleString("vi-VN"), trend: `${statsData.reportsGrowth >= 0 ? "+" : ""}${statsData.reportsGrowth}%`, isPositive: statsData.reportsGrowth <= 0, icon: LuCircleAlert, color: "text-rose-600", bg: "bg-rose-100" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h1>
        <p className="text-sm text-slate-500 mt-1">Theo dõi các chỉ số quan trọng trong ngày hôm nay.</p>
      </div>

      {/* 1. Khu vực Thống kê (Stat Cards) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span
                  className={`flex items-center gap-1 font-medium ${
                    stat.isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {stat.isPositive ? <LuArrowUpRight size={16} /> : <LuArrowDownRight size={16} />}
                  {stat.trend}
                </span>
                <span className="text-slate-400">so với tháng trước</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Khu vực Biểu đồ & Công việc cần làm */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Biểu đồ doanh thu (Chiếm 2/3) */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Doanh thu bán gói tin</h2>
            <select
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 outline-none cursor-pointer hover:bg-slate-100"
            >
              <option value="7days">7 ngày qua</option>
              <option value="month">Tháng này</option>
            </select>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartFilter === "7days" ? revenueData7Days : revenueDataThisMonth}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any) => [
                    `${Number(value).toLocaleString("vi-VN")} đ`,
                    "Doanh thu",
                  ]}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Danh sách tin chờ duyệt (Chiếm 1/3) */}
        <div className="col-span-1 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[420px]">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-white z-10">
            <h2 className="text-lg font-bold text-slate-800">
              Tin chờ kiểm duyệt{" "}
              <span className="ml-2 text-xs font-medium bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full">
                {pendingListings.length}
              </span>
            </h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Xem tất cả
            </button>
          </div>

          {/* Vùng danh sách có thể cuộn */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {pendingListings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <LuCircleCheck size={40} className="text-emerald-400" />
                <p className="text-sm">Đã duyệt hết tất cả tin đăng!</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {pendingListings.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl p-3 hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-blue-600 cursor-pointer transition-colors">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium text-rose-600">{item.price}</span>
                          <span>•</span>
                          <span className="truncate">{item.owner}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleApprove(item.id)}
                          title="Duyệt ngay"
                          className="rounded-lg bg-slate-100 p-2 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 transition-all duration-200"
                        >
                          <LuCircleCheck size={16} />
                        </button>
                        <button
                          title="Tùy chọn"
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-all"
                        >
                          <LuEllipsis size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <LuClock size={12} />
                      {item.time}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}