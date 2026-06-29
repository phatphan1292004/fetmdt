"use client";

import React, { useState, useEffect } from "react";
import { 
  LuBan, 
  LuSquarePen, 
  LuEye, 
  LuUserCheck, 
  LuChevronLeft, 
  LuChevronRight, 
  LuX,
  LuMail,
  LuPhone,
  LuCalendarDays,
  LuShieldCheck,
  LuPlus,
  LuTrash2
} from "react-icons/lu";
import { toast } from "react-toastify";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Selected user for View/Edit
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form state for creating a user
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "nguoi_tim_tro"
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data || []);
      } else {
        toast.error(data.message || "Không thể tải danh sách người dùng");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Đã xảy ra lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(users.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = users.slice(startIndex, startIndex + itemsPerPage);

  // --- LOGIC KHÓA / MỞ KHÓA TÀI KHOẢN ---
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "blocked" : "active";
    const action = nextStatus === "blocked" ? "khóa" : "mở khóa";

    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này không?`)) {
      try {
        const res = await fetch(`/api/v1/users?id=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(`Đã ${action} tài khoản thành công!`);
          setUsers(prev => prev.map(u => u._id === id ? { ...u, status: nextStatus } : u));
        } else {
          toast.error(data.message || "Thao tác thất bại");
        }
      } catch (error) {
        console.error("Error toggling status:", error);
        toast.error("Thao tác thất bại");
      }
    }
  };

  // --- LOGIC XÓA TÀI KHOẢN ---
  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này? Hành động này không thể hoàn tác.")) {
      try {
        const res = await fetch(`/api/v1/users?id=${id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success("Xóa tài khoản thành công!");
          setUsers(prev => prev.filter(u => u._id !== id));
          // Adjust pagination page if last item on page was deleted
          if (currentUsers.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          }
        } else {
          toast.error(data.message || "Xóa thất bại");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Xóa thất bại");
      }
    }
  };

  // --- LOGIC TẠO NGƯỜI DÙNG MỚI ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Thêm người dùng mới thành công!");
        setIsCreateModalOpen(false);
        // Refresh list
        fetchUsers();
      } else {
        toast.error(data.message || "Thêm người dùng thất bại");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Thêm người dùng thất bại");
    }
  };

  // --- LOGIC CHỈNH SỬA ---
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/users?id=${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: selectedUser.fullName,
          phone: selectedUser.phone,
          role: selectedUser.role
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Cập nhật thông tin thành công!");
        setIsEditModalOpen(false);
        setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, fullName: selectedUser.fullName, phone: selectedUser.phone, role: selectedUser.role } : u));
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-slate-500">Danh sách chủ trọ và người thuê trên nền tảng.</p>
        </div>
        <button 
          onClick={() => {
            setNewUser({ fullName: "", email: "", phone: "", password: "", role: "nguoi_tim_tro" });
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
        >
          <LuPlus size={16} />
          Thêm người dùng
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-sm font-medium">Đang tải danh sách người dùng...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-sm font-medium">Không có dữ liệu người dùng nào.</p>
          </div>
        ) : (
          <>
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
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
                          </div>
                          {user.fullName}
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
                          user.role === "nguoi_cho_thue_tro" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {user.role === "nguoi_cho_thue_tro" ? "Chủ trọ" : "Người thuê"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 ${
                          user.status === "active" ? "text-emerald-600" : user.status === "blocked" ? "text-rose-600" : "text-amber-600"
                        }`}>
                          <span className={`h-2 w-2 rounded-full ${user.status === "active" ? "bg-emerald-500" : user.status === "blocked" ? "bg-rose-500" : "bg-amber-500"}`}></span>
                          {user.status === "active" ? "Hoạt động" : user.status === "blocked" ? "Bị khóa" : "Chờ kích hoạt"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                            className="text-slate-400 hover:text-blue-600 transition cursor-pointer" title="Xem chi tiết"
                          >
                            <LuEye size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser({...user}); setIsEditModalOpen(true); }}
                            className="text-slate-400 hover:text-emerald-600 transition cursor-pointer" title="Chỉnh sửa"
                          >
                            <LuSquarePen size={18} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user._id, user.status)}
                            className={`transition cursor-pointer ${user.status === "active" ? "text-slate-400 hover:text-rose-600" : "text-rose-500 hover:text-emerald-600"}`} 
                            title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          >
                            {user.status === "active" ? <LuBan size={18} /> : <LuUserCheck size={18} />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer" title="Xóa người dùng"
                          >
                            <LuTrash2 size={18} />
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
                  className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  <LuChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-slate-700 px-2">{currentPage} / {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  <LuChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= MODAL: THÊM NGƯỜI DÙNG (CREATE) ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Thêm người dùng mới</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <LuX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input 
                  type="text" required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  placeholder="Nhập họ và tên"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <input 
                    type="tel" required
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="09xxxxxxxx"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                  >
                    <option value="nguoi_tim_tro">Người thuê</option>
                    <option value="nguoi_cho_thue_tro">Chủ trọ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                <input 
                  type="password" required minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer">Hủy bỏ</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer">Lưu người dùng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHỈNH SỬA (EDIT) ================= */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa thông tin</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <LuX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input 
                  type="text" required
                  value={selectedUser.fullName}
                  onChange={(e) => setSelectedUser({...selectedUser, fullName: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <input 
                    type="tel" required
                    value={selectedUser.phone}
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
                    <option value="nguoi_tim_tro">Người thuê</option>
                    <option value="nguoi_cho_thue_tro">Chủ trọ</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer">Hủy bỏ</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer">Lưu thay đổi</button>
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
              <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-white hover:text-slate-200 transition bg-black/20 rounded-full p-1 cursor-pointer">
                <LuX size={20} />
              </button>
            </div>
            
            <div className="px-6 pb-6">
              {/* Profile details */}
              <div className="flex items-end gap-4 -mt-12 mb-6">
                <div className="h-24 w-24 shrink-0 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 shadow-sm relative z-10">
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="mb-1">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {selectedUser.fullName}
                    {selectedUser.role === "nguoi_cho_thue_tro" && <LuShieldCheck className="text-emerald-500" size={18} title="Chủ trọ đã xác thực" />}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">Mã định danh: {selectedUser._id}</p>
                </div>
              </div>

              {/* Contact info */}
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
                  <span>Tham gia: {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>

              {/* Status labels */}
              <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedUser.role === "nguoi_cho_thue_tro" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {selectedUser.role === "nguoi_cho_thue_tro" ? "Chủ trọ" : "Người thuê"}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedUser.status === "active" ? "bg-emerald-100 text-emerald-700" : selectedUser.status === "blocked" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                  Trạng thái: {selectedUser.status === "active" ? "Hoạt động" : selectedUser.status === "blocked" ? "Bị khóa" : "Chờ kích hoạt"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}