"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LuCircleCheck, 
  LuClock, 
  LuCircleX, 
  LuChevronLeft, 
  LuChevronRight,
  LuCheck,
  LuX,
  LuFileSpreadsheet
} from "react-icons/lu";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States Bộ lọc & Phân trang
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/transactions");
      const result = await res.json();
      if (result.success) {
        const mapped = (result.data || []).map((tx: any) => ({
          id: tx._id,
          user: tx.userId?.fullName || "Người dùng ẩn",
          packageName: `${tx.packageName} (${tx.duration} ngày)`,
          post: {
            title: tx.post?.title || "N/A",
            slug: tx.post?.slug || "",
          },
          amount: tx.amount.toString(),
          method: "VietQR",
          status: tx.status === "completed" ? "Thành công" : tx.status === "cancelled" ? "Thất bại" : "Chờ duyệt",
          date: new Date(tx.createdAt).toLocaleDateString("vi-VN"),
        }));
        setTransactions(mapped);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- LOGIC BỘ LỌC ---
  const filteredTransactions = transactions.filter(tx => {
    if (statusFilter === "Tất cả") return true;
    return tx.status === statusFilter;
  });

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // --- LOGIC THAO TÁC DUYỆT GIAO DỊCH THỦ CÔNG ---
  const handleUpdateStatus = async (id: string, newStatus: "Thành công" | "Thất bại") => {
    const actionText = newStatus === "Thành công" ? "duyệt THÀNH CÔNG" : "TỪ CHỐI";
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} giao dịch này không?`)) {
      try {
        const dbStatus = newStatus === "Thành công" ? "completed" : "cancelled";
        const response = await fetch("/api/v1/admin/transactions", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: id,
            status: dbStatus,
          }),
        });

        const data = await response.json();
        if (data.success) {
          // Update the state locally
          setTransactions(prev =>
            prev.map(tx =>
              tx.id === id ? { ...tx, status: newStatus } : tx
            )
          );
        } else {
          alert(`Lỗi cập nhật: ${data.message || "Không xác định"}`);
        }
      } catch (error) {
        console.error("Error updating transaction status:", error);
        alert("Có lỗi xảy ra khi cập nhật giao dịch!");
      }
    }
  };

  // Reset trang về 1 nếu thay đổi bộ lọc
  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Giao dịch & Dịch vụ</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý lịch sử thanh toán, nạp tiền ví và mua các gói tương tác.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/packages" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
            Quản lý Gói tin
          </Link>
          <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
            <LuFileSpreadsheet size={16} />
            Xuất báo cáo (Excel)
          </button>
        </div>
      </div>

      {/* --- THANH BỘ LỌC TRẠNG THÁI --- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {["Tất cả", "Thành công", "Chờ duyệt", "Thất bại"].map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              statusFilter === status 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bảng dữ liệu chính */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Mã GD</th>
                <th className="px-6 py-4 font-semibold">Người dùng</th>
                <th className="px-6 py-4 font-semibold">Nội dung / Gói</th>
                <th className="px-6 py-4 font-semibold">Số tiền</th>
                <th className="px-6 py-4 font-semibold">Phương thức</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-center">Xử lý nhận tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Đang tải dữ liệu giao dịch...
                  </td>
                </tr>
              ) : currentTransactions.length > 0 ? currentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{tx.id}</td>
                  <td className="px-6 py-4 font-medium">{tx.user}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">{tx.packageName}</p>
                      {tx.post?.slug ? (
                        <a 
                          href={`/phong-tro/${tx.post.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 block text-xs text-blue-600 hover:text-blue-800 hover:underline max-w-[250px] truncate font-medium"
                          title={`Xem bài viết: ${tx.post.title}`}
                        >
                          Bài đăng: {tx.post.title}
                        </a>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">Tin đăng: N/A</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600">{Number(tx.amount).toLocaleString('vi-VN')}đ</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {tx.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* Đã thêm chống rớt dòng bằng whitespace-nowrap */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                      tx.status === "Thành công" ? "bg-emerald-100 text-emerald-700" :
                      tx.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {tx.status === "Thành công" && <LuCircleCheck size={14} />}
                      {tx.status === "Chờ duyệt" && <LuClock size={14} />}
                      {tx.status === "Thất bại" && <LuCircleX size={14} />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => tx.status !== "Thành công" && handleUpdateStatus(tx.id, "Thành công")}
                        disabled={tx.status === "Thành công"}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                          tx.status === "Thành công" 
                            ? "bg-emerald-100 text-emerald-700 cursor-default" 
                            : "text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100"
                        }`}
                        title={tx.status === "Thành công" ? "Đã xác nhận thành công" : "Xác nhận đã nhận tiền"}
                      >
                        <LuCheck size={18} />
                      </button>
                      <button 
                        onClick={() => tx.status !== "Thất bại" && handleUpdateStatus(tx.id, "Thất bại")}
                        disabled={tx.status === "Thất bại"}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                          tx.status === "Thất bại" 
                            ? "bg-rose-100 text-rose-700 cursor-default" 
                            : "text-rose-600 hover:bg-rose-50 active:bg-rose-100"
                        }`}
                        title={tx.status === "Thất bại" ? "Đã từ chối giao dịch" : "Từ chối giao dịch"}
                      >
                        <LuX size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy dữ liệu giao dịch phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- KHU VỰC PHÂN TRANG --- */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
          <span className="text-sm text-slate-500">
            Đang xem <span className="font-medium text-slate-800">{filteredTransactions.length > 0 ? startIndex + 1 : 0}</span> đến <span className="font-medium text-slate-800">{Math.min(startIndex + itemsPerPage, filteredTransactions.length)}</span> trong tổng số <span className="font-medium text-slate-800">{filteredTransactions.length}</span> giao dịch
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <LuChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">{currentPage} / {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <LuChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}