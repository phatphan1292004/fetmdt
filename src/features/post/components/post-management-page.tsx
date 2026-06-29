"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STATUS_TABS = [
  "DANG HIEN THI",
  "HET HAN",
  "BI TU CHOI",
  "CAN THANH TOAN",
  "TIN NHAP",
  "CHO DUYET",
  "DA AN",
] as const;

const STATUS_MAP: Record<string, string> = {
  "DANG HIEN THI": "published",
  "HET HAN": "expired",
  "BI TU CHOI": "rejected",
  "CAN THANH TOAN": "pending_payment",
  "TIN NHAP": "draft",
  "CHO DUYET": "pending",
  "DA AN": "hidden",
};

export function PostManagementPage() {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("DANG HIEN THI");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        fetch("/api/v1/user/profile"),
        fetch("/api/v1/user/posts")
      ]);
      const profileData = await profileRes.json();
      const postsData = await postsRes.json();

      if (profileData.success) {
        setProfile(profileData.data);
      }
      if (postsData.success) {
        setPosts(postsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching management page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "hidden" : "published";
    try {
      const res = await fetch(`/api/v1/user/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, status: newStatus } : p))
        );
      } else {
        alert(data.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Đã xảy ra lỗi khi cập nhật trạng thái");
    }
  };

  const getCount = (tabName: string) => {
    const targetStatus = STATUS_MAP[tabName];
    return posts.filter((post) => post.status === targetStatus).length;
  };

  const filteredPosts = posts.filter((post) => {
    const targetStatus = STATUS_MAP[activeTab];
    if (post.status !== targetStatus) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.address.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Đang hiển thị";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Bị từ chối";
      case "hidden":
        return "Đã ẩn";
      case "draft":
        return "Tin nháp";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "published":
        return "bg-[#e8f9f8] text-[#0a7f86]";
      case "pending":
        return "bg-[#fff7df] text-[#b7791f]";
      case "rejected":
        return "bg-rose-50 text-rose-600";
      case "hidden":
        return "bg-slate-100 text-slate-500";
      case "draft":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const fullName = profile?.fullName || "Người dùng";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="flex-1 bg-[#f3f5f7] pb-12 pt-3">
      <section className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-8">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 px-4 pb-4 pt-4 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-slate-500">
                <Link
                  href="/"
                  className="font-medium text-[#0b7ea9] hover:underline"
                >
                  Phong Tot
                </Link>{" "}
                &gt;{" "}
                <span className="font-medium text-slate-700">Quan ly tin</span>
              </p>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 transition hover:border-slate-300"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f2483a] text-[10px] font-semibold text-white">
                  1
                </span>
                Co gi moi
              </button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
              <div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0b7ea9_0%,#25c3c8_100%)] text-sm font-bold text-white uppercase">
                    {initials}
                  </div>
                  <div>
                    <p className="text-[31px] font-bold leading-tight text-slate-900">
                      {fullName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="relative block">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M20 20L17 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tim tin dang cua ban..."
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
                  />
                </label>
              </div>
            </div>
          </div>

          <nav className="overflow-x-auto px-4 sm:px-5">
            <ul className="flex min-w-max items-center gap-7 py-4 text-sm font-bold tracking-[0.02em] text-slate-800">
              {STATUS_TABS.map((tab) => {
                const count = getCount(tab);
                const isActive = activeTab === tab;
                return (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap transition border-b-2 pb-2 ${
                        isActive
                          ? "border-[#0b7ea9] text-[#0b7ea9]"
                          : "border-transparent text-slate-500 hover:text-[#0b7ea9]"
                      }`}
                    >
                      {tab} ({count})
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </article>

        {loading ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <p className="text-slate-500 font-medium">Đang tải tin đăng của bạn...</p>
          </section>
        ) : filteredPosts.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:px-6">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f1f5f9_70%)]">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white">
                <span className="absolute -top-3 inline-flex rounded-md bg-[#f7cd00] px-2 py-1 text-xs font-extrabold text-slate-900 shadow-sm">
                  TIN
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-11 w-11 text-slate-300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <rect
                    x="5"
                    y="4"
                    width="14"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 9H16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 13H13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Khong tim thay tin dang
            </h2>
            <p className="mt-2 text-lg text-slate-600 sm:text-xl">
              Ban hien tai khong co tin dang nao cho trang thai nay
            </p>

            <Link
              href="/post"
              className="mt-6 inline-flex h-12 min-w-[180px] items-center justify-center rounded-lg bg-[#f59e0b] px-6 text-lg font-bold text-white shadow-[0_8px_18px_rgba(245,158,11,0.35)] transition hover:brightness-95"
            >
              Dang tin
            </Link>
          </section>
        ) : (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-sm font-bold text-slate-500">
                    <th className="px-6 py-4">Hình ảnh & Tin đăng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Ngày đăng</th>
                    <th className="px-6 py-4">Lượt xem</th>
                    <th className="px-6 py-4">Giá thuê</th>
                    <th className="px-6 py-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredPosts.map((post) => {
                    const mainImage = post.mediaUrls?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80";
                    return (
                      <tr key={post._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="h-16 w-20 shrink-0 rounded-lg bg-cover bg-center border border-slate-100"
                              style={{ backgroundImage: `url(${mainImage})` }}
                            />
                            <div>
                              <p className="font-semibold text-slate-900 line-clamp-1 max-w-[320px]">
                                {post.title}
                              </p>
                              <p className="text-xs text-slate-500 line-clamp-1 max-w-[320px] mt-1">
                                {post.address}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(post.status)}`}>
                            {getStatusLabel(post.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">
                          {post.views || 0}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-[#ef2f3d]">
                          {post.price.toLocaleString("vi-VN")}đ/tháng
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Link href={`/post?edit=${post._id}`} className="font-semibold text-[#0b7ea9] hover:underline">
                              Sửa
                            </Link>
                            {(post.status === "published" || post.status === "hidden") && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(post._id, post.status)}
                                className="font-semibold text-slate-600 hover:text-[#0b7ea9] hover:underline"
                              >
                                {post.status === "published" ? "Ẩn" : "Hiện"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
