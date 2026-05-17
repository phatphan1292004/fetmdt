"use client";

import React, { useState } from "react";
import { 
  LuEye, 
  LuSquarePen, 
  LuTrash2, 
  LuX, 
  LuChevronLeft, 
  LuChevronRight,
  LuMapPin,
  LuPhone,
  LuCalendarDays
} from "react-icons/lu";

// --- 1. DỮ LIỆU MẪU ---
const initialPosts = [
  { id: "P001", title: "Phòng trọ ban công thoáng mát", owner: "Nguyễn Văn A", phone: "0901234567", price: "3500000", address: "123 Cầu Giấy, Hà Nội", status: "Đang hiển thị", date: "17/05/2026", desc: "Phòng mới xây, dọn vào ở ngay, giờ giấc tự do." },
  { id: "P002", title: "Chung cư mini full nội thất", owner: "Trần B", phone: "0987654321", price: "5000000", address: "456 Đống Đa, Hà Nội", status: "Chờ duyệt", date: "16/05/2026", desc: "Đầy đủ điều hòa, nóng lạnh, giường tủ." },
  { id: "P003", title: "Ký túc xá cao cấp Q10", owner: "Lê C", phone: "0912345678", price: "1800000", address: "Sư Vạn Hạnh, Q10, HCM", status: "Đã ẩn", date: "15/05/2026", desc: "Bao điện nước, có máy giặt chung." },
  { id: "P004", title: "Nhà nguyên căn 3 lầu hẻm xe hơi", owner: "Phạm D", phone: "0933445566", price: "12000000", address: "Tân Bình, HCM", status: "Đang hiển thị", date: "14/05/2026", desc: "Thích hợp làm văn phòng hoặc gia đình ở." },
  { id: "P005", title: "Sleepbox sinh viên bao điện nước", owner: "Hoàng E", phone: "0966778899", price: "1500000", address: "Làng Đại Học, Thủ Đức", status: "Chờ duyệt", date: "13/05/2026", desc: "An ninh 24/7, có vân tay." },
  { id: "P001", title: "Phòng trọ ban công thoáng mát", owner: "Nguyễn Văn A", phone: "0901234567", price: "3500000", address: "123 Cầu Giấy, Hà Nội", status: "Đang hiển thị", date: "17/05/2026", desc: "Phòng mới xây, dọn vào ở ngay, giờ giấc tự do." },
  { id: "P002", title: "Chung cư mini full nội thất", owner: "Trần B", phone: "0987654321", price: "5000000", address: "456 Đống Đa, Hà Nội", status: "Chờ duyệt", date: "16/05/2026", desc: "Đầy đủ điều hòa, nóng lạnh, giường tủ." },
  { id: "P003", title: "Ký túc xá cao cấp Q10", owner: "Lê C", phone: "0912345678", price: "1800000", address: "Sư Vạn Hạnh, Q10, HCM", status: "Đã ẩn", date: "15/05/2026", desc: "Bao điện nước, có máy giặt chung." },
  { id: "P004", title: "Nhà nguyên căn 3 lầu hẻm xe hơi", owner: "Phạm D", phone: "0933445566", price: "12000000", address: "Tân Bình, HCM", status: "Đang hiển thị", date: "14/05/2026", desc: "Thích hợp làm văn phòng hoặc gia đình ở." },
  { id: "P005", title: "Sleepbox sinh viên bao điện nước", owner: "Hoàng E", phone: "0966778899", price: "1500000", address: "Làng Đại Học, Thủ Đức", status: "Chờ duyệt", date: "13/05/2026", desc: "An ninh 24/7, có vân tay." },
];

