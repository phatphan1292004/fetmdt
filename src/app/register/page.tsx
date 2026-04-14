import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Dang ky | PhongTot",
	description: "Tao tai khoan PhongTot de dang tin nhanh va ket noi voi khach thue phu hop.",
};

const STEPS = [
	{
		title: "Tao ho so",
		detail: "Cap nhat thong tin co ban de xay dung muc do tin cay voi nguoi xem phong.",
	},
	{
		title: "Dang phong",
		detail: "Dang tai hinh anh, mo ta va gia thue. He thong goi y bo loc thong minh theo khu vuc.",
	},
	{
		title: "Nhan lien he",
		detail: "Nhan yeu cau dat lich xem phong va quan ly trao doi ngay trong mot noi.",
	},
];

export default function RegisterPage() {
	return (
		<main className="relative isolate flex-1 overflow-hidden bg-[radial-gradient(circle_at_12%_82%,rgba(34,194,199,0.18),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(4,90,132,0.22),transparent_36%),linear-gradient(180deg,#fbfdff_0%,#edf2f7_100%)] py-10 sm:py-14">
			<div className="pointer-events-none absolute -left-20 top-6 h-64 w-64 rounded-full bg-[#22c2c7]/20 blur-3xl" aria-hidden />
			<div className="pointer-events-none absolute -right-24 bottom-8 h-80 w-80 rounded-full bg-[#045a84]/20 blur-3xl" aria-hidden />

			<div className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-4 lg:grid-cols-[1fr_1.05fr] lg:px-8">
				<section className="order-2 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_22px_48px_rgba(15,23,42,0.1)] backdrop-blur sm:p-8 lg:order-1">
					<div className="mb-6">
						<p className="text-sm font-semibold tracking-[0.08em] text-[#0b7ea9] uppercase">Dang ky</p>
						<h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-[30px]">Bat dau cung PhongTot</h1>
						<p className="mt-2 text-sm text-slate-600 sm:text-base">
							Tao tai khoan chi trong 1 phut de dang phong, luu tim kiem va ket noi nguoi thue nhanh hon.
						</p>
					</div>

					<form className="space-y-4" action="#" method="post">
						<fieldset className="space-y-2.5">
							<legend className="text-sm font-semibold text-slate-700">Ban la ai?</legend>
							<div className="grid gap-3 sm:grid-cols-2">
								<label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-300 bg-white p-3.5 transition hover:border-[#1dbdc2]">
									<input
										type="radio"
										name="role"
										value="seeker"
										required
										className="mt-0.5 h-4 w-4 border-slate-300 text-[#0b7ea9] focus:ring-[#22c2c7]/30"
									/>
									<span>
										<span className="block text-sm font-semibold text-slate-800">Nguoi tim tro</span>
										<span className="mt-0.5 block text-xs text-slate-500">Can tim phong theo gia va khu vuc phu hop</span>
									</span>
								</label>

								<label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-300 bg-white p-3.5 transition hover:border-[#1dbdc2]">
									<input
										type="radio"
										name="role"
										value="host"
										required
										className="mt-0.5 h-4 w-4 border-slate-300 text-[#0b7ea9] focus:ring-[#22c2c7]/30"
									/>
									<span>
										<span className="block text-sm font-semibold text-slate-800">Nguoi cho thue tro</span>
										<span className="mt-0.5 block text-xs text-slate-500">Dang tin phong va nhan lien he tu khach thue</span>
									</span>
								</label>
							</div>
						</fieldset>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
									Ho va ten
								</label>
								<input
									id="fullName"
									name="fullName"
									type="text"
									autoComplete="name"
									required
									placeholder="Nguyen Van A"
									className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="phone" className="text-sm font-semibold text-slate-700">
									So dien thoai
								</label>
								<input
									id="phone"
									name="phone"
									type="tel"
									autoComplete="tel"
									required
									placeholder="09xxxxxxxx"
									className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
								/>
							</div>
						</div>

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

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<label htmlFor="password" className="text-sm font-semibold text-slate-700">
									Mat khau
								</label>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									required
									placeholder="Toi thieu 8 ky tu"
									className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
									Xac nhan mat khau
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									autoComplete="new-password"
									required
									placeholder="Nhap lai mat khau"
									className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1dbdc2] focus:ring-4 focus:ring-[#22c2c7]/20"
								/>
							</div>
						</div>

						<label className="flex items-start gap-2.5 pt-1 text-sm leading-relaxed text-slate-600">
							<input
								type="checkbox"
								name="agree"
								required
								className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0b7ea9] focus:ring-[#22c2c7]/30"
							/>
							<span>
								Toi dong y voi Dieu khoan su dung va Chinh sach bao mat cua PhongTot.
							</span>
						</label>

						<button
							type="submit"
							className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(95deg,#045a84_0%,#25c3c8_100%)] px-5 text-base font-bold text-white shadow-[0_14px_30px_rgba(6,98,133,0.26)] transition hover:opacity-95"
						>
							Tao tai khoan
						</button>
					</form>

					<p className="mt-5 text-center text-sm text-slate-600">
						Da co tai khoan?{" "}
						<Link href="/login" className="font-semibold text-[#0b7ea9] transition hover:text-[#045a84]">
							Dang nhap ngay
						</Link>
					</p>
				</section>

				<section className="order-1 rounded-3xl border border-white/60 bg-[linear-gradient(155deg,#044f74_0%,#0b7ea9_50%,#22c2c7_100%)] p-6 text-white shadow-[0_32px_60px_rgba(7,57,84,0.24)] sm:p-8 lg:order-2 lg:p-10">
					<p className="mb-3 inline-flex rounded-full border border-white/35 bg-white/14 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
						Nhanh gon va linh hoat
					</p>
					<h2 className="font-display text-3xl leading-tight font-black sm:text-4xl">
						Moi tin dang co
						<span className="block text-[#bff3f5]">co hoi tim khach nhanh</span>
					</h2>
					<p className="mt-4 max-w-lg text-base leading-relaxed text-cyan-50/95 sm:text-lg">
						He thong de xuat thong minh giup ban tiep can dung doi tuong co nhu cau theo khu vuc va ngan sach.
					</p>

					<ol className="mt-8 space-y-3">
						{STEPS.map((step, index) => (
							<li key={step.title} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
								<div className="mb-1 flex items-center gap-2">
									<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0b7ea9]">
										{index + 1}
									</span>
									<h3 className="font-semibold text-white">{step.title}</h3>
								</div>
								<p className="text-sm leading-relaxed text-cyan-50/95">{step.detail}</p>
							</li>
						))}
					</ol>
				</section>
			</div>
		</main>
	);
}
