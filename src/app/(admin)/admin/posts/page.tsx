"use client";

import React, { useState, useEffect } from "react";
import { 
  LuEye, 
  LuSquarePen, 
  LuTrash2, 
  LuX, 
  LuChevronLeft, 
  LuChevronRight,
  LuMapPin,
  LuPhone,
  LuCalendarDays,
  LuPlus
} from "react-icons/lu";
import { toast } from "react-toastify";

export default function PostManagementPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States quản lý Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/posts");
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(data.data || []);
      } else {
        toast.error(data.message || "Không thể tải danh sách tin đăng");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Đã xảy ra lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(posts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPosts = posts.slice(startIndex, startIndex + itemsPerPage);

  // Status mapping functions
  const mapBackendToFrontendStatus = (status: string) => {
    switch (status) {
      case "published":
        return "Đang hiển thị";
      case "pending":
        return "Chờ duyệt";
      case "hidden":
        return "Đã ẩn";
      case "draft":
        return "Bản nháp";
      case "rejected":
        return "Từ chối";
      default:
        return "Chờ duyệt";
    }
  };

  const mapFrontendToBackendStatus = (status: string) => {
    switch (status) {
      case "Đang hiển thị":
        return "published";
      case "Chờ duyệt":
        return "pending";
      case "Đã ẩn":
        return "hidden";
      default:
        return "pending";
    }
  };

  // --- LOGIC THÊM MỚI (ADD) ---
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const price = formData.get("price") as string;
    const frontendStatus = formData.get("status") as string;
    const address = formData.get("address") as string;
    const owner = formData.get("owner") as string;
    const phone = formData.get("phone") as string;

    const payload = {
      title,
      price,
      status: mapFrontendToBackendStatus(frontendStatus),
      address,
      owner,
      phone
    };

    try {
      const res = await fetch("/api/v1/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Thêm tin đăng mới thành công!");
        setIsAddModalOpen(false);
        fetchPosts();
      } else {
        toast.error(data.message || "Thêm tin đăng thất bại");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Thêm tin đăng thất bại");
    }
  };

  // --- LOGIC CHỈNH SỬA (EDIT) ---
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: selectedPost.title,
      price: selectedPost.price,
      status: mapFrontendToBackendStatus(selectedPost.status),
      address: selectedPost.address
    };

    try {
      const res = await fetch(`/api/v1/admin/posts?id=${selectedPost._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Cập nhật tin đăng thành công!");
        setIsEditModalOpen(false);
        // Refresh local state without full reload
        setPosts(prev => prev.map(p => p._id === selectedPost._id ? data.data : p));
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  // --- LOGIC XÓA (DELETE) ---
  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin đăng này không? Hành động này không thể hoàn tác.")) {
      try {
        const res = await fetch(`/api/v1/admin/posts?id=${id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success("Xóa tin đăng thành công!");
          setPosts(prev => prev.filter(p => p._id !== id));
          if (currentPosts.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        } else {
          toast.error(data.message || "Xóa thất bại");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Xóa thất bại");
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
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
        >
          <LuPlus size={16} />
          Thêm tin đăng mới
        </button>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-sm font-medium">Đang tải danh sách tin đăng...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-sm font-medium">Không có dữ liệu tin đăng nào.</p>
          </div>
        ) : (
          <>
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
                  {currentPosts.map((post) => {
                    const displayStatus = mapBackendToFrontendStatus(post.status);
                    return (
                      <tr key={post._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {post._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 max-w-[250px] truncate" title={post.title}>
                          {post.title}
                        </td>
                        <td className="px-6 py-4">
                          {post.ownerId?.fullName || "Quản trị viên"}
                        </td>
                        <td className="px-6 py-4 font-medium text-rose-600">
                          {Number(post.price).toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            displayStatus === "Đang hiển thị" ? "bg-emerald-100 text-emerald-700" :
                            displayStatus === "Chờ duyệt" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                          }`}>
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => { 
                                setSelectedPost({
                                  ...post, 
                                  status: displayStatus,
                                  owner: post.ownerId?.fullName || "Quản trị viên",
                                  phone: post.ownerId?.phone || "0888022821"
                                }); 
                                setIsViewModalOpen(true); 
                              }}
                              className="text-slate-400 hover:text-blue-600 transition cursor-pointer" title="Xem chi tiết"
                            >
                              <LuEye size={18} />
                            </button>
                            <button 
                              onClick={() => { 
                                setSelectedPost({
                                  ...post, 
                                  status: displayStatus,
                                  owner: post.ownerId?.fullName || "Quản trị viên",
                                  phone: post.ownerId?.phone || "0888022821"
                                }); 
                                setIsEditModalOpen(true); 
                              }}
                              className="text-slate-400 hover:text-emerald-600 transition cursor-pointer" title="Chỉnh sửa"
                            >
                              <LuSquarePen size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(post._id)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer" title="Xóa"
                            >
                              <LuTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* ================= MODAL: THÊM MỚI TIN ĐĂNG ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between border-b border-slate-100 px-6 py-4 z-10">
              <h3 className="text-lg font-bold text-slate-800">Thêm tin đăng mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
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
                  <select name="status" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer">
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đang hiển thị">Duyệt và Hiển thị</option>
                    <option value="Đã ẩn">Đã ẩn</option>
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
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer">Hủy bỏ</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer">Tạo tin đăng</button>
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
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa tin đăng <span className="text-blue-600">#{selectedPost._id.slice(-6).toUpperCase()}</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                <input 
                  type="text" value={selectedPost.address} required
                  onChange={(e) => setSelectedPost({...selectedPost, address: e.target.value})}
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                  >
                    <option value="Đang hiển thị">Đang hiển thị</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã ẩn">Đã ẩn</option>
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
      {isViewModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Chi tiết tin đăng <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-sm">#{selectedPost._id.slice(-6).toUpperCase()}</span>
              </h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition bg-white rounded-full p-1 shadow-sm cursor-pointer">
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
                    <span>Ngày đăng: {new Date(selectedPost.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {selectedPost.owner.charAt(0).toUpperCase()}
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
                  {selectedPost.description || "Người đăng không cung cấp mô tả chi tiết."}
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
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Đóng
              </button>
              <button 
                onClick={() => { setIsViewModalOpen(false); setIsEditModalOpen(true); }}
                className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
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