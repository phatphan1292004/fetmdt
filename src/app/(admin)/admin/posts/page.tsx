"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  LuPlus,
  LuCoins,
  LuRuler,
  LuBed,
  LuBath,
  LuLayers,
  LuCompass,
  LuShieldCheck,
  LuSofa,
  LuDog,
  LuCrown,
  LuHouse,
  LuImage,
  LuUser,
  LuClock
} from "react-icons/lu";
import { toast } from "react-toastify";

export default function PostManagementPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States quản lý Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    const propertyType = formData.get("propertyType") as string;
    const listingType = formData.get("listingType") as string;
    const projectName = formData.get("projectName") as string;
    const deposit = formData.get("deposit") as string;
    const area = formData.get("area") as string;
    const bedrooms = formData.get("bedrooms") as string;
    const bathrooms = formData.get("bathrooms") as string;
    const width = formData.get("width") as string;
    const length = formData.get("length") as string;
    const floors = formData.get("floors") as string;
    const usableArea = formData.get("usableArea") as string;
    const mainDirection = formData.get("mainDirection") as string;
    const legalStatus = formData.get("legalStatus") as string;
    const interiorStatus = formData.get("interiorStatus") as string;
    const allowPets = formData.get("allowPets") === "true";
    const ownerType = formData.get("ownerType") as string;
    const vipType = formData.get("vipType") as string;
    const description = formData.get("description") as string;
    const mediaUrls = formData.get("mediaUrls") as string;

    const payload = {
      title,
      price,
      status: mapFrontendToBackendStatus(frontendStatus),
      address,
      owner,
      phone,
      propertyType,
      listingType,
      projectName,
      deposit,
      area,
      bedrooms,
      bathrooms,
      width,
      length,
      floors,
      usableArea,
      mainDirection,
      legalStatus,
      interiorStatus,
      allowPets,
      ownerType,
      vipType,
      description,
      mediaUrls
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
                              onClick={() => router.push(`/admin/posts/${post._id}`)}
                              className="text-slate-400 hover:text-blue-600 transition cursor-pointer" title="Xem chi tiết"
                            >
                              <LuEye size={18} />
                            </button>
                            <button 
                              onClick={() => router.push(`/admin/posts/${post._id}?mode=edit`)}
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
      {/* ================= MODAL: THÊM MỚI TIN ĐĂNG ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white flex items-center justify-between border-b border-slate-100 px-6 py-4 z-10">
              <h3 className="text-lg font-bold text-slate-800">Thêm tin đăng mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition bg-slate-50 p-1.5 rounded-full cursor-pointer">
                <LuX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Thông tin cơ bản */}
                <div className="md:col-span-2 border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Thông tin cơ bản</h4>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề phòng *</label>
                  <input name="title" type="text" required placeholder="Vd: Phòng trọ khép kín mới xây..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá thuê (VNĐ/tháng) *</label>
                  <input name="price" type="number" required placeholder="Vd: 3500000" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tiền đặt cọc (VNĐ)</label>
                  <input name="deposit" type="number" placeholder="Vd: 1500000" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chi tiết *</label>
                  <input name="address" type="text" required placeholder="Vd: Số 12 ngõ 34, Cầu Giấy, Hà Nội" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>

                {/* Phân loại & Trạng thái */}
                <div className="md:col-span-2 border-b border-slate-100 pb-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Phân loại & Trạng thái</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại bất động sản</label>
                  <select name="propertyType" defaultValue="phong_tro" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer">
                    <option value="phong_tro">Phòng trọ</option>
                    <option value="can_ho_chung_cu">Căn hộ chung cư</option>
                    <option value="nha_o">Nhà ở</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại tin đăng</label>
                  <select name="listingType" defaultValue="cho_thue" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer">
                    <option value="cho_thue">Cho thuê</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái duyệt *</label>
                  <select name="status" defaultValue="Chờ duyệt" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer">
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đang hiển thị">Duyệt và Hiển thị</option>
                    <option value="Đã ẩn">Đã ẩn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gói tin (VIP)</label>
                  <select name="vipType" defaultValue="free" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer">
                    <option value="free">FREE</option>
                    <option value="vip3">VIP3</option>
                    <option value="vip2">VIP2</option>
                    <option value="vip1">VIP1</option>
                    <option value="supervip">SUPERVIP</option>
                  </select>
                </div>

                {/* Thông số phòng */}
                <div className="md:col-span-2 border-b border-slate-100 pb-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Thông số phòng</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diện tích (m²)</label>
                  <input name="area" type="number" step="any" placeholder="Vd: 30" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diện tích sử dụng (m²)</label>
                  <input name="usableArea" type="number" step="any" placeholder="Vd: 30" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chiều ngang (m)</label>
                  <input name="width" type="number" step="any" placeholder="Vd: 4" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chiều dài (m)</label>
                  <input name="length" type="number" step="any" placeholder="Vd: 7.5" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số phòng ngủ</label>
                  <input name="bedrooms" type="number" placeholder="Vd: 1" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số nhà vệ sinh</label>
                  <input name="bathrooms" type="number" placeholder="Vd: 1" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số tầng</label>
                  <input name="floors" type="number" placeholder="Vd: 1" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hướng chính</label>
                  <input name="mainDirection" type="text" placeholder="Vd: Đông Nam" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>

                {/* Tiện ích & Bổ sung */}
                <div className="md:col-span-2 border-b border-slate-100 pb-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Tiện ích & Thông tin bổ sung</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pháp lý</label>
                  <input name="legalStatus" type="text" placeholder="Vd: Sổ hồng / Hợp đồng" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tình trạng nội thất</label>
                  <input name="interiorStatus" type="text" placeholder="Vd: Đầy đủ / Cơ bản" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên dự án (nếu có)</label>
                  <input name="projectName" type="text" placeholder="Vd: Vinhomes Grand Park" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cho phép vật nuôi</label>
                  <select name="allowPets" defaultValue="true" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer">
                    <option value="true">Có</option>
                    <option value="false">Không</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại người đăng</label>
                  <select name="ownerType" defaultValue="ca_nhan" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer">
                    <option value="ca_nhan">Cá nhân</option>
                    <option value="moi_gioi">Môi giới</option>
                  </select>
                </div>
                <div />

                {/* Liên hệ */}
                <div className="md:col-span-2 border-b border-slate-100 pb-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">5. Chủ trọ & Liên hệ</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên chủ trọ *</label>
                  <input name="owner" type="text" required placeholder="Vd: Nguyễn Văn A" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại *</label>
                  <input name="phone" type="tel" required placeholder="Vd: 0901234567" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition" />
                </div>

                {/* Hình ảnh & Mô tả */}
                <div className="md:col-span-2 border-b border-slate-100 pb-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">6. Hình ảnh & Mô tả chi tiết</h4>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh sách link ảnh (phân tách bằng dấu phẩy)</label>
                  <textarea name="mediaUrls" rows={2} placeholder="Vd: https://link1.jpg, https://link2.jpg" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition resize-y" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung mô tả chi tiết</label>
                  <textarea name="description" rows={4} placeholder="Vd: Phòng sạch thế, an ninh tốt, đầy đủ nội thất..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition resize-y" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer">Hủy bỏ</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer">Tạo tin đăng</button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}