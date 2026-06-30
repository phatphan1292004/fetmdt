import { RoomSearchPage } from "@/src/features/room/components";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 bg-[#f3f5f7] pb-12 pt-6 sm:pt-8">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-8 text-center text-slate-500 py-12">
          Đang tải trang tìm kiếm...
        </div>
      </main>
    }>
      <RoomSearchPage />
    </Suspense>
  );
}

