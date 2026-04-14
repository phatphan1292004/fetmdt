import Link from "next/link";

export default function RoomNotFoundPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl bg-white p-7 text-center shadow-[0_12px_30px_rgba(15,23,42,0.1)]">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#0b7ea9]">404</p>
        <h1 className="mt-2 text-3xl font-black text-slate-800">Khong tim thay phong</h1>
        <p className="mt-3 text-slate-600">Du lieu phong da bi an hoac duong dan khong ton tai.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-[#0b7ea9] px-5 py-3 font-semibold text-white transition hover:bg-[#0a7198]"
        >
          Quay ve trang chu
        </Link>
      </div>
    </main>
  );
}
