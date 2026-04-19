import { RegisterSteps } from "./RegisterSteps";

export function RegisterHero() {
    return (
        <section className="order-1 rounded-3xl border border-white/60 bg-[linear-gradient(155deg,#044f74_0%,#0b7ea9_50%,#22c2c7_100%)] p-6 text-white shadow-[0_32px_60px_rgba(7,57,84,0.24)] sm:p-8 lg:order-2 lg:p-10">
            <p className="mb-3 inline-flex rounded-full border border-white/35 bg-white/14 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
                Nhanh gọn và linh hoạt
            </p>

            <h2 className="font-display text-3xl leading-tight font-black sm:text-4xl">
                Mỗi tin đăng có
                <span className="block text-[#bff3f5]">
                    cơ hội tìm khách nhanh
                </span>
            </h2>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-cyan-50/95 sm:text-lg">
                Hệ thống đề xuất thông minh giúp bạn tiếp cận đúng đối tượng có
                nhu cầu theo khu vực và ngân sách.
            </p>

            <RegisterSteps />
        </section>
    );
}