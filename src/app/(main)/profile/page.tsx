import type { Metadata } from "next";
import { ProfilePage } from "@/src/features/user";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Profile | Stayvia",
  description: "Quan ly thong tin ca nhan, tin dang da luu va tin dang cua ban.",
};

export default function ProfileRoutePage() {
  return (
    <Suspense fallback={
      <main className="flex-1 bg-[#f3f5f7] pb-12 pt-6 sm:pt-8">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-8 text-center text-slate-500 py-12">
          Đang tải trang hồ sơ...
        </div>
      </main>
    }>
      <ProfilePage />
    </Suspense>
  );
}
