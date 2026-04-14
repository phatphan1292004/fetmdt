import Link from "next/link";

type HeaderProps = {
	hotline: string;
};

const NAV_ITEMS = ["Hồ Chí Minh", "Hà Nội", "Căn hộ mini", "Cẩm nang"];

export function Header({ hotline }: HeaderProps) {
	return (
		<header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white">
			<div className="mx-auto flex h-23 w-full max-w-500 items-center justify-between px-4 lg:px-8">
				<div className="flex items-center gap-7 xl:gap-9">
					<Link
						href="/"
						className="inline-flex shrink-0 items-center gap-2.5 text-[#045a84]"
						aria-label="PhòngTốt"
					>
						<span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#22c2c7] text-white shadow-[0_8px_18px_rgba(34,194,199,0.28)]">
							<svg
								className="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden
							>
								<path
									d="M4 9.5C6.2 11.7 9 13 12 13C15 13 17.8 11.7 20 9.5V15.2C20 18.4 17.4 21 14.2 21H9.8C6.6 21 4 18.4 4 15.2V9.5Z"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M8 6C9.1 5.3 10.5 5 12 5C13.5 5 14.9 5.3 16 6"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</span>
						<span className="font-display text-[34px] font-black leading-none tracking-tight">
							<span className="text-[#045a84]">Phòng</span>
							<span className="text-[#0a6e97]">tốt</span>
						</span>
					</Link>

					<nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
						{NAV_ITEMS.map((item) => (
							<button
								key={item}
								type="button"
								className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-[17px] font-semibold text-slate-700 whitespace-nowrap transition hover:bg-slate-100"
							>
								{item}
								<svg
									className="h-3.5 w-3.5 text-slate-500"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden
								>
									<path
										d="M4 6L8 10L12 6"
										stroke="currentColor"
										strokeWidth="1.6"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						))}
					</nav>
				</div>

				<div className="hidden items-center gap-5 text-[15px] text-slate-600 lg:flex">
					<p className="whitespace-nowrap">
						Hotline: <span className="font-semibold text-slate-900">{hotline}</span>
					</p>
					<button
						type="button"
						className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-slate-500 whitespace-nowrap transition hover:bg-slate-100"
					>
						<svg
							className="h-4 w-4 text-[#20bfc4]"
							viewBox="0 0 20 20"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden
						>
							<path d="M10 17.3L8.7 16.1C4 11.8 1 9 1 5.6C1 3 3 1 5.6 1C7.1 1 8.5 1.7 9.4 2.9C10.3 1.7 11.7 1 13.2 1C15.8 1 17.8 3 17.8 5.6C17.8 9 14.8 11.8 10.1 16.1L10 17.3Z" />
						</svg>
						Phòng đã lưu
					</button>
					<button
						type="button"
						className="shrink-0 font-semibold text-slate-700 underline decoration-slate-400 decoration-1 underline-offset-2"
					>
						Ký gửi phòng
					</button>
					<Link
						href="/register"
						className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-[#28c3c8] px-4 py-2 font-semibold text-[#18b9be] whitespace-nowrap transition hover:bg-[#ecfdfe]"
					>
						<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#28c3c8] text-white">
							<svg
								className="h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden
							>
								<circle cx="12" cy="8" r="4" fill="currentColor" />
								<path d="M5 19C5 15.686 8.134 13 12 13C15.866 13 19 15.686 19 19" fill="currentColor" />
							</svg>
						</span>
						Đăng ký
					</Link>
					<Link href="/login" className="shrink-0 font-semibold text-slate-700 underline underline-offset-2">
						Đăng nhập
					</Link>
				</div>

				<Link
					href="/register"
					className="rounded-xl border border-[#22c2c7] px-4 py-2 text-sm font-semibold text-[#1ab7bc] lg:hidden"
				>
					Đăng ký
				</Link>
			</div>
		</header>
	);
}
