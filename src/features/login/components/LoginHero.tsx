const HIGHLIGHTS = [
    "Lưu phòng yêu thích và nhận thông báo khi giá thay đổi",
    "Đặt lịch xem phòng nhanh với chủ trọ uy tín",
    "Đồng bộ tìm kiếm trên điện thoại và máy tính",
];

export function LoginHero() {
    return (
        <section className="rounded-3xl border border-white/60 bg-[linear-gradient(148deg,#045a84_0%,#0b7ea9_54%,#22c2c7_100%)] p-6 text-white shadow-[0_32px_60px_rgba(7,57,84,0.26)] sm:p-8 lg:p-10">
            <p className="mb-3 inline-flex rounded-full border border-white/35 bg-white/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                Tai khoan ca nhan
            </p>

            <h1 className="font-display text-3xl font-black leading-tight sm:text-4xl">
                Chào mừng bạn quay lại với
                <span className="block text-[#bff3f5]">PhòngTốt</span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-cyan-50/95 sm:text-lg">
                Đăng nhập để tiếp tục hành trình tìm phòng thông minh.
            </p>

            <ul className="mt-8 space-y-3">
                {HIGHLIGHTS.map((item) => (
                    <li
                        key={item}
                        className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm"
                    >
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0b7ea9]">
                            ✓
                        </span>
                        <span className="text-sm text-cyan-50/95">{item}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}