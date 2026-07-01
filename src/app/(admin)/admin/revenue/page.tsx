"use client";

import React, { useState, useEffect } from "react";
import {
  LuWallet,
  LuTrendingUp,
  LuClock,
  LuCoins,
  LuFileSpreadsheet,
} from "react-icons/lu";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function RevenuePage() {
  const [range, setRange] = useState("6months");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [packageDistribution, setPackageDistribution] = useState<any[]>([]);
  const [customerAnalysis, setCustomerAnalysis] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/admin/revenue?range=${range}`);
      const result = await res.json();
      if (result.success && result.data) {
        setStats(result.data.stats);
        setMonthlyTrend(result.data.monthlyTrend);
        setPackageDistribution(result.data.packageDistribution);
        setCustomerAnalysis(result.data.customerAnalysis || []);
        setRecentTransactions(result.data.recentTransactions);
      } else {
        setError(result.message || "Không thể tải báo cáo doanh thu.");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [range]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatFullCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value).replace(/\s/g, "").replace("₫", "đ");
  };

  const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b"];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[400px] w-full items-center justify-center space-y-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={fetchRevenueData}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const statCards = stats ? [
    {
      title: "Tổng doanh thu",
      value: formatFullCurrency(stats.totalRevenue),
      icon: LuWallet,
      color: "text-blue-600",
      bg: "bg-blue-100",
      description: "Doanh số từ bán gói VIP tin đăng"
    },
    {
      title: "Giá trị GD trung bình",
      value: formatFullCurrency(stats.avgOrderValue),
      icon: LuCoins,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      description: "Giá trị trung bình mỗi hoá đơn (AOV)"
    },
    {
      title: "GD thành công",
      value: stats.successfulTxCount.toLocaleString("vi-VN"),
      icon: LuTrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
      description: "Các giao dịch đã được hệ thống phê duyệt"
    },
    {
      title: "Yêu cầu chờ duyệt",
      value: stats.pendingTxCount.toLocaleString("vi-VN"),
      icon: LuClock,
      color: "text-amber-600",
      bg: "bg-amber-100",
      description: "Hoá đơn chuyển khoản đang chờ admin xử lý"
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Báo cáo doanh thu</h1>
          <p className="mt-1 text-sm text-slate-500">Phân tích chuyên sâu doanh thu từ gói dịch vụ nâng cấp tin đăng.</p>
        </div>
        <div>
          <button 
            onClick={() => window.print()}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
          >
            <LuFileSpreadsheet size={16} />
            Xuất báo cáo (In PDF)
          </button>
        </div>
      </div>

      {/* Grid thẻ thống kê */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Bộ lọc biểu đồ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800">Biểu đồ phân tích doanh thu</h3>
          <p className="text-xs text-slate-400 mt-1">Dữ liệu doanh thu biểu diễn dưới dạng xu hướng và tỷ lệ phân bố theo mốc thời gian.</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: "7days", label: "7 ngày" },
            { id: "1month", label: "30 ngày" },
            { id: "3months", label: "3 tháng" },
            { id: "6months", label: "6 tháng" },
            { id: "all", label: "Tất cả" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                range === item.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Biểu đồ xu hướng (Full width) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-6">
          Xu hướng doanh thu ({
            range === "7days" ? "7 ngày qua" :
            range === "1month" ? "30 ngày qua" :
            range === "3months" ? "3 tháng qua" :
            range === "6months" ? "6 tháng qua" : "tất cả thời gian"
          })
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={formatCurrency} />
              <Tooltip
                cursor={{ stroke: "#3b82f6", strokeWidth: 1 }}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                formatter={(value: any) => [`${Number(value).toLocaleString("vi-VN")} đ`, "Doanh thu"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Biểu đồ con (2 cột trên desktop) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Biểu đồ phân bố theo Gói */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Doanh thu theo Gói VIP ({
              range === "7days" ? "7 ngày qua" :
              range === "1month" ? "30 ngày qua" :
              range === "3months" ? "3 tháng qua" :
              range === "6months" ? "6 tháng qua" : "tất cả thời gian"
            })
          </h2>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={formatCurrency} />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value: any, name: any, props: any) => [
                    `${Number(value).toLocaleString("vi-VN")} đ (${props.payload.count} lượt)`,
                    "Doanh thu"
                  ]}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn Phân tích Khách hàng */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Tỷ lệ chuyển đổi khách hàng</h2>
          <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerAnalysis}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerAnalysis.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value: any) => [`${value} tài khoản`, "Số lượng"]}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lịch sử giao dịch gần đây */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 bg-white">
          <h2 className="text-lg font-bold text-slate-800">Lịch sử giao dịch thành công gần đây</h2>
          <p className="text-sm text-slate-500 mt-1">Danh sách các hoá đơn mua gói VIP tin đăng thành công mới nhất trên hệ thống.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-800 font-semibold">
              <tr>
                <th className="px-6 py-4">Mã GD</th>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Gói tin</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Ngày thanh toán</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{tx.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{tx.user}</p>
                        <p className="text-xs text-slate-400">{tx.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{tx.packageName}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {formatFullCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Thành công
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Chưa có giao dịch thành công nào được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