export default function PostManagementPage() {
  const [posts, setPosts] = useState(initialPosts);
  
  // States Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // States quản lý Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(posts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPosts = posts.slice(startIndex, startIndex + itemsPerPage);

  // --- LOGIC THÊM MỚI (ADD) ---
  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newId = `P00${posts.length + 1}`; // Tạo ID giả
    const today = new Date().toLocaleDateString('vi-VN');

    const newPost = {
      id: newId,
      title: formData.get("title") as string,
      owner: formData.get("owner") as string,
      phone: formData.get("phone") as string,
      price: formData.get("price") as string,
      address: formData.get("address") as string,
      status: formData.get("status") as string,
      date: today,
      desc: "Chưa có mô tả chi tiết."
    };

    setPosts([newPost, ...posts]);
    setIsAddModalOpen(false);
  };

  // --- LOGIC CHỈNH SỬA (EDIT) ---
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPosts = posts.map((p) => (p.id === selectedPost.id ? selectedPost : p));
    setPosts(updatedPosts);
    setIsEditModalOpen(false);
  };

  // --- LOGIC XÓA (DELETE) ---
  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin đăng này không? Hành động này không thể hoàn tác.")) {
      setPosts(posts.filter(p => p.id !== id));
      // Trở về trang 1 nếu trang hiện tại bị trống
      if (currentPosts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý tin đăng</h1>
          <p className="mt-1 text-sm text-slate-500">Duyệt và quản lý danh sách phòng trọ trên hệ thống.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
        >
          + Thêm tin đăng mới
        </button>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Mã tin</th>
                <th className="px-6 py-4 font-semibold">Tiêu đề</th>
                <th className="px-6 py-4 font-semibold">Người đăng</th>
                <th className="px-6 py-4 font-semibold">Giá thuê</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentPosts.length > 0 ? currentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{post.id}</td>
                  <td className="px-6 py-4 max-w-[250px] truncate" title={post.title}>{post.title}</td>
                  <td className="px-6 py-4">{post.owner}</td>
                  <td className="px-6 py-4 font-medium text-rose-600">{Number(post.price).toLocaleString('vi-VN')}đ</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      post.status === "Đang hiển thị" ? "bg-emerald-100 text-emerald-700" :
                      post.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => { setSelectedPost(post); setIsViewModalOpen(true); }}
                        className="text-slate-400 hover:text-blue-600 transition" title="Xem chi tiết"
                      >
                        <LuEye size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedPost({...post}); setIsEditModalOpen(true); }}
                        className="text-slate-400 hover:text-emerald-600 transition" title="Chỉnh sửa"
                      >
                        <LuSquarePen size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="text-slate-400 hover:text-rose-600 transition" title="Xóa"
                      >
                        <LuTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Không có dữ liệu tin đăng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
          <span className="text-sm text-slate-500">
            Đang xem <span className="font-medium text-slate-800">{posts.length > 0 ? startIndex + 1 : 0}</span> đến <span className="font-medium text-slate-800">{Math.min(startIndex + itemsPerPage, posts.length)}</span> trong tổng số <span className="font-medium text-slate-800">{posts.length}</span> tin
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

      {/* ================= MODAL: THÊM MỚI TIN ĐĂNG ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between border-b border-slate-100 px-6 py-4 z-10">
              <h3 className="text-lg font-bold text-slate-800">Thêm tin đăng mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <LuX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề phòng</label>
                  <input name="title" type="text" required placeholder="Vd: Phòng trọ khép kín mới xây..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá thuê (VNĐ/tháng)</label>
                  <input name="price" type="number" required placeholder="Vd: 3500000" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái duyệt</label>
                  <select name="status" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition">
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đang hiển thị">Duyệt và Hiển thị</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chi tiết</label>
                  <input name="address" type="text" required placeholder="Vd: Số 12 ngõ 34, Cầu Giấy, Hà Nội" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên chủ trọ</label>
                  <input name="owner" type="text" required placeholder="Vd: Nguyễn Văn A" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <input name="phone" type="tel" required placeholder="Vd: 0901234567" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">Hủy bỏ</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm">Tạo tin đăng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHỈNH SỬA (EDIT) ================= */}
      {isEditModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa tin đăng <span className="text-blue-600">#{selectedPost.id}</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <LuX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề phòng</label>
                <input 
                  type="text" value={selectedPost.title} required
                  onChange={(e) => setSelectedPost({...selectedPost, title: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá thuê (VNĐ)</label>
                  <input 
                    type="number" value={selectedPost.price} required
                    onChange={(e) => setSelectedPost({...selectedPost, price: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                  <select 
                    value={selectedPost.status}
                    onChange={(e) => setSelectedPost({...selectedPost, status: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                  >
                    <option value="Đang hiển thị">Đang hiển thị</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã ẩn">Đã ẩn</option>
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
      {isViewModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Chi tiết tin đăng <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-sm">{selectedPost.id}</span>
              </h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition bg-white rounded-full p-1 shadow-sm">
                <LuX size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{selectedPost.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <LuMapPin className="text-slate-400" size={16} />
                    <span>{selectedPost.address || "Chưa cập nhật địa chỉ"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <LuCalendarDays className="text-slate-400" size={16} />
                    <span>Ngày đăng: {selectedPost.date}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {selectedPost.owner.charAt(0)}
                    </div>
                    <span>{selectedPost.owner}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <LuPhone className="text-slate-400" size={16} />
                    <span className="font-medium text-slate-800">{selectedPost.phone || "Đang ẩn số"}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Mô tả thêm:</h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg">
                  {selectedPost.desc || "Người đăng không cung cấp mô tả chi tiết."}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <div>
                  <span className="text-sm text-slate-500 block">Mức giá:</span>
                  <span className="text-xl font-bold text-rose-600">{Number(selectedPost.price).toLocaleString('vi-VN')} VNĐ/tháng</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-500 block">Trạng thái hiện tại:</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium mt-1 ${
                    selectedPost.status === "Đang hiển thị" ? "bg-emerald-100 text-emerald-700" :
                    selectedPost.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                  }`}>
                    {selectedPost.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Nút thao tác nhanh trong modal View */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                Đóng
              </button>
              <button 
                onClick={() => { setIsViewModalOpen(false); setIsEditModalOpen(true); }}
                className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
              >
                Chỉnh sửa tin này
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}