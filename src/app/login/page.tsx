import type { Metadata } from "next";
import { LoginHero, LoginForm } from "@/src/features/login/components";

export const metadata: Metadata = {
	title: "Đăng nhập | PhòngTốt",
	description: "Đăng nhập để lưu phòng trọ, theo dõi tin mới và quản lý lịch hẹn xem phòng.",
};

export default function LoginPage() {
	return (
		<main className="relative isolate flex-1 overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(37,195,200,0.16),transparent_45%),radial-gradient(circle_at_92%_12%,rgba(4,90,132,0.2),transparent_38%),linear-gradient(180deg,#f9fcff_0%,#f1f5f9_100%)] py-10 sm:py-14">
			<div className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-4 lg:grid-cols-[1.05fr_1fr] lg:px-8">
				<LoginHero />
				<LoginForm />
			</div>
		</main>
	);
}