"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  LuArrowLeft,
  LuSquarePen,
  LuX,
  LuMapPin,
  LuPhone,
  LuCalendarDays,
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

export default function AdminPostDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-3 text-sm font-medium">Đang tải chi tiết tin đăng...</p>
      </div>
    }>
      <AdminPostDetailContent />
    </Suspense>
  );
}

function AdminPostDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const id = params.id as string;
  const initialMode = searchParams.get("mode") === "edit" ? "edit" : "detail";


  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialMode);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/posts?id=${id}`);
      const result = await res.json();
      if (res.ok && result.success) {
        const fetchedPost = result.data;
        setPost({
          ...fetchedPost,
          status: mapBackendToFrontendStatus(fetchedPost.status),
          owner: fetchedPost.ownerId?.fullName || "Quản trị viên",
          phone: fetchedPost.ownerId?.phone || "0888022821"
        });
      } else {
        toast.error(result.message || "Không thể tải thông tin tin đăng");
        router.push("/admin/posts");
      }
    } catch (error) {
      console.error("Error fetching post detail:", error);
      toast.error("Đã xảy ra lỗi kết nối");
      router.push("/admin/posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: post.title,
      price: post.price,
      status: mapFrontendToBackendStatus(post.status),
      address: post.address,
      propertyType: post.propertyType,
      listingType: post.listingType,
      projectName: post.projectName,
      deposit: post.deposit,
      area: post.area,
      bedrooms: post.bedrooms,
      bathrooms: post.bathrooms,
      width: post.width,
      length: post.length,
      floors: post.floors,
      usableArea: post.usableArea,
      mainDirection: post.mainDirection,
      legalStatus: post.legalStatus,
      interiorStatus: post.interiorStatus,
      allowPets: post.allowPets,
      ownerType: post.ownerType,
      vipType: post.vipType,
      description: post.description,
      mediaUrls: post.mediaUrls
    };

    try {
      const res = await fetch(`/api/v1/admin/posts?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Cập nhật tin đăng thành công!");
        const updated = data.data;
        setPost({
          ...updated,
          status: mapBackendToFrontendStatus(updated.status),
          owner: updated.ownerId?.fullName || "Quản trị viên",
          phone: updated.ownerId?.phone || "0888022821"
        });
        setActiveTab("detail");
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-3 text-sm font-medium">Đang tải chi tiết tin đăng...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>Không tìm thấy thông tin tin đăng.</p>
        <button
          onClick={() => router.push("/admin/posts")}
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/posts")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-sm"
            title="Quay lại danh sách"
          >
            <LuArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Tin đăng #{post._id.slice(-6).toUpperCase()}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">Quản lý, xem chi tiết và chỉnh sửa dữ liệu tin đăng.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "detail" ? (
            <button
              onClick={() => setActiveTab("edit")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <LuSquarePen size={16} />
              Chỉnh sửa tin này
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("detail")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            >
              Xem chi tiết tin
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-sm px-4">
        <button
          onClick={() => setActiveTab("detail")}
          className={`py-3.5 px-5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "detail"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Chi tiết tin đăng
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`py-3.5 px-5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "edit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Chỉnh sửa dữ liệu
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === "detail" ? (
          /* TAB 1: CHI TIẾT TIN ĐĂNG */
          <div className="p-6 md:p-8 space-y-8">
            {/* Thư viện ảnh */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="space-y-3">
                <div className="relative h-80 md:h-[450px] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                  <img
                    src={post.mediaUrls[activeImageIndex] || post.mediaUrls[0]}
                    alt={post.title}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                  {post.vipType && post.vipType !== "free" && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                      <LuCrown size={12} />
                      {post.vipType.toUpperCase()}
                    </span>
                  )}
                </div>
                {post.mediaUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 font-sans">
                    {post.mediaUrls.map((url: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                          activeImageIndex === index ? "border-blue-600 scale-95" : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tiêu đề & Địa chỉ */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ${
                  post.status === "Đang hiển thị" ? "bg-emerald-100 text-emerald-700" :
                  post.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                }`}>
                  {post.status}
                </span>
                
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-600">
                  <LuLayers size={12} />
                  {post.propertyType === "nha_o" ? "Nhà ở" :
                   post.propertyType === "can_ho_chung_cu" ? "Căn hộ chung cư" : "Phòng trọ"}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">{post.title}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <LuMapPin className="text-slate-400 flex-shrink-0" size={16} />
                <span>{post.address}</span>
              </div>
            </div>

            {/* Thông tin Giá và Cọc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-rose-50 rounded-xl text-rose-600">
                  <LuCoins size={28} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Giá thuê</span>
                  <span className="text-2xl font-black text-rose-600">{Number(post.price).toLocaleString('vi-VN')} VNĐ/tháng</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
                  <LuCoins size={28} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Tiền đặt cọc</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {post.deposit ? `${Number(post.deposit).toLocaleString('vi-VN')} VNĐ` : "Không yêu cầu"}
                  </span>
                </div>
              </div>
            </div>

            {/* Thông số phòng */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Thông số phòng</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                  <LuRuler className="text-blue-500 mt-0.5" size={20} />
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Diện tích</span>
                    <span className="text-base font-bold text-slate-800">{post.area ? `${post.area} m²` : "Chưa cập nhật"}</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                  <LuRuler className="text-indigo-500 mt-0.5" size={20} />
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Sử dụng</span>
                    <span className="text-base font-bold text-slate-800">{post.usableArea ? `${post.usableArea} m²` : "Chưa cập nhật"}</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                  <LuRuler className="text-purple-500 mt-0.5" size={20} />
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Kích thước</span>
                    <span className="text-base font-bold text-slate-800">
                      {post.width && post.length ? `${post.width}x${post.length} m` : "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                  <LuBed className="text-teal-500 mt-0.5" size={20} />
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Phòng ngủ</span>
                    <span className="text-base font-bold text-slate-800">{post.bedrooms ? `${post.bedrooms} phòng` : "Chưa cập nhật"}</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                  <LuBath className="text-cyan-500 mt-0.5" size={20} />
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Nhà vệ sinh</span>
                    <span className="text-base font-bold text-slate-800">{post.bathrooms ? `${post.bathrooms} phòng` : "Chưa cập nhật"}</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                  <LuLayers className="text-amber-500 mt-0.5" size={20} />
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Số tầng</span>
                    <span className="text-base font-bold text-slate-800">{post.floors ? `${post.floors} tầng` : "Chưa cập nhật"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết & Quy định */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Thông tin chi tiết & Quy định</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                      <LuCompass size={18} className="text-slate-400" />
                      <span>Hướng chính</span>
                    </div>
                    <span className="font-bold text-slate-800">{post.mainDirection || "Chưa xác định"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                      <LuShieldCheck size={18} className="text-slate-400" />
                      <span>Pháp lý</span>
                    </div>
                    <span className="font-bold text-slate-800">{post.legalStatus || "Chưa xác định"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                      <LuSofa size={18} className="text-slate-400" />
                      <span>Nội thất</span>
                    </div>
                    <span className="font-bold text-slate-800">{post.interiorStatus || "Chưa xác định"}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                      <LuDog size={18} className="text-slate-400" />
                      <span>Thú cưng</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      post.allowPets === true ? "bg-emerald-50 text-emerald-600" :
                      post.allowPets === false ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
                    }`}>
                      {post.allowPets === true ? "Cho phép" :
                       post.allowPets === false ? "Không cho phép" : "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                      <LuHouse size={18} className="text-slate-400" />
                      <span>Tên dự án</span>
                    </div>
                    <span className="font-bold text-slate-800">{post.projectName || "Không có"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                      <LuUser size={18} className="text-slate-400" />
                      <span>Loại người đăng</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {post.ownerType === "ca_nhan" ? "Cá nhân" :
                       post.ownerType === "moi_gioi" ? "Môi giới" : "Chưa xác định"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chủ trọ & VIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                    {post.owner.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Chủ trọ</span>
                    <span className="text-base font-bold text-slate-800">{post.owner}</span>
                  </div>
                </div>
                <a href={`tel:${post.phone}`} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition shadow-xs">
                  <LuPhone size={16} />
                  <span>{post.phone}</span>
                </a>
              </div>

              <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Hạng tin đăng</span>
                  <span className={`px-3 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-sm ${
                    post.vipType === "supervip" ? "bg-red-500 text-white animate-pulse" :
                    post.vipType === "vip1" ? "bg-orange-500 text-white" :
                    post.vipType === "vip2" ? "bg-amber-500 text-white" :
                    post.vipType === "vip3" ? "bg-yellow-500 text-slate-800" :
                    "bg-slate-200 text-slate-600"
                  }`}>
                    {post.vipType || "FREE"}
                  </span>
                </div>
                {post.vipExpireAt && (
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <LuClock size={14} className="text-slate-400" />
                      Hết hạn VIP:
                    </span>
                    <span className="font-bold text-slate-700">
                      {new Date(post.vipExpireAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuCalendarDays size={14} className="text-slate-400" />
                    Ngày đăng:
                  </span>
                  <span className="font-bold text-slate-700">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Mô tả chi tiết</h4>
              <div className="text-sm text-slate-600 leading-relaxed bg-slate-50/30 border border-slate-200 p-5 rounded-2xl whitespace-pre-wrap">
                {post.description || "Người đăng không cung cấp mô tả chi tiết."}
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: CHỈNH SỬA TIN ĐĂNG */
          <form onSubmit={handleEditSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="md:col-span-2 border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Thông tin cơ bản</h4>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề phòng *</label>
                <input
                  type="text" value={post.title || ""} required
                  onChange={(e) => setPost({...post, title: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giá thuê (VNĐ/tháng) *</label>
                <input
                  type="number" value={post.price || ""} required
                  onChange={(e) => setPost({...post, price: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiền đặt cọc (VNĐ)</label>
                <input
                  type="number" value={post.deposit || ""}
                  onChange={(e) => setPost({...post, deposit: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chi tiết *</label>
                <input
                  type="text" value={post.address || ""} required
                  onChange={(e) => setPost({...post, address: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>

              {/* Phân loại & Trạng thái */}
              <div className="md:col-span-2 border-b border-slate-100 pb-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Phân loại & Trạng thái</h4>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại bất động sản</label>
                <select
                  value={post.propertyType || "phong_tro"}
                  onChange={(e) => setPost({...post, propertyType: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                >
                  <option value="phong_tro">Phòng trọ</option>
                  <option value="can_ho_chung_cu">Căn hộ chung cư</option>
                  <option value="nha_o">Nhà ở</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại tin đăng</label>
                <select
                  value={post.listingType || "cho_thue"}
                  onChange={(e) => setPost({...post, listingType: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                >
                  <option value="cho_thue">Cho thuê</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái duyệt *</label>
                <select
                  value={post.status || "Chờ duyệt"}
                  onChange={(e) => setPost({...post, status: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                >
                  <option value="Chờ duyệt">Chờ duyệt</option>
                  <option value="Đang hiển thị">Đang hiển thị</option>
                  <option value="Đã ẩn">Đã ẩn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gói tin (VIP)</label>
                <select
                  value={post.vipType || "free"}
                  onChange={(e) => setPost({...post, vipType: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                >
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
                <input
                  type="number" step="any" value={post.area || ""}
                  onChange={(e) => setPost({...post, area: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diện tích sử dụng (m²)</label>
                <input
                  type="number" step="any" value={post.usableArea || ""}
                  onChange={(e) => setPost({...post, usableArea: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chiều ngang (m)</label>
                <input
                  type="number" step="any" value={post.width || ""}
                  onChange={(e) => setPost({...post, width: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chiều dài (m)</label>
                <input
                  type="number" step="any" value={post.length || ""}
                  onChange={(e) => setPost({...post, length: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số phòng ngủ</label>
                <input
                  type="number" value={post.bedrooms || ""}
                  onChange={(e) => setPost({...post, bedrooms: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số nhà vệ sinh</label>
                <input
                  type="number" value={post.bathrooms || ""}
                  onChange={(e) => setPost({...post, bathrooms: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số tầng</label>
                <input
                  type="number" value={post.floors || ""}
                  onChange={(e) => setPost({...post, floors: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hướng chính</label>
                <input
                  type="text" value={post.mainDirection || ""}
                  onChange={(e) => setPost({...post, mainDirection: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>

              {/* Tiện ích */}
              <div className="md:col-span-2 border-b border-slate-100 pb-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Tiện ích & Thông tin bổ sung</h4>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pháp lý</label>
                <input
                  type="text" value={post.legalStatus || ""}
                  onChange={(e) => setPost({...post, legalStatus: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tình trạng nội thất</label>
                <input
                  type="text" value={post.interiorStatus || ""}
                  onChange={(e) => setPost({...post, interiorStatus: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên dự án (nếu có)</label>
                <input
                  type="text" value={post.projectName || ""}
                  onChange={(e) => setPost({...post, projectName: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cho phép vật nuôi</label>
                <select
                  value={post.allowPets === undefined ? "true" : String(post.allowPets)}
                  onChange={(e) => setPost({...post, allowPets: e.target.value === "true"})}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                >
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại người đăng</label>
                <select
                  value={post.ownerType || "ca_nhan"}
                  onChange={(e) => setPost({...post, ownerType: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                >
                  <option value="ca_nhan">Cá nhân</option>
                  <option value="moi_gioi">Môi giới</option>
                </select>
              </div>
              <div />

              {/* Hình ảnh & Mô tả */}
              <div className="md:col-span-2 border-b border-slate-100 pb-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">5. Hình ảnh & Mô tả chi tiết</h4>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Danh sách link ảnh (phân tách bằng dấu phẩy)</label>
                <textarea
                  rows={2}
                  value={post.mediaUrls ? post.mediaUrls.join(", ") : ""}
                  onChange={(e) => setPost({...post, mediaUrls: e.target.value.split(",").map((url: string) => url.trim())})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition resize-y"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung mô tả chi tiết</label>
                <textarea
                  rows={6}
                  value={post.description || ""}
                  onChange={(e) => setPost({...post, description: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab("detail")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
