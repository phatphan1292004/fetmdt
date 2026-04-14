import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Đăng nhập | PhòngTốt",
	description: "Đăng nhập để lưu phòng trọ, theo dõi tin mới và quản lý lịch hẹn xem phòng.",
};

const HIGHLIGHTS = [
	"Lưu phòng yêu thích và nhận thông báo khi giá thay đổi",
	"Đặt lịch xem phòng nhanh với chủ trọ uy tín",
	"Đồng bộ tìm kiếm trên điện thoại và máy tính",
];

export default function LoginPage() {
	return (
		<main className="relative isolate flex-1 overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(37,195,200,0.16),transparent_45%),radial-gradient(circle_at_92%_12%,rgba(4,90,132,0.2),transparent_38%),linear-gradient(180deg,#f9fcff_0%,#f1f5f9_100%)] py-10 sm:py-14">
			<div className="pointer-events-none absolute -left-16 top-20 h-52 w-52 rounded-full bg-[#39cad0]/25 blur-3xl" aria-hidden />
			<div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#045a84]/20 blur-3xl" aria-hidden />

			<div className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-4 lg:grid-cols-[1.05fr_1fr] lg:px-8">
				<section className="rounded-3xl border border-white/60 bg-[linear-gradient(148deg,#045a84_0%,#0b7ea9_54%,#22c2c7_100%)] p-6 text-white shadow-[0_32px_60px_rgba(7,57,84,0.26)] sm:p-8 lg:p-10">
					<p className="mb-3 inline-flex rounded-full border border-white/35 bg-white/14 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
						Tai khoan ca nhan
					</p>
					<h1 className="font-display text-3xl leading-tight font-black sm:text-4xl">
						Chao mung ban quay lai voi
						<span className="block text-[#bff3f5]">PhongTot</span>
					</h1>
					<p className="mt-4 max-w-lg text-base leading-relaxed text-cyan-50/95 sm:text-lg">
						Dang nhap de tiep tuc hanh trinh tim phong thong minh, cap nhat tin moi theo khu vuc ban quan tam.
					</p>

					<ul className="mt-8 space-y-3">
						{HIGHLIGHTS.map((item) => (
							<li key={item} className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm">
								<span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#0b7ea9]">
									<svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
										<path d="M3 8.2L6.2 11.4L13 4.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</span>
								<span className="text-sm leading-relaxed text-cyan-50/95 sm:text-[15px]">{item}</span>
							</li>
						))}
					</ul>
				</section>

				<section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.1)] backdrop-blur sm:p-8">
					<div className="mb-6">
						<p className="text-sm font-semibold tracking-[0.08em] text-[#0b7ea9] uppercase">Dang nhap</p>
						<h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-[30px]">Quan ly phong da luu</h2>
					</div>

					<form className="space-y-4" action="#" method="post">
						<div className="space-y-1.5">
							<label htmlFor="email" className="text-sm font-semibold text-slate-700">
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								placeholder="ban@email.com"
								className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
							/>
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<label htmlFor="password" className="text-sm font-semibold text-slate-700">
									Mat khau
								</label>
								<Link href="/register" className="text-xs font-semibold text-[#0b7ea9] transition hover:text-[#045a84]">
									Quen mat khau?
								</Link>
							</div>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								placeholder="Nhap mat khau"
								className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
							/>
						</div>

						<label className="flex items-center gap-2.5 pt-1 text-sm text-slate-600">
							<input
								type="checkbox"
								name="remember"
								className="h-4 w-4 rounded border-slate-300 text-[#0b7ea9] focus:ring-[#22c2c7]/30"
							/>
							Ghi nho dang nhap tren thiet bi nay
						</label>

						<button
							type="submit"
							className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(92deg,#045a84_0%,#25c3c8_100%)] px-5 text-base font-bold text-white shadow-[0_14px_30px_rgba(6,98,133,0.26)] transition hover:opacity-95"
						>
							Dang nhap
						</button>
					</form>

					<div className="my-5 flex items-center gap-3 text-xs text-slate-400">
						<span className="h-px flex-1 bg-slate-200" />
						Hoac
						<span className="h-px flex-1 bg-slate-200" />
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<button
							type="button"
							className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 transition hover:border-[#1dbdc2]"
						>
							<span className="text-[#ea4335]">G</span>
							Google
						</button>
						<button
							type="button"
							className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 transition hover:border-[#1dbdc2]"
						>
							<span className="text-[#1877f2]">f</span>
							Facebook
						</button>
					</div>

					<p className="mt-6 text-center text-sm text-slate-600">
						Chua co tai khoan?{" "}
						<Link href="/register" className="font-semibold text-[#0b7ea9] transition hover:text-[#045a84]">
							Tao tai khoan moi
						</Link>
					</p>
				</section>
			</div>
		</main>
	);
}
