"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CurrentUser, UserMenu } from "./UserMenu";

type HeaderLocation = {
	city: string;
	districts: string[];
};

type HeaderProps = {
	hotline: string;
	currentUser?: CurrentUser | null;
	locations?: HeaderLocation[];
};

const CATEGORY_ITEMS: ReadonlyArray<{
	label: string;
	href: string;
	icon: React.ReactNode;
}> = [
	{
		label: "Mua bán",
		href: "/",
		icon: (
			<svg className="h-5 w-5 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l1.664-2.77A2 2 0 016.236 6h11.528a2 2 0 011.572.77L21 10m-9 4v6m-4-6v6m8-6v6m-9-6h14" /></svg>
		),
	},
	{
		label: "Cho thuê",
		href: "/cho-thue-phong-tro-hn/quan-cau-giay/cho-thue-phong-tro",
		icon: (
			<svg className="h-5 w-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5V3m-8 9V3m16 9a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
		),
	},
	{
		label: "Dự án",
		href: "/",
		icon: (
			<svg className="h-5 w-5 text-[#f59e42]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7" /></svg>
		),
	},
	{
		label: "Tìm môi giới",
		href: "/",
		icon: (
			<svg className="h-5 w-5 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
		),
	},
	{
		label: "Biểu đồ biến động giá",
		href: "/",
		icon: (
			<svg className="h-5 w-5 text-[#f43f5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" /></svg>
		),
	},
	{
		label: "Vay mua nhà",
		href: "/",
		icon: (
			<svg className="h-5 w-5 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7" /></svg>
		),
	},
];

function CategoryIcon() {
	return (
		<svg className="h-6 w-6 text-slate-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
			<path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			<path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			<path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

export function Header({ hotline, currentUser }: HeaderProps) {
	const [isCategoryOpen, setIsCategoryOpen] = useState(false);
	const [isDesktopCategoryOpen, setIsDesktopCategoryOpen] = useState(false);
	const categoryMenuRef = useRef<HTMLDivElement>(null);
	const desktopCategoryRef = useRef<HTMLDivElement>(null);

	// Đóng menu mobile khi click ngoài
	useEffect(() => {
		if (!isCategoryOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (!categoryMenuRef.current?.contains(event.target as Node)) {
				setIsCategoryOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isCategoryOpen]);

	// Đóng menu desktop khi click ngoài
	useEffect(() => {
		if (!isDesktopCategoryOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (!desktopCategoryRef.current?.contains(event.target as Node)) {
				setIsDesktopCategoryOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isDesktopCategoryOpen]);

	return (
		<header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white">
			<div ref={categoryMenuRef} className="relative">
				<div className="mx-auto flex h-23 w-full max-w-500 items-center justify-between px-4 lg:px-8">
					<div className="flex items-center gap-7 xl:gap-9">
					<button
						type="button"
						onClick={() => setIsCategoryOpen((prev) => !prev)}
						className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 lg:hidden"
						aria-label="Mở danh mục"
						aria-expanded={isCategoryOpen}
					>
						<CategoryIcon />
					</button>

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
						{/* Danh mục (category) menu cho desktop - click để mở */}
						<div className="relative" ref={desktopCategoryRef}>
							<button
								type="button"
								className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[17px] font-semibold text-slate-700 whitespace-nowrap hover:bg-slate-100 focus:outline-none ${isDesktopCategoryOpen ? 'bg-slate-100' : ''}`}
								aria-haspopup="true"
								aria-expanded={isDesktopCategoryOpen}
								onClick={() => setIsDesktopCategoryOpen((v) => !v)}
							>
								<svg className="h-5 w-5 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7H20M4 12H20M4 17H20" /></svg>
								Danh mục
								<svg className="h-3.5 w-3.5 text-slate-500 ml-1" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
									<path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
							{isDesktopCategoryOpen && (
								<div className="absolute left-0 mt-2 min-w-[260px] rounded-2xl border border-slate-200 bg-white shadow-xl z-30 animate-fade-in">
									<nav className="py-2">
										{CATEGORY_ITEMS.map((item) => (
											<Link
												key={item.label}
												href={item.href}
												className="flex items-center gap-3 rounded-xl px-4 py-3 text-[18px] text-slate-700 transition hover:bg-slate-50"
												onClick={() => setIsDesktopCategoryOpen(false)}
											>
												<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white">
													{item.icon}
												</span>
												<span>{item.label}</span>
											</Link>
										))}
									</nav>
								</div>
							)}
						</div>
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
						<Link
							href="/post"
							className="shrink-0 font-semibold text-slate-700 underline decoration-slate-400 decoration-1 underline-offset-2"
						>
							Đăng tin
						</Link>
						{currentUser ? (
							<UserMenu currentUser={currentUser} />
						) : (
							<>
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
							</>
						)}
					</div>

					{!currentUser ? (
						<Link
							href="/register"
							className="rounded-xl border border-[#22c2c7] px-4 py-2 text-sm font-semibold text-[#1ab7bc] lg:hidden"
						>
							Đăng ký
						</Link>
					) : (
						<UserMenu currentUser={currentUser} variant="mobile" />
					)}
				</div>

				{isCategoryOpen ? (
					<div className="mx-auto w-full max-w-500 px-4 pb-4 lg:hidden">
						<div className="rounded-2xl border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.1)] animate-fade-in">
							<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
								<p className="text-[34px] font-extrabold text-slate-800">Danh mục</p>
								<button
									type="button"
									aria-label="Đóng danh mục"
									className="rounded-full p-2 hover:bg-slate-100"
									onClick={() => setIsCategoryOpen(false)}
								>
									<svg className="h-6 w-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
								</button>
							</div>
							<nav className="px-2 py-2">
								{CATEGORY_ITEMS.map((item) => (
									<Link
										key={item.label}
										href={item.href}
										onClick={() => setIsCategoryOpen(false)}
										className="flex items-center gap-3 rounded-xl px-3 py-3 text-[23px] text-slate-700 transition hover:bg-slate-50"
									>
										<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white">
											{item.icon}
										</span>
										<span>{item.label}</span>
									</Link>
								))}
							</nav>
						</div>
					</div>
				) : null}
			</div>
		</header>
	);
}
