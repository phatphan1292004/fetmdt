const FOOTER_COLUMNS = [
	{
		title: "Về PhòngTốt",
		links: ["Giới thiệu", "Báo chí nói về PhòngTốt", "Tuyển dụng"],
	},
	{
		title: "Tài khoản",
		links: ["Phòng yêu thích", "Đăng ký", "Đăng nhập", "Ký gửi phòng cho thuê"],
	},
	{
		title: "Hỗ trợ",
		links: ["Số điện thoại: 0888.022.821", "Email: lienhe@phongtot.com", "Sitemap"],
	},
];

const OFFICES = [
	{
		city: "Hồ Chí Minh",
		items: [
			{
				title: "Văn phòng quận 3",
				address: "Số 14, Cách Mạng Tháng 8, phường 4, quận 3, Hồ Chí Minh",
			},
			{
				title: "Văn phòng quận Bình Thạnh",
				address: "Số 19, Vũ Huy Tấn, phường 3, quận Bình Thạnh, Hồ Chí Minh",
			},
		],
	},
	{
		city: "Hà Nội",
		items: [
			{
				title: "Văn phòng quận Thanh Xuân",
				address: "Tòa Imperia Garden, 143 Nguyễn Tuân, phường Thanh Xuân Trung, quận Thanh Xuân, Hà Nội",
			},
			{
				title: "Văn phòng quận Cầu Giấy",
				address: "285 Khuất Duy Tiến, Phường Trung Hòa, Quận Cầu Giấy, Hà Nội",
			},
		],
	},
];

type FooterProps = {
	hotline: string;
};

export function Footer({ hotline }: FooterProps) {
	return (
		<footer className="border-t border-slate-200 bg-[#eceef1] py-14 text-slate-700">
			<div className="mx-auto w-full max-w-310 px-4 lg:px-8">
				<div className="grid gap-8 border-b border-slate-300 pb-10 md:grid-cols-2 xl:grid-cols-4">
					{FOOTER_COLUMNS.map((column) => (
						<div key={column.title}>
							<h2 className="mb-4 text-[28px] font-bold text-[#075c86]">{column.title}</h2>
							<ul className="space-y-2 text-[22px]">
								{column.links.map((link) => (
									<li key={link}>
										<button type="button" className="text-left transition hover:text-[#087cb2]">
											{link}
										</button>
									</li>
								))}
							</ul>
						</div>
					))}

					<div>
						<h2 className="mb-3 text-[28px] font-bold text-[#075c86]">Kết nối với chúng tôi</h2>
						<div className="mb-4 flex items-center gap-3 text-slate-500">
							{[
								{ label: "f", value: "Facebook" },
								{ label: "♫", value: "TikTok" },
								{ label: "▶", value: "YouTube" },
								{ label: "◉", value: "Instagram" },
							].map((social) => (
								<button
									key={social.value}
									type="button"
									className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-400 text-lg font-bold transition hover:border-[#1ab9be] hover:text-[#1ab9be]"
									aria-label={social.value}
								>
									{social.label}
								</button>
							))}
						</div>

						<h3 className="mb-3 text-[24px] font-semibold text-[#075c86]">Tải ứng dụng cho điện thoại</h3>
						<div className="flex flex-wrap gap-3 text-sm">
							<button
								type="button"
								className="rounded-2xl border border-slate-400 px-4 py-2 font-semibold transition hover:border-[#1ab9be]"
							>
								App Store
							</button>
							<button
								type="button"
								className="rounded-2xl border border-slate-400 px-4 py-2 font-semibold transition hover:border-[#1ab9be]"
							>
								Google Play
							</button>
						</div>
					</div>
				</div>

				<div className="space-y-8 pt-7">
					{OFFICES.map((officeGroup) => (
						<section key={officeGroup.city} className="border-b border-slate-300 pb-6 last:border-b-0 last:pb-0">
							<h3 className="mb-4 text-[27px] font-semibold text-slate-800">
								<span className="mr-2 text-lg">⌃</span>
								Xem văn phòng của PhòngTốt tại {officeGroup.city}
							</h3>

							<div className="grid gap-6 md:grid-cols-2">
								{officeGroup.items.map((office) => (
									<article key={office.title} className="space-y-2 text-[21px]">
										<h4 className="font-semibold text-[#087cb2]">{office.title}</h4>
										<p>{office.address}</p>
										<p>Điện thoại: {hotline}</p>
									</article>
								))}
							</div>
						</section>
					))}
				</div>

				<p className="mt-8 text-[18px] text-slate-500">
					© 2023-2025. Bản quyền của Phòng tốt - Địa chỉ: Tòa nhà Imperia Garden, 143 Nguyễn Tuân, Quận
					Thanh Xuân, TP Hà Nội. - Điện thoại: {hotline}.
				</p>
			</div>
		</footer>
	);
}
