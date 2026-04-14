"use client";

type RoomDetailErrorProps = {
  error: Error;
  reset: () => void;
};

export default function RoomDetailErrorPage({ error, reset }: RoomDetailErrorProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl bg-white p-7 text-center shadow-[0_12px_30px_rgba(15,23,42,0.1)]">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#0b7ea9]">Co loi xay ra</p>
        <h1 className="mt-2 text-3xl font-black text-slate-800">Khong tai duoc thong tin phong</h1>
        <p className="mt-3 text-slate-600">{error.message || "Vui long thu lai sau it phut."}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-[#0b7ea9] px-5 py-3 font-semibold text-white transition hover:bg-[#0a7198]"
        >
          Thu tai lai
        </button>
      </div>
    </main>
  );
}
