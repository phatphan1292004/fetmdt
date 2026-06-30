"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  LuArrowLeft,
  LuSquarePen,
  LuMail,
  LuPhone,
  LuCalendarDays,
  LuShieldCheck,
  LuBan,
  LuUserCheck,
  LuUser,
  LuHeart,
  LuClock,
  LuCoins,
  LuActivity,
  LuExternalLink,
  LuFileText
} from "react-icons/lu";

export default function AdminUserDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-3 text-sm font-medium">Đang tải chi tiết người dùng...</p>
      </div>
    }>
      <AdminUserDetailContent />
    </Suspense>
  );
}

function AdminUserDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const initialMode = searchParams.get("mode") === "edit" ? "edit" : "overview";


  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialMode);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/users?id=${id}`);
      const result = await res.json();
      if (res.ok && result.success) {
        setUserData(result.data);
      } else {
        toast.error(result.message || "Không thể tải chi tiết người dùng");
        router.push("/admin/users");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Đã xảy ra lỗi kết nối");
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetail();
    }
  }, [id]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/users?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: userData.user.fullName,
          phone: userData.user.phone,
          role: userData.user.role,
          status: userData.user.status
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Cập nhật thông tin thành công!");
        setUserData({
          ...userData,
          user: data.data
        });
        setActiveTab("overview");
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  const handleToggleStatus = async () => {
    if (!userData) return;
    const currentStatus = userData.user.status;
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
          setUserData({
            ...userData,
            user: { ...userData.user, status: nextStatus }
          });
        } else {
          toast.error(data.message || "Thao tác thất bại");
        }
      } catch (error) {
        console.error("Error updating user status:", error);
        toast.error("Thao tác thất bại");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-3 text-sm font-medium">Đang tải chi tiết người dùng...</p>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>Không tìm thấy thông tin người dùng.</p>
        <button
          onClick={() => router.push("/admin/users")}
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const { user, posts, orders, savedPosts, activities } = userData;

  // Calculate sum of completed VIP orders
  const totalSpent = orders
    .filter((o: any) => o.status === "completed")
    .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/users")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-sm"
            title="Quay lại danh sách"
          >
            <LuArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl font-black text-blue-600 shadow-sm border border-white">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                {user.fullName}
                {user.role === "nguoi_cho_thue_tro" && (
                  <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-100 flex items-center gap-1">
                    <LuShieldCheck size={12} />
                    Chủ trọ
                  </span>
                )}
                {user.role === "nguoi_tim_tro" && (
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                    Người thuê
                  </span>
                )}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 font-mono">ID: {user._id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition shadow-sm cursor-pointer border ${
              user.status === "active"
                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
            }`}
          >
            {user.status === "active" ? (
              <>
                <LuBan size={16} />
                Khóa tài khoản
              </>
            ) : (
              <>
                <LuUserCheck size={16} />
                Mở khóa tài khoản
              </>
            )}
          </button>
          
          {activeTab !== "edit" ? (
            <button
              onClick={() => setActiveTab("edit")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <LuSquarePen size={16} />
              Chỉnh sửa thông tin
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("overview")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            >
              Xem tổng quan
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-sm px-4 overflow-x-auto scrollbar-none font-sans">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Tổng quan hồ sơ
        </button>
        {user.role === "nguoi_cho_thue_tro" && (
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "posts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Tin đăng sở hữu ({posts?.length || 0})
          </button>
        )}
        <button
          onClick={() => setActiveTab("orders")}
          className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "orders"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Giao dịch VIP ({orders?.length || 0})
        </button>
        {user.role === "nguoi_tim_tro" && (
          <button
            onClick={() => setActiveTab("saved")}
            className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "saved"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Tin đăng đã lưu ({savedPosts?.length || 0})
          </button>
        )}
        <button
          onClick={() => setActiveTab("activities")}
          className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "activities"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Nhật ký hoạt động ({activities?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "edit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Cấu hình thông tin
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === "overview" && (
          /* TAB 1: TỔNG QUAN HỒ SƠ */
          <div className="p-6 md:p-8 space-y-8">
            {/* Thống kê nhanh */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Hệ thống bài đăng</span>
                <span className="text-3xl font-black text-blue-600 mt-2">{posts?.length || 0}</span>
                <span className="text-xs text-slate-400 mt-1">Tin đã tạo trên hệ thống</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tổng chi dịch vụ</span>
                <span className="text-3xl font-black text-emerald-600 mt-2">{totalSpent.toLocaleString("vi-VN")}đ</span>
                <span className="text-xs text-slate-400 mt-1">Giao dịch VIP đã mua</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tin đã lưu</span>
                <span className="text-3xl font-black text-purple-600 mt-2">{savedPosts?.length || 0}</span>
                <span className="text-xs text-slate-400 mt-1">Lưu trữ tin ưu thích</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Số lượt hoạt động</span>
                <span className="text-3xl font-black text-amber-600 mt-2">{activities?.length || 0}</span>
                <span className="text-xs text-slate-400 mt-1">Nhật ký hệ thống gần nhất</span>
              </div>
            </div>

            {/* Profile info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Thông tin liên hệ</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <LuMail size={16} className="text-slate-400" />
                    Địa chỉ Email
                  </span>
                  <span className="font-bold text-slate-800">{user.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-slate-50 pt-3">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <LuPhone size={16} className="text-slate-400" />
                    Số điện thoại
                  </span>
                  <span className="font-bold text-slate-800">{user.phone || "Chưa cập nhật"}</span>
                </div>
              </div>

              <div className="border border-slate-200 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Hồ sơ tài khoản</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <LuUser size={16} className="text-slate-400" />
                    Trạng thái tài khoản
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                    user.status === "active" ? "text-emerald-600" : user.status === "blocked" ? "text-rose-600" : "text-amber-600"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${user.status === "active" ? "bg-emerald-500" : user.status === "blocked" ? "bg-rose-500" : "bg-amber-500"}`} />
                    {user.status === "active" ? "Đang hoạt động" : user.status === "blocked" ? "Bị khóa" : "Chờ kích hoạt"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-slate-50 pt-3">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <LuCalendarDays size={16} className="text-slate-400" />
                    Ngày tham gia
                  </span>
                  <span className="font-bold text-slate-800">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "posts" && user.role === "nguoi_cho_thue_tro" && (
          /* TAB 2: TIN ĐĂNG SỞ HỮU */
          <div className="p-6 md:p-8 space-y-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Danh sách bài đăng của {user.fullName}</h4>
            {(!posts || posts.length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-10">Người dùng này chưa đăng tin nào.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Mã tin</th>
                      <th className="px-5 py-3.5 font-bold">Tiêu đề</th>
                      <th className="px-5 py-3.5 font-bold">Loại tài sản</th>
                      <th className="px-5 py-3.5 font-bold">Giá thuê</th>
                      <th className="px-5 py-3.5 font-bold">Trạng thái</th>
                      <th className="px-5 py-3.5 font-bold text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posts.map((post: any) => (
                      <tr key={post._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-800">
                          #{post._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 max-w-[200px] truncate" title={post.title}>
                          {post.title}
                        </td>
                        <td className="px-5 py-3.5">
                          {post.propertyType === "nha_o" ? "Nhà ở" :
                           post.propertyType === "can_ho_chung_cu" ? "Căn hộ" : "Phòng trọ"}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-rose-600">
                          {post.price.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            post.status === "published" ? "bg-emerald-100 text-emerald-700" :
                            post.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                          }`}>
                            {post.status === "published" ? "Đang hiển thị" :
                             post.status === "pending" ? "Chờ duyệt" : "Đã ẩn"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => router.push(`/admin/posts/${post._id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                          >
                            <LuExternalLink size={12} />
                            Xem tin
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          /* TAB 3: GIAO DỊCH VIP */
          <div className="p-6 md:p-8 space-y-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Lịch sử đặt mua gói dịch vụ VIP</h4>
            {(!orders || orders.length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-10">Người dùng chưa thực hiện giao dịch mua gói nào.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Mã giao dịch</th>
                      <th className="px-5 py-3.5 font-bold">Gói tin</th>
                      <th className="px-5 py-3.5 font-bold">Số tiền</th>
                      <th className="px-5 py-3.5 font-bold">Thời hạn</th>
                      <th className="px-5 py-3.5 font-bold">Bài đăng</th>
                      <th className="px-5 py-3.5 font-bold">Trạng thái</th>
                      <th className="px-5 py-3.5 font-bold">Thời gian mua</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order: any) => (
                      <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-800">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">
                          {order.packageName}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-emerald-600">
                          {order.amount.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="px-5 py-3.5 text-xs">
                          {order.duration} ngày
                        </td>
                        <td className="px-5 py-3.5 max-w-[150px] truncate text-xs" title={order.post?.title || "Tin đăng đã bị xóa"}>
                          {order.post ? (
                            <button
                              onClick={() => router.push(`/admin/posts/${order.post._id}`)}
                              className="text-blue-600 hover:underline text-left font-semibold"
                            >
                              {order.post.title}
                            </button>
                          ) : (
                            <span className="text-slate-400">Tin đăng không còn tồn tại</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase shadow-sm ${
                            order.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                            order.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                          }`}>
                            {order.status === "completed" ? "Hoàn thành" :
                             order.status === "pending" ? "Đang xử lý" : "Đã hủy"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && user.role === "nguoi_tim_tro" && (
          /* TAB 4: TIN ĐĂNG ĐÃ LƯU */
          <div className="p-6 md:p-8 space-y-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tin đăng người dùng lưu trữ yêu thích</h4>
            {(!savedPosts || savedPosts.length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-10">Người dùng này chưa lưu tin đăng nào.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Mã tin</th>
                      <th className="px-5 py-3.5 font-bold">Tiêu đề tin</th>
                      <th className="px-5 py-3.5 font-bold">Giá thuê</th>
                      <th className="px-5 py-3.5 font-bold">Địa chỉ</th>
                      <th className="px-5 py-3.5 font-bold text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savedPosts.map((saved: any) => {
                      const post = saved.postId;
                      if (!post) return null;
                      return (
                        <tr key={saved._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-800">
                            #{post._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-5 py-3.5 max-w-[200px] truncate" title={post.title}>
                            {post.title}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-rose-600">
                            {post.price.toLocaleString("vi-VN")}đ
                          </td>
                          <td className="px-5 py-3.5 max-w-[200px] truncate" title={post.address}>
                            {post.address}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => router.push(`/admin/posts/${post._id}`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                            >
                              <LuExternalLink size={12} />
                              Xem tin
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "activities" && (
          /* TAB 5: NHẬT KÝ HOẠT ĐỘNG */
          <div className="p-6 md:p-8 space-y-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">20 Nhật ký hoạt động gần đây nhất</h4>
            {(!activities || activities.length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-10">Không tìm thấy nhật ký hoạt động nào.</p>
            ) : (
              <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6">
                {activities.map((activity: any) => (
                  <div key={activity._id} className="relative">
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white">
                      <LuActivity className="text-white" size={10} />
                    </span>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-800">{activity.title}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <LuClock size={12} />
                        {new Date(activity.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    {activity.metadata && (
                      <pre className="mt-2 rounded-xl bg-slate-50 p-3 text-xs font-mono text-slate-600 overflow-x-auto">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "edit" && (
          /* TAB 6: CHỈNH SỬA THÔNG TIN CÁ NHÂN */
          <form onSubmit={handleEditSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin tài khoản chính</h4>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={userData.user.fullName || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      user: { ...userData.user, fullName: e.target.value }
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={userData.user.phone || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      user: { ...userData.user, phone: e.target.value }
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Vai trò hệ thống</label>
                <select
                  value={userData.user.role || "nguoi_tim_tro"}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      user: { ...userData.user, role: e.target.value }
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                >
                  <option value="nguoi_tim_tro">Người thuê trọ</option>
                  <option value="nguoi_cho_thue_tro">Chủ cho thuê trọ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Trạng thái hoạt động</label>
                <select
                  value={userData.user.status || "active"}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      user: { ...userData.user, status: e.target.value }
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="blocked">Bị khóa (blocked)</option>
                  <option value="pending">Chờ kích hoạt</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ Email (Định danh - Không cho phép chỉnh sửa)</label>
                <input
                  type="email"
                  disabled
                  value={userData.user.email || ""}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-400 bg-slate-50 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
              >
                Lưu cấu hình
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
