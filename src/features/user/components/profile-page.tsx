"use client";

import Link from "next/link";
import { useState } from "react";

type ProfileTabId = "info" | "saved" | "manage";

type TabItem = {
  id: ProfileTabId;
  label: string;
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
  status: "Dang hien thi" | "Cho duyet" | "Het han";
  postedAt: string;
  views: number;
  priceLabel: string;
};

const TABS: readonly TabItem[] = [
  { id: "info", label: "Thong tin ca nhan" },
  { id: "saved", label: "Tin dang da luu" },
  { id: "manage", label: "Quan ly tin dang" },
];

const SAVED_POSTS: readonly SavedPost[] = [
  {
    id: "saved-1",
    title: "Phong tro gan DH Thuong Mai",
    address: "Pham Van Dong, Bac Tu Liem, Ha Noi",
    priceLabel: "3.200.000d/thang",
    areaLabel: "22 m2",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "saved-2",
    title: "Studio day du noi that My Dinh",
    address: "My Dinh 2, Nam Tu Liem, Ha Noi",
    priceLabel: "4.600.000d/thang",
    areaLabel: "28 m2",
    imageUrl:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "saved-3",
    title: "Can mini co gac xep, bao phi wifi",
    address: "Ho Tung Mau, Cau Giay, Ha Noi",
    priceLabel: "3.900.000d/thang",
    areaLabel: "25 m2",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
];

const MANAGED_POSTS: readonly ManagedPost[] = [
  {
    id: "m-1",
    title: "Phong tro full noi that - Le Duc Tho",
    status: "Dang hien thi",
    postedAt: "14/04/2026",
    views: 132,
    priceLabel: "4.100.000d/thang",
  },
  {
    id: "m-2",
    title: "Phong khong chung chu - Tran Binh",
    status: "Cho duyet",
    postedAt: "13/04/2026",
    views: 0,
    priceLabel: "3.400.000d/thang",
  },
  {
    id: "m-3",
    title: "Can mini ban cong thoang - Hoang Quoc Viet",
    status: "Het han",
    postedAt: "01/04/2026",
    views: 265,
    priceLabel: "4.800.000d/thang",
  },
];

const PROFILE_STATS = [
  { label: "Tin dang dang hien thi", value: "1" },
  { label: "Tin dang da luu", value: "12" },
  { label: "Luot xem 7 ngay", value: "145" },
  { label: "Ty le phan hoi", value: "93%" },
] as const;

const ACCOUNT_INFO = [
  { label: "So dien thoai", value: "0888 313 843" },
  { label: "Email", value: "phanphat@example.com" },
  { label: "Khu vuc uu tien", value: "Nam Tu Liem, Ha Noi" },
  { label: "Ngay tham gia", value: "03/2025" },
] as const;

const RECENT_ACTIVITIES = [
  { title: "Cap nhat anh dai dien", time: "2 gio truoc" },
  { title: "Luu tin Studio My Dinh", time: "Hom nay" },
  { title: "Dang nhap tu Chrome Windows", time: "14/04/2026" },
  { title: "Cap nhat thong tin lien he", time: "12/04/2026" },
] as const;

function statusClassName(status: ManagedPost["status"]) {
  if (status === "Dang hien thi") {
    return "bg-[#e8f9f8] text-[#0a7f86]";
  }

  if (status === "Cho duyet") {
    return "bg-[#fff7df] text-[#b7791f]";
  }

  return "bg-slate-100 text-slate-600";
}

function ProfileInfoTab() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="relative mx-auto h-22 w-22 overflow-hidden rounded-full border-4 border-white shadow-[0_8px_18px_rgba(15,23,42,0.2)]">
          <div className="h-full w-full bg-[linear-gradient(145deg,#1f2937_0%,#22c2c7_100%)]" />
          <button
            type="button"
            className="absolute bottom-1 right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
            aria-label="Cap nhat anh dai dien"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 20H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M8 16L16 8L19 11L11 19L8 20V16Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Phan Phat</h2>
        <p className="mt-1 text-slate-500">Nguoi theo doi 0 · Dang theo doi 0</p>

        <div className="mt-5 rounded-2xl bg-[#f5f7fa] p-4 text-left sm:p-5">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <p className="text-sm text-slate-500">TK dinh danh</p>
              <p className="mt-1 text-base font-semibold text-slate-800">V0888313843366</p>
            </div>
            <button type="button" className="mt-1 text-slate-400 hover:text-slate-600" aria-label="Sao chep ma dinh danh">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 15V6C5 4.9 5.9 4 7 4H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <p className="font-semibold text-slate-800">Dong Tot</p>
            <p className="font-extrabold text-slate-900">0</p>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#f7cd00] text-base font-bold text-slate-900 transition hover:brightness-95"
          >
            Nap ngay
          </button>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PROFILE_STATS.map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-4 grid max-w-4xl gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-lg font-extrabold text-slate-800">Thong tin tai khoan</h3>
          <div className="space-y-3">
            {ACCOUNT_INFO.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-lg border border-[#0b7ea9] px-3 text-sm font-semibold text-[#0b7ea9] transition hover:bg-[#effaff]"
            >
              Chinh sua ho so
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Doi mat khau
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-lg font-extrabold text-slate-800">Hoat dong gan day</h3>
          <ul className="space-y-3">
            {RECENT_ACTIVITIES.map((item) => (
              <li key={`${item.title}-${item.time}`} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                <span className="text-sm text-slate-700">{item.title}</span>
                <span className="shrink-0 text-xs font-medium text-slate-500">{item.time}</span>
              </li>
            ))}
          </ul>

          <button type="button" className="mt-4 text-sm font-semibold text-[#0b7ea9] hover:underline">
            Xem lich su day du
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
        <h2 className="text-2xl font-extrabold text-slate-900">Tin dang da luu</h2>
        <p className="mt-1 text-slate-600">Danh sach tin ban da luu de theo doi.</p>
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
                  aria-label="Bo luu tin"
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
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Quan ly tin dang</h2>
            <p className="mt-1 text-slate-600">Theo doi hieu qua va cap nhat trang thai tin dang cua ban.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/post"
              className="inline-flex h-10 items-center rounded-xl bg-[#f7cd00] px-4 text-sm font-bold text-slate-900 transition hover:brightness-95"
            >
              Dang tin moi
            </Link>
            <Link
              href="/post-manage"
              className="inline-flex h-10 items-center rounded-xl border border-[#0b7ea9] px-4 text-sm font-semibold text-[#0b7ea9] transition hover:bg-[#effaff]"
            >
              Xem chi tiet
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-sm text-slate-500">
                <th className="px-4 py-3 font-semibold sm:px-5">Tin dang</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Trang thai</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Ngay dang</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Luot xem</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Gia</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Thao tac</th>
              </tr>
            </thead>

            <tbody>
              {MANAGED_POSTS.map((post) => (
                <tr key={post.id} className="border-t border-slate-100 text-sm text-slate-700">
                  <td className="px-4 py-3.5 sm:px-5">
                    <p className="max-w-[260px] font-semibold text-slate-900">{post.title}</p>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">{post.postedAt}</td>
                  <td className="px-4 py-3.5 sm:px-5">{post.views}</td>
                  <td className="px-4 py-3.5 font-semibold text-[#ef2f3d] sm:px-5">{post.priceLabel}</td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <button type="button" className="font-semibold text-[#0b7ea9] hover:underline">
                      Sua tin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("info");

  return (
    <main className="flex-1 bg-[#f3f5f7] pb-12 pt-6 sm:pt-8">
      <section className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-8">
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
        </div>
      </section>
    </main>
  );
}
