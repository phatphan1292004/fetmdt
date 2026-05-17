"use client";

import React, { useState } from "react";
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

// --- 1. DỮ LIỆU MẪU MỞ RỘNG ---
const initialTransactions = [
  { id: "GD1001", user: "Nguyễn Văn A", package: "Tin VIP 1 (Ghim đầu trang)", amount: "50000", method: "VNPay", status: "Thành công", date: "17/05/2026" },
  { id: "GD1002", user: "Trần Thị B", package: "Nạp tiền vào ví hệ thống", amount: "200000", method: "Chuyển khoản", status: "Chờ duyệt", date: "17/05/2026" },
  { id: "GD1003", user: "Lê Hoàng C", package: "Đẩy tin tự động", amount: "10000", method: "Ví hệ thống", status: "Thất bại", date: "16/05/2026" },
  { id: "GD1004", user: "Phạm Văn D", package: "Tin VIP 2 (Nổi bật danh mục)", amount: "30000", method: "Momo", status: "Thành công", date: "15/05/2026" },
  { id: "GD1005", user: "Hoàng Thị E", package: "Nạp tiền vào ví hệ thống", amount: "500000", method: "Chuyển khoản", status: "Chờ duyệt", date: "15/05/2026" },
  { id: "GD1006", user: "Ngô Văn F", package: "Tin VIP 1 (Ghim đầu trang)", amount: "150000", method: "VNPay", status: "Thành công", date: "14/05/2026" },
  { id: "GD1007", user: "Vũ Thị G", package: "Đẩy tin tự động", amount: "20000", method: "Ví hệ thống", status: "Thành công", date: "13/05/2026" },
  { id: "GD1008", user: "Đặng Văn H", package: "Tin VIP 2 (Nổi bật danh mục)", amount: "90000", method: "Momo", status: "Thất bại", date: "12/05/2026" },
  { id: "GD1009", user: "Bùi Thị I", package: "Nạp tiền vào ví hệ thống", amount: "100000", method: "Chuyển khoản", status: "Chờ duyệt", date: "12/05/2026" },
  { id: "GD1010", user: "Đỗ Văn K", package: "Tin VIP 1 (Ghim đầu trang)", amount: "50000", method: "VNPay", status: "Thành công", date: "11/05/2026" },
  { id: "GD1011", user: "Hồ Thị L", package: "Đẩy tin tự động", amount: "10000", method: "Ví hệ thống", status: "Thành công", date: "10/05/2026" },
  { id: "GD1012", user: "Dương Văn M", package: "Tin VIP 2 (Nổi bật danh mục)", amount: "30000", method: "Momo", status: "Thành công", date: "09/05/2026" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  
  // States Bộ lọc & Phân trang
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
  const handleUpdateStatus = (id: string, newStatus: "Thành công" | "Thất bại") => {
    const actionText = newStatus === "Thành công" ? "duyệt THÀNH CÔNG" : "TỪ CHỐI";
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} giao dịch này không?`)) {
      const updated = transactions.map(tx => 
        tx.id === id ? { ...tx, status: newStatus } : tx
      );
      setTransactions(updated);
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
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
            Quản lý Gói tin
          </button>
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
              {currentTransactions.length > 0 ? currentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{tx.id}</td>
                  <td className="px-6 py-4 font-medium">{tx.user}</td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={tx.package}>{tx.package}</td>
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
                      {/* Chỉ hiện nút xử lý duyệt tiền nếu trạng thái là Chờ duyệt */}
                      {tx.status === "Chờ duyệt" ? (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, "Thành công")}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="Xác nhận đã nhận tiền"
                          >
                            <LuCheck size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, "Thất bại")}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            title="Từ chối giao dịch"
                          >
                            <LuX size={18} />
                          </button>
                        </>
                      ) : (
                        /* Khối tàng hình giữ chỗ giúp các icon ở dòng khác không bị lệch hàng */
                        <div className="h-8 w-52 shrink-0"></div>
                      )}
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