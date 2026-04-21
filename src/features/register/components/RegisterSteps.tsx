const STEPS = [
    {
        title: "Tạo hồ sơ",
        detail:
            "Cập nhật thông tin cơ bản để xây dựng mức độ tin cậy với người xem phòng.",
    },
    {
        title: "Đăng phòng",
        detail:
            "Đăng tải hình ảnh, mô tả và giá thuê. Hệ thống gợi ý bộ lọc thông minh theo khu vực.",
    },
    {
        title: "Nhận liên hệ",
        detail:
            "Nhận yêu cầu đặt lịch xem phòng và quản lý trao đổi ngay trong một nơi.",
    },
];

export function RegisterSteps() {
    return (
        <ol className="mt-8 space-y-3">
            {STEPS.map((step, index) => (
                <li
                    key={step.title}
                    className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                >
                    <div className="mb-1 flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0b7ea9]">
                            {index + 1}
                        </span>

                        <h3 className="font-semibold text-white">
                            {step.title}
                        </h3>
                    </div>

                    <p className="text-sm leading-relaxed text-cyan-50/95">
                        {step.detail}
                    </p>
                </li>
            ))}
        </ol>
    );
}