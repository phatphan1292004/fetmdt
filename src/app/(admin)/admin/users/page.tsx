"use client";

import React, { useState } from "react";
import { 
  LuBan, 
  LuSquarePen, 
  LuEye, 
  LuUserCheck, // Đã thay LuUnlock thành LuUserCheck cho an toàn 100%
  LuChevronLeft, 
  LuChevronRight, 
  LuX,
  LuMail,
  LuPhone,
  LuCalendarDays,
  LuShieldCheck
} from "react-icons/lu";

// --- 1. DỮ LIỆU MẪU ---
const initialUsers = [
  { id: "U001", name: "Nguyễn Văn A", email: "nva@gmail.com", phone: "0901111222", role: "Chủ trọ", status: "Hoạt động", joinDate: "10/05/2026" },
  { id: "U002", name: "Trần Thị B", email: "ttb@gmail.com", phone: "0902222333", role: "Người thuê", status: "Hoạt động", joinDate: "12/05/2026" },
  { id: "U003", name: "Lê Hoàng C", email: "lhc@yahoo.com", phone: "0903333444", role: "Chủ trọ", status: "Bị khóa", joinDate: "01/05/2026" },
  { id: "U004", name: "Phạm D", email: "phamd@gmail.com", phone: "0904444555", role: "Người thuê", status: "Hoạt động", joinDate: "15/04/2026" },
  { id: "U005", name: "Hoàng E", email: "hoange@gmail.com", phone: "0905555666", role: "Chủ trọ", status: "Hoạt động", joinDate: "20/03/2026" },
  { id: "U006", name: "Ngô F", email: "ngof@gmail.com", phone: "0906666777", role: "Người thuê", status: "Hoạt động", joinDate: "11/02/2026" },
  { id: "U007", name: "Vũ G", email: "vug@gmail.com", phone: "0907777888", role: "Chủ trọ", status: "Bị khóa", joinDate: "05/01/2026" },
  { id: "U008", name: "Đặng H", email: "dangh@gmail.com", phone: "0908888999", role: "Người thuê", status: "Hoạt động", joinDate: "22/12/2025" },
  { id: "U009", name: "Bùi I", email: "buii@gmail.com", phone: "0909999000", role: "Chủ trọ", status: "Hoạt động", joinDate: "18/11/2025" },
  { id: "U010", name: "Đỗ K", email: "dok@gmail.com", phone: "0911111222", role: "Người thuê", status: "Hoạt động", joinDate: "30/10/2025" },
  { id: "U011", name: "Hồ L", email: "hol@gmail.com", phone: "0912222333", role: "Chủ trọ", status: "Hoạt động", joinDate: "14/09/2025" },
  { id: "U012", name: "Dương M", email: "duongm@gmail.com", phone: "0913333444", role: "Người thuê", status: "Bị khóa", joinDate: "02/08/2025" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers);

  // States Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // States Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(users.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = users.slice(startIndex, startIndex + itemsPerPage);

  // --- LOGIC KHÓA / MỞ KHÓA TÀI KHOẢN ---
  const handleToggleStatus = (id: string, currentStatus: string) => {
    const action = currentStatus === "Hoạt động" ? "khóa" : "mở khóa";
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này không?`)) {
      const updatedUsers = users.map(u => {
        if (u.id === id) {
          return { ...u, status: currentStatus === "Hoạt động" ? "Bị khóa" : "Hoạt động" };
        }
        return u;
      });
      setUsers(updatedUsers);
    }
  };

  // --- LOGIC CHỈNH SỬA ---
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? selectedUser : u));
    setUsers(updatedUsers);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-slate-500">Danh sách chủ trọ và người thuê trên nền tảng.</p>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên người dùng</th>
                <th className="px-6 py-4 font-semibold">Email / SĐT</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold">Ngày tham gia</th>
                <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      <span className="text-xs text-slate-400">{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                      user.role === "Chủ trọ" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 ${
                      user.status === "Hoạt động" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${user.status === "Hoạt động" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.joinDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                        className="text-slate-400 hover:text-blue-600 transition" title="Xem chi tiết"
                      >
                        <LuEye size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedUser({...user}); setIsEditModalOpen(true); }}
                        className="text-slate-400 hover:text-emerald-600 transition" title="Chỉnh sửa"
                      >
                        <LuSquarePen size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`transition ${user.status === "Hoạt động" ? "text-slate-400 hover:text-rose-600" : "text-rose-500 hover:text-emerald-600"}`} 
                        title={user.status === "Hoạt động" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      >
                        {/* Thay thế LuUnlock bằng LuUserCheck */}
                        {user.status === "Hoạt động" ? <LuBan size={18} /> : <LuUserCheck size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
          <span className="text-sm text-slate-500">
            Đang xem <span className="font-medium text-slate-800">{users.length > 0 ? startIndex + 1 : 0}</span> đến <span className="font-medium text-slate-800">{Math.min(startIndex + itemsPerPage, users.length)}</span> trong tổng số <span className="font-medium text-slate-800">{users.length}</span> người dùng
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <LuChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">{currentPage} / {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <LuChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: CHỈNH SỬA (EDIT) ================= */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa thông tin</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <LuX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input 
                  type="text" value={selectedUser.name} required
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <input 
                    type="tel" value={selectedUser.phone} required
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                  <select 
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                  >
                    <option value="Người thuê">Người thuê</option>
                    <option value="Chủ trọ">Chủ trọ</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">Hủy bỏ</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: XEM CHI TIẾT (VIEW) ================= */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header màu */}
            <div className="relative h-24 bg-gradient-to-r from-blue-500 to-cyan-400">
              <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-white hover:text-slate-200 transition bg-black/20 rounded-full p-1">
                <LuX size={20} />
              </button>
            </div>
            
            <div className="px-6 pb-6">
              {/* Dùng Flexbox và Margin âm (-mt-12) để Avatar đẩy lên trên mà không đè chữ */}
              <div className="flex items-end gap-4 -mt-12 mb-6">
                <div className="h-24 w-24 shrink-0 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 shadow-sm relative z-10">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="mb-1">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {selectedUser.name}
                    {selectedUser.role === "Chủ trọ" && <LuShieldCheck className="text-emerald-500" size={18} title="Chủ trọ đã xác thực" />}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">Mã định danh: {selectedUser.id}</p>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <LuMail size={16} />
                  </div>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <LuPhone size={16} />
                  </div>
                  <span>{selectedUser.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <LuCalendarDays size={16} />
                  </div>
                  <span>Tham gia: {selectedUser.joinDate}</span>
                </div>
              </div>

              {/* Nhãn trạng thái */}
              <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedUser.role === "Chủ trọ" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {selectedUser.role}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedUser.status === "Hoạt động" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  Trạng thái: {selectedUser.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}