const PROPERTY_TYPES = ["Nha o", "Can ho/Chung cu", "Phong tro"];

const BASIC_FIELDS = [
	{ label: "Loai hinh *", placeholder: "Loai hinh" },
	{ label: "Dien tich dat *", placeholder: "Dien tich dat" },
	{ label: "So phong ngu *", placeholder: "So phong ngu" },
	{ label: "So phong ve sinh", placeholder: "So phong ve sinh" },
	{ label: "Chieu ngang", placeholder: "Chieu ngang" },
	{ label: "Chieu dai", placeholder: "Chieu dai" },
	{ label: "Tong so tang", placeholder: "Tong so tang" },
	{ label: "Dien tich su dung", placeholder: "Dien tich su dung" },
	{ label: "Huong cua chinh", placeholder: "Huong cua chinh" },
	{ label: "Giay to phap ly", placeholder: "Giay to phap ly" },
	{ label: "Tinh trang noi that", placeholder: "Tinh trang noi that" },
];

export function PostForm() {
	return (
		<main className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(37,195,200,0.14),transparent_33%),radial-gradient(circle_at_98%_22%,rgba(4,90,132,0.14),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef2f7_100%)] pb-28 pt-8 sm:pt-10">
			<div className="mx-auto w-full max-w-6xl px-3 pb-8 sm:px-4 lg:px-8">
				<section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-5">
					<h1 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">Dang tin cho thue tro</h1>
					<p className="mt-1 text-sm text-slate-600 sm:text-base">
						Dien day du thong tin de tin dang duoc duyet nhanh va tiep can dung khach thue.
					</p>
				</section>

				<section className="space-y-4">
					<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-5">
						<label className="mb-3 block text-lg font-bold text-slate-900">Loai bat dong san *</label>
						<div className="flex flex-wrap gap-2.5">
							{PROPERTY_TYPES.map((type, index) => (
								<button
									key={type}
									type="button"
									className={`inline-flex items-center rounded-full border px-4 py-2 text-[17px] font-semibold transition ${
										index === 2
											? "border-slate-900 bg-slate-900 text-white"
											: "border-slate-200 bg-slate-100 text-slate-800 hover:border-slate-300"
									}`}
								>
									{type}
								</button>
							))}
						</div>

						<div className="mt-5 border-t border-slate-200 pt-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<p className="text-[17px] font-semibold text-slate-700 sm:text-lg">Toi muon *</p>
								<div className="inline-flex rounded-full bg-slate-100 p-1.5">
									<button type="button" className="rounded-full bg-slate-900 px-5 py-1.5 text-[17px] font-semibold text-white">
										Cho thue
									</button>
								</div>
							</div>
						</div>
					</article>

					<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-5">
						<h2 className="mb-4 text-lg font-bold text-slate-900">Vi tri bat dong san</h2>

						<div className="space-y-4">
							<div>
								<label htmlFor="project" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
									Ten toa nha/khu dan cu/du an
								</label>
								<input
									id="project"
									name="project"
									type="text"
									placeholder="Ten toa nha/khu dan cu/du an"
									className="h-12 w-full rounded-xl border border-slate-300 px-4 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
								/>
								<p className="mt-2 text-sm text-slate-600">
									Khong tim thay du an?{" "}
									<button type="button" className="font-semibold text-slate-900 underline underline-offset-2">
										Yeu cau them du an
									</button>
								</p>
							</div>

							<div>
								<label htmlFor="address" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
									Dia chi *
								</label>
								<div className="relative">
									<select
										id="address"
										name="address"
										defaultValue=""
										className="h-12 w-full appearance-none rounded-xl border border-[#f2483a] bg-white px-4 pr-10 text-[17px] text-slate-500 outline-none transition focus:border-[#f2483a] focus:ring-4 focus:ring-[#f2483a]/15"
										required
									>
										<option value="" disabled>
											Chon dia chi
										</option>
										<option value="q1">Quan 1, Ho Chi Minh</option>
										<option value="q3">Quan 3, Ho Chi Minh</option>
										<option value="bt">Binh Thanh, Ho Chi Minh</option>
									</select>
									<span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-slate-500">
										<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
											<path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</span>
								</div>
								<p className="mt-1 text-xs text-[#f2483a]">Vui long dien dia chi</p>
							</div>

							<label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-[15px] text-slate-700">
								Hien thi ma can tren tin dang
								<input type="checkbox" name="showCode" className="h-5 w-5 rounded border-slate-300" />
							</label>
						</div>
					</article>

					<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-5">
						<h2 className="mb-4 text-lg font-bold text-slate-900">Dac diem bat dong san</h2>
						<div className="grid gap-3 sm:grid-cols-2">
							{BASIC_FIELDS.map((field) => (
								<div key={field.label}>
									<label className="mb-1.5 block text-[15px] font-semibold text-slate-700">{field.label}</label>
									<input
										type="text"
										placeholder={field.placeholder}
										className="h-12 w-full rounded-xl border border-slate-300 px-4 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
									/>
								</div>
							))}

							<div className="sm:col-span-2">
								<label htmlFor="feature" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
									Dac diem
								</label>
								<div className="relative">
									<select
										id="feature"
										name="feature"
										defaultValue=""
										className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-[17px] text-slate-500 outline-none transition focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
									>
										<option value="" disabled>
											Chon dac diem
										</option>
										<option value="near-school">Gan truong hoc</option>
										<option value="near-market">Gan cho/benh vien</option>
										<option value="quiet">Khu vuc yen tinh</option>
									</select>
									<span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-slate-500">
										<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
											<path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</span>
								</div>
							</div>
						</div>
					</article>

					<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-5">
						<h2 className="mb-4 text-lg font-bold text-slate-900">Noi dung tin dang</h2>

						<div className="space-y-4">
							<div>
								<label className="mb-1.5 block text-[15px] font-semibold text-slate-700">Hinh anh/Video *</label>
								<button
									type="button"
									className="flex h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-[#f59e0b] bg-[#fdf7dd] text-slate-800 transition hover:bg-[#fff3c4]"
								>
									<span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f8c22b] text-white">
										<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
											<path d="M15 10.5V6.5C15 4.57 13.43 3 11.5 3H6.5C4.57 3 3 4.57 3 6.5V17.5C3 19.43 4.57 21 6.5 21H17.5C19.43 21 21 19.43 21 17.5V12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M9 12L11.5 14.5L16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M19 4V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
											<path d="M16 7H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
										</svg>
									</span>
									<span className="mt-3 text-xl font-semibold">Them anh/video</span>
								</button>
								<p className="mt-2 text-sm text-[#f2483a]">Vui long tai len it nhat 3 hinh anh</p>
							</div>

							<div>
								<label htmlFor="title" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
									Tieu de tin dang *
								</label>
								<input
									id="title"
									name="title"
									type="text"
									maxLength={70}
									placeholder="Tieu de tin dang"
									className="h-12 w-full rounded-xl border border-slate-300 px-4 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
								/>
								<p className="mt-2 text-sm text-slate-500">0/70 ki tu</p>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label htmlFor="price" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
										Gia thue *
									</label>
									<div className="relative">
										<input
											id="price"
											name="price"
											type="number"
											placeholder="Gia thue"
											className="h-12 w-full rounded-xl border border-slate-300 px-4 pr-9 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
										/>
										<span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[22px] text-slate-500">
											d
										</span>
									</div>
								</div>

								<div>
									<label htmlFor="deposit" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
										So tien coc
									</label>
									<div className="relative">
										<input
											id="deposit"
											name="deposit"
											type="number"
											placeholder="So tien coc"
											className="h-12 w-full rounded-xl border border-slate-300 px-4 pr-9 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
										/>
										<span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[22px] text-slate-500">
											d
										</span>
									</div>
								</div>
							</div>

							<div>
								<label htmlFor="description" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
									Mo ta *
								</label>
								<textarea
									id="description"
									name="description"
									rows={8}
									maxLength={1500}
									placeholder="Mo ta uu diem phong, noi that, giao thong va quy dinh thue"
									className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
								/>
								<p className="mt-2 text-sm text-slate-500">0/1500 ki tu</p>
							</div>

							<div>
								<label className="mb-2 block text-[15px] font-semibold text-slate-700">Ban la *</label>
								<div className="inline-flex rounded-full bg-slate-100 p-1.5">
									<button type="button" className="rounded-full bg-slate-900 px-5 py-1.5 text-[17px] font-semibold text-white">
										Ca nhan
									</button>
									<button type="button" className="rounded-full px-5 py-1.5 text-[17px] font-semibold text-slate-700">
										Moi gioi
									</button>
								</div>
							</div>
						</div>
					</article>
				</section>
			</div>

			<div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-4">
				<div className="mx-auto flex w-full max-w-6xl items-center gap-3">
					<button
						type="button"
						className="h-12 flex-1 rounded-xl border border-slate-300 bg-slate-100 text-lg font-bold text-slate-700 transition hover:bg-slate-200"
					>
						Xem truoc
					</button>
					<button
						type="button"
						className="h-12 flex-1 rounded-xl bg-[#f7cd00] text-lg font-bold text-slate-900 shadow-[0_8px_20px_rgba(247,205,0,0.34)] transition hover:brightness-95"
					>
						Dang tin
					</button>
				</div>
			</div>
		</main>
	);
}
