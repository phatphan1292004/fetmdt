"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedRoom = {
  id: string;
  title: string;
  slug: string;
  address: string;
  priceLabel: string;
  areaLabel: string;
  imageUrls: readonly string[];
};

export default function SavedRoomsPage() {
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const checkAuthAndFetch = async () => {
    try {
      const authRes = await fetch("/api/v1/auth/me");
      if (!authRes.ok) {
        setIsAuth(false);
        setLoading(false);
        return;
      }
      const authData = await authRes.json();
      if (authData.success && authData.data) {
        setIsAuth(true);
        // Fetch saved rooms
        const roomsRes = await fetch("/api/v1/user/saved-posts");
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          if (roomsData.success) {
            setSavedRooms(roomsData.data || []);
          }
        }
      } else {
        setIsAuth(false);
      }
    } catch (error) {
      console.error("Failed to load saved rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const handleUnsave = async (roomId: string) => {
    // Optimistic update
    setSavedRooms((prev) => prev.filter((room) => room.id !== roomId));

    try {
      const res = await fetch(`/api/v1/user/saved-posts?postId=${roomId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to unsave");
      }
    } catch (error) {
      console.error("Error unsaving room:", error);
      // Re-fetch to restore state in case of failure
      checkAuthAndFetch();
    }
  };

  return (
    <main className="flex-1 bg-[#f5f7f9] pb-16 pt-8">
      <section className="mx-auto w-full max-w-500 px-4 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#0b7ea9]">
                Trang chủ
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <span className="text-slate-700">Phòng đã lưu</span>
            </li>
          </ol>
        </nav>

        <div className="mb-6 rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
          <h1 className="text-[28px] font-black leading-tight text-slate-900 md:text-[34px]">
            Phòng đã lưu
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600 md:text-[16px]">
            Danh sách tin đăng phòng trọ bạn đã lưu để tiện theo dõi và so sánh.
          </p>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/70 bg-white p-12 text-center text-slate-500 font-semibold shadow-sm animate-pulse">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#25c3c8] border-t-transparent" />
            Đang tải danh sách phòng đã lưu...
          </div>
        ) : !isAuth ? (
          <div className="rounded-[28px] border border-white/70 bg-white p-12 text-center shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <svg
              className="mx-auto h-16 w-16 text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Vui lòng đăng nhập
            </h2>
            <p className="mt-2 text-slate-600">
              Đăng nhập tài khoản của bạn để xem danh sách phòng trọ đã lưu.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href={`/login?redirect=/phong-da-luu`}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#0b7ea9] px-6 text-sm font-bold text-white shadow-md transition hover:bg-[#0a7198]"
              >
                Đăng nhập
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Quay lại trang chủ
              </Link>
            </div>
          </div>
        ) : savedRooms.length === 0 ? (
          <div className="rounded-[28px] border border-white/70 bg-white p-12 text-center shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <svg
              className="mx-auto h-16 w-16 text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Chưa lưu phòng nào
            </h2>
            <p className="mt-2 text-slate-600">
              Bạn chưa lưu bài đăng phòng trọ nào. Hãy tìm kiếm phòng phù hợp và lưu lại!
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/search"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#0b7ea9] px-6 text-sm font-bold text-white shadow-md transition hover:bg-[#0a7198]"
              >
                Tìm phòng ngay
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedRooms.map((room) => (
              <article
                key={room.id}
                className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.11)] hover:-translate-y-1"
              >
                <Link href={`/phong-tro/${room.slug}`} className="block">
                  <div
                    className="h-48 bg-slate-200 bg-cover bg-center transition duration-500"
                    style={{ backgroundImage: `url(${room.imageUrls[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80"})` }}
                    aria-hidden
                  />
                </Link>

                <div className="p-5">
                  <Link href={`/phong-tro/${room.slug}`} className="block group">
                    <h3 className="line-clamp-2 min-h-[48px] text-[18px] font-black leading-tight text-slate-900 transition group-hover:text-[#0b7ea9]">
                      {room.title}
                    </h3>
                  </Link>
                  <p className="mt-1.5 text-sm text-slate-500 truncate">{room.address}</p>

                  <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[20px] font-black leading-none text-[#f2483a]">
                        {room.priceLabel}
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-[#0b5f89]">
                        {room.areaLabel}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnsave(room.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm transition hover:bg-red-100 hover:text-red-700 cursor-pointer"
                      title="Bỏ lưu"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden
                      >
                        <path d="M12.1 20.3l-1.1-1C6 15 3 12.3 3 8.9 3 6.1 5.1 4 7.9 4c1.6 0 3.1.8 4.1 2.1C13 4.8 14.5 4 16.1 4 18.9 4 21 6.1 21 8.9c0 3.4-3 6.1-8 10.4l-.9 1z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
