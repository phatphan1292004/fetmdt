"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { IoCopyOutline, IoCheckmarkCircle } from "react-icons/io5";

type ProfileTabId = "info" | "saved" | "manage" | "buff";

type TabItem = {
  id: ProfileTabId;
  label: string;
};

type ProfileData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  status: string;
  avatarUrl?: string | null;
  preferredArea?: string;
  identityCard?: string;
  occupation?: string;
  hobbies?: string[];
  createdAt?: string;
  lastLoginAt?: string | null;
};

type ActivityItem = {
  id: string;
  title: string;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

type ProfileSummary = {
  followersCount: number;
  followingCount: number;
  walletBalance: number;
  stats: {
    activePosts: number;
    savedPosts: number;
    views7Days: number;
    responseRate: number;
  };
};

type SavedPost = {
  id: string;
  title: string;
  address: string;
  priceLabel: string;
  areaLabel: string;
  imageUrl: string;
};

type ManagedPost = {
  id: string;
  title: string;
  status: "Đang hiển thị" | "Chờ duyệt" | "Hết hạn";
  postedAt: string;
  views: number;
  priceLabel: string;
};

const TABS: readonly TabItem[] = [
  { id: "info", label: "Thông tin cá nhân" },
  { id: "saved", label: "Tin đăng đã lưu" },
  { id: "manage", label: "Quản lý tin đăng" },
  { id: "buff", label: "Dịch vụ đẩy tin" },
];

const SAVED_POSTS: readonly SavedPost[] = [
  {
    id: "saved-1",
    title: "Phòng trọ gần ĐH Thương Mại",
    address: "Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội",
    priceLabel: "3.200.000đ/tháng",
    areaLabel: "22 m2",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "saved-2",
    title: "Studio đầy đủ nội thất Mỹ Đình",
    address: "Mỹ Đình 2, Nam Từ Liêm, Hà Nội",
    priceLabel: "4.600.000đ/tháng",
    areaLabel: "28 m2",
    imageUrl:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "saved-3",
    title: "Căn mini có gác xép, bao phí wifi",
    address: "Hồ Tùng Mậu, Cầu Giấy, Hà Nội",
    priceLabel: "3.900.000đ/tháng",
    areaLabel: "25 m2",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
];

const MANAGED_POSTS: readonly ManagedPost[] = [
  {
    id: "m-1",
    title: "Phòng trọ full nội thất - Lê Đức Thọ",
    status: "Đang hiển thị",
    postedAt: "14/04/2026",
    views: 132,
    priceLabel: "4.100.000đ/tháng",
  },
  {
    id: "m-2",
    title: "Phòng không chung chủ - Trần Bình",
    status: "Chờ duyệt",
    postedAt: "13/04/2026",
    views: 0,
    priceLabel: "3.400.000đ/tháng",
  },
  {
    id: "m-3",
    title: "Căn mini ban công thoáng - Hoàng Quốc Việt",
    status: "Hết hạn",
    postedAt: "01/04/2026",
    views: 265,
    priceLabel: "4.800.000đ/tháng",
  },
];

const DEFAULT_PROFILE_STATS = [
  { label: "Tin đăng đang hiển thị", value: "0" },
  { label: "Tin đăng đã lưu", value: "0" },
  { label: "Lượt xem 7 ngày", value: "0" },
  { label: "Tỷ lệ phản hồi", value: "0%" },
] as const;

const DEFAULT_ACTIVITIES = [
  { title: "Cập nhật ảnh đại diện", time: "2 giờ trước" },
  { title: "Lưu tin Studio Mỹ Đình", time: "Hôm nay" },
  { title: "Đăng nhập từ Chrome Windows", time: "14/04/2026" },
  { title: "Cập nhật thông tin liên hệ", time: "12/04/2026" },
] as const;

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatActivityTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Hôm nay";
  if (diffDays === 1) return "1 ngày trước";
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatDate(value);
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function statusClassName(status: ManagedPost["status"]) {
  if (status === "Đang hiển thị") {
    return "bg-[#e8f9f8] text-[#0a7f86]";
  }

  if (status === "Chờ duyệt") {
    return "bg-[#fff7df] text-[#b7791f]";
  }

  return "bg-slate-100 text-slate-600";
}

function ProfileInfoTab() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    preferredArea: "",
    identityCard: "",
    occupation: "",
    hobbies: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!avatarFile) return;
    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/v1/user/profile");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Không thể tải hồ sơ");
        if (!isMounted) return;

        setProfile(data.data);
        setFormState({
          fullName: data.data.fullName || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          preferredArea: data.data.preferredArea || "",
          identityCard: data.data.identityCard || "",
          occupation: data.data.occupation || "",
          hobbies: data.data.hobbies?.join(", ") || "",
        });
      } catch (error: any) {
        if (!isMounted) return;
        setErrorMessage(error.message || "Không thể tải hồ sơ");
      }
    };

    const loadActivities = async () => {
      try {
        const res = await fetch("/api/v1/user/activities?limit=4");
        const data = await res.json();
        if (!res.ok) return;
        if (!isMounted) return;
        setActivities(data.data || []);
      } catch {
        if (!isMounted) return;
        setActivities([]);
      }
    };

    const loadSummary = async () => {
      try {
        const res = await fetch("/api/v1/user/summary");
        const data = await res.json();
        if (!res.ok) return;
        if (!isMounted) return;
        setSummary(data.data || null);
      } catch {
        if (!isMounted) return;
        setSummary(null);
      }
    };

    setLoading(true);
    setErrorMessage(null);
    Promise.all([loadProfile(), loadActivities(), loadSummary()]).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = profile?.fullName || (loading ? "Đang tải..." : "Khách");
  const displayNameEditing = editing ? formState.fullName || displayName : displayName;
  const accountId = profile?.id ? `V${profile.id.slice(-12).toUpperCase()}` : "V--------";
  const avatarSrc = avatarPreview || profile?.avatarUrl || null;
  const followersCount = summary?.followersCount ?? 0;
  const followingCount = summary?.followingCount ?? 0;
  const walletBalance = summary?.walletBalance ?? 0;
  const stats = summary?.stats;
  const profileStats = stats
    ? [
        { label: "Tin đăng đang hiển thị", value: formatNumber(stats.activePosts) },
        { label: "Tin đăng đã lưu", value: formatNumber(stats.savedPosts) },
        { label: "Lượt xem 7 ngày", value: formatNumber(stats.views7Days) },
        { label: "Tỷ lệ phản hồi", value: `${formatNumber(stats.responseRate)}%` },
      ]
    : DEFAULT_PROFILE_STATS;
  const accountInfo = [
    { key: "fullName", label: "Họ và tên", value: profile?.fullName || "--", editable: true },
    { key: "phone", label: "Số điện thoại", value: profile?.phone || "--", editable: true },
    { key: "email", label: "Email", value: profile?.email || "--", editable: true },
    { key: "identityCard", label: "Số CCCD", value: profile?.identityCard || "--", editable: true },
    { key: "occupation", label: "Nghề nghiệp", value: profile?.occupation || "--", editable: true },
    { key: "hobbies", label: "Sở thích", value: profile?.hobbies?.join(", ") || "--", editable: true },
    { key: "preferredArea", label: "Khu vực ưu tiên", value: profile?.preferredArea || "--", editable: true },
    { key: "createdAt", label: "Ngày tham gia", value: formatDate(profile?.createdAt) || "--", editable: false },
  ] as const;

  const activityItems = activities.length
    ? activities.map((item, index) => ({
        key: item.id || `${item.title}-${item.createdAt}-${index}`,
        title: item.title,
        time: formatActivityTime(item.createdAt),
      }))
    : DEFAULT_ACTIVITIES.map((item, index) => ({
        key: `default-${index}`,
        title: item.title,
        time: item.time,
      }));

  const handleAvatarClick = () => {
    if (!editing) setEditing(true);
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
  };

  const startEdit = () => {
    if (!profile) return;
    setEditing(true);
    setErrorMessage(null);
    setAvatarFile(null);
    setAvatarPreview(profile.avatarUrl || null);
    setFormState({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      preferredArea: profile.preferredArea || "",
      identityCard: profile.identityCard || "",
      occupation: profile.occupation || "",
      hobbies: profile.hobbies?.join(", ") || "",
    });
  };

  const cancelEdit = () => {
    setEditing(false);
    setErrorMessage(null);
    setAvatarFile(null);
    setAvatarPreview(profile?.avatarUrl || null);
    if (profile) {
      setFormState({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        preferredArea: profile.preferredArea || "",
        identityCard: profile.identityCard || "",
        occupation: profile.occupation || "",
        hobbies: profile.hobbies?.join(", ") || "",
      });
    }
  };

  const handleFieldChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      let res: Response;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("fullName", formState.fullName);
        formData.append("email", formState.email);
        formData.append("phone", formState.phone);
        formData.append("preferredArea", formState.preferredArea);
        formData.append("identityCard", formState.identityCard);
        formData.append("occupation", formState.occupation);
        formData.append("hobbies", formState.hobbies);
        formData.append("avatar", avatarFile);

        res = await fetch("/api/v1/user/profile", {
          method: "PATCH",
          body: formData,
        });
      } else {
        res = await fetch("/api/v1/user/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formState.fullName,
            email: formState.email,
            phone: formState.phone,
            preferredArea: formState.preferredArea,
            identityCard: formState.identityCard,
            occupation: formState.occupation,
            hobbies: formState.hobbies.split(",").map((s) => s.trim()).filter(Boolean),
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      setProfile(data.data);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(data.data?.avatarUrl || null);

      const activityRes = await fetch("/api/v1/user/activities?limit=4");
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.data || []);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="relative mx-auto h-22 w-22 overflow-hidden rounded-full border-4 border-white shadow-[0_8px_18px_rgba(15,23,42,0.2)]">
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(145deg,#1f2937_0%,#22c2c7_100%)]" />
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            className="absolute bottom-1 right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
            aria-label="Cập nhật ảnh đại diện"
            onClick={handleAvatarClick}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 20H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M8 16L16 8L19 11L11 19L8 20V16Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <h2 className="mt-3 text-3xl font-extrabold text-slate-900">{displayNameEditing}</h2>
        <p className="mt-1 text-slate-500">
          Người theo dõi {formatNumber(followersCount)} · Đang theo dõi {formatNumber(followingCount)}
        </p>

        <div className="mt-5 rounded-2xl bg-[#f5f7fa] p-4 text-left sm:p-5">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <p className="text-sm text-slate-500">TK định danh</p>
              <p className="mt-1 text-base font-semibold text-slate-800">{accountId}</p>
            </div>
            <button type="button" className="mt-1 text-slate-400 hover:text-slate-600" aria-label="Sao chép mã định danh">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 15V6C5 4.9 5.9 4 7 4H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <p className="font-semibold text-slate-800">Đồng Tốt</p>
            <p className="font-extrabold text-slate-900">{formatNumber(walletBalance)}</p>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#f7cd00] text-base font-bold text-slate-900 transition hover:brightness-95"
          >
            Nạp ngay
          </button>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {profileStats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-4 grid max-w-4xl gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-lg font-extrabold text-slate-800">Thông tin tài khoản</h3>
          <div className="space-y-3">
            {accountInfo.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                <p className="text-sm text-slate-500">{item.label}</p>
                {editing && item.editable ? (
                  <input
                    type="text"
                    value={formState[item.key as keyof typeof formState]}
                    onChange={(event) =>
                      handleFieldChange(item.key as keyof typeof formState, event.target.value)
                    }
                    className="h-9 w-56 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-[#0b7ea9]"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-lg border border-[#0b7ea9] px-3 text-sm font-semibold text-[#0b7ea9] transition hover:bg-[#effaff]"
              onClick={editing ? handleSave : startEdit}
              disabled={saving || loading}
            >
              {editing ? (saving ? "Đang lưu..." : "Lưu thay đổi") : "Chỉnh sửa hồ sơ"}
            </button>
            {editing ? (
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={cancelEdit}
                disabled={saving}
              >
                Hủy
              </button>
            ) : null}
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Đổi mật khẩu
            </button>
          </div>
          {errorMessage ? <p className="mt-3 text-sm text-[#ef2f3d]">{errorMessage}</p> : null}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-lg font-extrabold text-slate-800">Hoạt động gần đây</h3>
          <ul className="space-y-3">
            {activityItems.map((item) => (
              <li key={item.key} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                <span className="text-sm text-slate-700">{item.title}</span>
                <span className="shrink-0 text-xs font-medium text-slate-500">{item.time}</span>
              </li>
            ))}
          </ul>

          <button type="button" className="mt-4 text-sm font-semibold text-[#0b7ea9] hover:underline">
            Xem lịch sử đầy đủ
          </button>
        </article>
      </div>
    </section>
  );
}

function SavedPostsTab() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-5">
        <h2 className="text-2xl font-extrabold text-slate-900">Tin đăng đã lưu</h2>
        <p className="mt-1 text-slate-600">Danh sách tin bạn đã lưu để theo dõi.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {SAVED_POSTS.map((post) => (
          <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.07)]">
            <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${post.imageUrl})` }} aria-hidden />

            <div className="space-y-2 p-4">
              <h3 className="line-clamp-2 text-[18px] font-bold leading-tight text-slate-900">{post.title}</h3>
              <p className="text-sm text-slate-500">{post.address}</p>

              <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                <div>
                  <p className="text-[21px] font-extrabold leading-none text-[#ef2f3d]">{post.priceLabel}</p>
                  <p className="mt-1 text-sm text-slate-600">{post.areaLabel}</p>
                </div>

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#7cdadf] hover:text-[#0b7ea9]"
                  aria-label="Bỏ lưu tin"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M12.1 20.3l-1.1-1C6 15 3 12.3 3 8.9 3 6.1 5.1 4 7.9 4c1.6 0 3.1.8 4.1 2.1C13 4.8 14.5 4 16.1 4 18.9 4 21 6.1 21 8.9c0 3.4-3 6.1-8 10.4l-.9 1z" />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ManagedPostsTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/user/posts");
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
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

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Quản lý tin đăng</h2>
            <p className="mt-1 text-slate-600">Theo dõi hiệu quả và cập nhật trạng thái tin đăng của bạn.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/post"
              className="inline-flex h-10 items-center rounded-xl bg-[#f7cd00] px-4 text-sm font-bold text-slate-900 transition hover:brightness-95"
            >
              Đăng tin mới
            </Link>
            <Link
              href="/post-manage"
              className="inline-flex h-10 items-center rounded-xl border border-[#0b7ea9] px-4 text-sm font-semibold text-[#0b7ea9] transition hover:bg-[#effaff]"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-slate-500 font-medium">Đang tải danh sách tin...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-slate-500 font-medium">Bạn chưa có tin đăng nào.</p>
              <Link
                href="/post"
                className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#f7cd00] px-4 text-sm font-bold text-slate-900 transition hover:brightness-95"
              >
                Đăng tin ngay
              </Link>
            </div>
          ) : (
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-sm text-slate-500">
                  <th className="px-4 py-3 font-semibold sm:px-5">Tin đăng</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Ngày đăng</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Lượt xem</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Giá</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {posts.map((post) => (
                  <tr key={post._id} className="border-t border-slate-100 text-sm text-slate-700">
                    <td className="px-4 py-3.5 sm:px-5">
                      <p className="max-w-[260px] font-semibold text-slate-900">{post.title}</p>
                      <p className="max-w-[260px] text-xs text-slate-500 truncate mt-0.5">{post.address}</p>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">{formatDate(post.createdAt)}</td>
                    <td className="px-4 py-3.5 sm:px-5">{post.views || 0}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#ef2f3d] sm:px-5">
                      {post.price.toLocaleString("vi-VN")}đ/tháng
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}

function BuffPostsTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(7); // 7 days default
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activePackage, setActivePackage] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/v1/user/posts");
        const data = await res.json();
        if (data.success) {
          const fetchedPosts = data.data || [];
          setPosts(fetchedPosts);
          if (fetchedPosts.length > 0) {
            setSelectedPost(fetchedPosts[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching posts for buff:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);
  
  // VietQR integration states
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [qrAmount, setQrAmount] = useState(0);
  const [qrDescription, setQrDescription] = useState("");
  const [copiedType, setCopiedType] = useState<"account" | "amount" | "desc" | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const packages = [
    {
      id: "vip1",
      name: "VIP 1 (Siêu Cấp)",
      price: 50000,
      description: "Tiếp cận lượng khách hàng tối đa, ghim đầu trang tìm kiếm",
      features: [
        "Ghim đầu trang tìm kiếm danh mục",
        "Thẻ bài đăng nổi bật (Glow border)",
        "Tự động đẩy tin (Auto push) mỗi 2 giờ",
        "Tiếp cận lượng khách hàng gấp 10 lần",
        "Hỗ trợ thiết kế hình ảnh & bài đăng chuyên nghiệp",
      ],
      isPopular: true,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600",
    },
    {
      id: "vip2",
      name: "VIP 2 (Nổi Bật)",
      price: 30000,
      description: "Hiển thị nổi bật phía dưới tin VIP 1, tiếp cận gấp 5 lần",
      features: [
        "Hiển thị ưu tiên phía dưới gói VIP 1",
        "Thẻ bài đăng có viền xanh lá nổi bật",
        "Tự động đẩy tin (Auto push) mỗi 6 giờ",
        "Tiếp cận lượng khách hàng gấp 5 lần",
      ],
      isPopular: false,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
    },
    {
      id: "vip3",
      name: "VIP 3 (Tiết Kiệm)",
      price: 15000,
      description: "Hiển thị ưu tiên hơn tin thường, chi phí tiết kiệm",
      features: [
        "Hiển thị ưu tiên hơn tin thường",
        "Biểu tượng ngôi sao vàng nổi bật",
        "Tự động đẩy tin (Auto push) 1 lần/ngày",
        "Tiếp cận lượng khách hàng gấp 2.5 lần",
      ],
      isPopular: false,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
    },
  ];

  const handleOpenConfirm = (pkg: typeof packages[0]) => {
    setActivePackage(pkg);
    setIsConfirmOpen(true);
    setShowQrCode(false);
    setQrUrl("");
  };

  const handleConfirmPurchase = () => {
    if (!activePackage) return;
    
    // Read VietQR settings from env or use defaults
    const bankId = process.env.NEXT_PUBLIC_VIETQR_BANK_ID || "TCB";
    const bankName = process.env.NEXT_PUBLIC_VIETQR_BANK_NAME || "Techcombank";
    const accountNo = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || "1273702222";
    const accountName = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || "PHAN VAN PHAT";
    const prefix = process.env.NEXT_PUBLIC_VIETQR_TRANSFER_PREFIX || "PHONGTOT";
    const template = "qr_only";

    const totalCost = activePackage.price * selectedDuration;
    const discount = selectedDuration >= 15 ? 0.9 : 1;
    const finalCost = Math.round(totalCost * discount);

    // Build Transfer Description: PREFIX + POST_ID + DURATION + D
    const rawDescription = `${prefix} ${selectedPost.toUpperCase()} ${selectedDuration}D`;
    const encodedDescription = encodeURIComponent(rawDescription);
    const encodedAccountName = encodeURIComponent(accountName);

    // VietQR endpoint: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png
    const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${finalCost}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;

    setQrUrl(url);
    setQrAmount(finalCost);
    setQrDescription(rawDescription);
    setShowQrCode(true);
  };

  const handleCopyText = (text: string, type: "account" | "amount" | "desc") => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => {
        setCopiedType(null);
      }, 2000);
    }
  };

  const handleFinishPayment = async () => {
    try {
      const response = await fetch("/api/v1/user/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: selectedPost,
          packageId: activePackage?.id,
          packageName: activePackage?.name,
          amount: qrAmount,
          duration: selectedDuration,
          description: qrDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToastMessage("Hệ thống đã ghi nhận đơn hàng và đang kiểm tra giao dịch của bạn. Tin đăng sẽ được kích hoạt sau vài phút!");
      } else {
        setToastMessage(`Lỗi tạo đơn hàng: ${data.message || "Không xác định"}`);
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      setToastMessage("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ!");
    }

    setIsConfirmOpen(false);
    setShowQrCode(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };


  return (
    <section className="space-y-6 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-[15px] font-medium text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-md border border-slate-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <h2 className="text-2xl font-extrabold text-slate-900">Dịch vụ đẩy tin & VIP</h2>
        <p className="mt-1 text-slate-600 text-[15px]">
          Tăng lượt tiếp cận khách hàng gấp 10 lần, chốt khách thuê phòng nhanh nhất.
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {packages.map((pkg) => (
          <article
            key={pkg.id}
            className={`relative rounded-3xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
              pkg.isPopular
                ? "border-amber-400 ring-2 ring-amber-400/20 scale-[1.02] md:scale-[1.03]"
                : "border-slate-200"
            }`}
          >
            {pkg.isPopular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                Khuyên Dùng
              </span>
            )}

            <div>
              <h3 className="font-extrabold text-xl text-slate-900 leading-snug">{pkg.name}</h3>
              <p className="text-slate-500 text-xs mt-1.5 min-h-[32px]">{pkg.description}</p>

              <div className="my-4 border-y border-slate-100 py-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {pkg.price.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-slate-500 text-xs font-semibold">/ ngày</span>
              </div>

              <ul className="space-y-2.5 mb-6">
                {pkg.features.map((feat, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className={`text-base font-bold shrink-0 ${pkg.textColor}`}>✓</span>
                    <span className="leading-tight">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleOpenConfirm(pkg)}
              type="button"
              className={`w-full py-3 rounded-xl font-extrabold text-[15px] transition shadow-sm ${
                pkg.isPopular
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-95 hover:shadow-[0_4px_14px_rgba(245,158,11,0.35)]"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Kích hoạt ngay
            </button>
          </article>
        ))}
      </div>

      {/* Confirmation & VietQR Purchase Modal */}
      {isConfirmOpen && activePackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-100 flex flex-col gap-5 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            
            {!showQrCode ? (
              // STEP 1: Select Listing & Duration
              <>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Kích hoạt Gói dịch vụ</h3>
                  <p className="text-slate-500 text-sm mt-1">Vui lòng chọn bài viết và số ngày muốn kích hoạt.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Chọn tin đăng của bạn
                    </label>
                    {loading ? (
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-500">
                        Đang tải danh sách tin...
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center bg-slate-50">
                        <p className="text-sm text-slate-500">Bạn chưa có tin đăng nào.</p>
                        <Link href="/post" className="mt-2 inline-flex text-xs font-bold text-[#0b7ea9] hover:underline">
                          Đăng tin ngay
                        </Link>
                      </div>
                    ) : (
                      <select
                        value={selectedPost}
                        onChange={(e) => setSelectedPost(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0b7ea9] transition"
                      >
                        {posts.map((post) => (
                          <option key={post._id} value={post._id}>
                            {post.title} ({post.price.toLocaleString("vi-VN")}đ/tháng)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Chọn thời gian kích hoạt
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 7, 15, 30].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setSelectedDuration(days)}
                          className={`py-3.5 rounded-xl border text-sm font-bold transition flex flex-col items-center justify-center ${
                            selectedDuration === days
                              ? "border-[#0b7ea9] bg-[#effaff] text-[#0b7ea9]"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>{days} ngày</span>
                          {days >= 15 && (
                            <span className="text-[10px] text-emerald-500 font-extrabold mt-0.5">
                              -10%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Gói dịch vụ</span>
                      <span className="font-semibold">{activePackage.name}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Đơn giá / ngày</span>
                      <span className="font-semibold">
                        {activePackage.price.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Thời gian</span>
                      <span className="font-semibold">{selectedDuration} ngày</span>
                    </div>
                    {selectedDuration >= 15 && (
                      <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                        <span>Chiết khấu (10%)</span>
                        <span>
                          -{Math.round(activePackage.price * selectedDuration * 0.1).toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-slate-900">
                      <span>Tổng thanh toán</span>
                      <span className="text-[#ef2f3d]">
                        {Math.round(
                          activePackage.price * selectedDuration * (selectedDuration >= 15 ? 0.9 : 1)
                        ).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    className="flex-1 py-3 rounded-xl bg-[#0b7ea9] hover:bg-[#09678a] text-white text-sm font-bold transition shadow-md shadow-blue-500/10"
                  >
                    Tạo mã QR thanh toán
                  </button>
                </div>
              </>
            ) : (
              // STEP 2: VietQR scan payment
              <>
                <div className="text-center">
                  <h3 className="text-xl font-extrabold text-slate-900">Thanh toán qua VietQR</h3>
                  <p className="text-slate-500 text-sm mt-1">Sử dụng ứng dụng Ngân hàng quét mã dưới đây để kích hoạt dịch vụ.</p>
                </div>

                {/* QR Code and Waiting indicator */}
                <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-inner">
                  <img
                    src={qrUrl}
                    alt="Mã QR VietQR"
                    className="w-56 h-56 border border-slate-200 p-2.5 rounded-2xl bg-white shadow-sm"
                  />
                  <div className="mt-3 flex items-center gap-2 text-slate-600 text-xs font-semibold">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                    <span>Đang chờ quét mã thanh toán...</span>
                  </div>
                </div>

                {/* Transfer Info */}
                <div className="space-y-2.5 text-sm border-t border-slate-100 pt-3">
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/60">
                    <span className="text-slate-500">Ngân hàng</span>
                    <span className="font-bold text-slate-800">
                      {process.env.NEXT_PUBLIC_VIETQR_BANK_NAME || "Techcombank"} ({process.env.NEXT_PUBLIC_VIETQR_BANK_ID || "TCB"})
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-100/60">
                    <span className="text-slate-500">Số tài khoản</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">
                        {process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || "1273702222"}
                      </span>
                      <button
                        onClick={() => handleCopyText(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || "1273702222", "account")}
                        type="button"
                        className="text-[#0b7ea9] hover:text-[#09678a] p-1 rounded-md hover:bg-slate-100 transition-colors"
                        title="Sao chép số tài khoản"
                      >
                        {copiedType === "account" ? (
                          <span className="text-xs text-emerald-600 font-bold">Đã chép</span>
                        ) : (
                          <IoCopyOutline className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between pb-1.5 border-b border-slate-100/60">
                    <span className="text-slate-500">Chủ tài khoản</span>
                    <span className="font-bold text-slate-800 uppercase">
                      {process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || "PHAN VAN PHAT"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-100/60">
                    <span className="text-slate-500">Số tiền</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[#ef2f3d]">
                        {qrAmount.toLocaleString("vi-VN")} đ
                      </span>
                      <button
                        onClick={() => handleCopyText(qrAmount.toString(), "amount")}
                        type="button"
                        className="text-[#0b7ea9] hover:text-[#09678a] p-1 rounded-md hover:bg-slate-100 transition-colors"
                        title="Sao chép số tiền"
                      >
                        {copiedType === "amount" ? (
                          <span className="text-xs text-emerald-600 font-bold">Đã chép</span>
                        ) : (
                          <IoCopyOutline className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-1.5">
                    <span className="text-slate-500">Nội dung chuyển</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-800">
                        {qrDescription}
                      </span>
                      <button
                        onClick={() => handleCopyText(qrDescription, "desc")}
                        type="button"
                        className="text-[#0b7ea9] hover:text-[#09678a] p-1 rounded-md hover:bg-slate-100 transition-colors"
                        title="Sao chép nội dung"
                      >
                        {copiedType === "desc" ? (
                          <span className="text-xs text-emerald-600 font-bold">Đã chép</span>
                        ) : (
                          <IoCopyOutline className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowQrCode(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishPayment}
                    className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition shadow-md"
                  >
                    Tôi đã chuyển khoản
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("info");

  return (
    <main className="flex-1 bg-[#f3f5f7] pb-12 pt-6 sm:pt-8">
      <section className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold text-slate-900">Hồ sơ cá nhân</h1>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-xl bg-[#0b7ea9] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#09678a]"
          >
            Về trang chủ
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:text-base ${
                    isActive
                      ? "bg-[linear-gradient(96deg,#045a84_0%,#25c3c8_100%)] text-white shadow-[0_8px_18px_rgba(11,126,169,0.28)]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "info" && <ProfileInfoTab />}
          {activeTab === "saved" && <SavedPostsTab />}
          {activeTab === "manage" && <ManagedPostsTab />}
          {activeTab === "buff" && <BuffPostsTab />}
        </div>
      </section>
    </main>
  );
}
