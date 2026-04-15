import Link from "next/link";

const STATUS_TABS = [
  "DANG HIEN THI (0)",
  "HET HAN (0)",
  "BI TU CHOI (0)",
  "CAN THANH TOAN (0)",
  "TIN NHAP (0)",
  "CHO DUYET (0)",
  "DA AN (0)",
] as const;

export function PostManagementPage() {
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
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0b7ea9_0%,#25c3c8_100%)] text-sm font-bold text-white">
                    PP
                  </div>
                  <div>
                    <p className="text-[31px] font-bold leading-tight text-slate-900">
                      Phan Phat
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
                    placeholder="Tim tin dang cua ban..."
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
                  />
                </label>
              </div>
            </div>
          </div>

          <nav className="overflow-x-auto px-4 sm:px-5">
            <ul className="flex min-w-max items-center gap-7 py-4 text-sm font-bold tracking-[0.02em] text-slate-800">
              {STATUS_TABS.map((tab) => (
                <li key={tab}>
                  <button
                    type="button"
                    className="whitespace-nowrap transition hover:text-[#0b7ea9]"
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </article>

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
      </section>
    </main>
  );
}
