import type { Metadata } from "next";
import { ResetPasswordForm } from "@/src/features/forgot-password/components";

export const metadata: Metadata = {
	title: "Đặt lại mật khẩu | Stayvia",
	description: "Thiết lập mật khẩu mới cho tài khoản Stayvia của bạn.",
};

export default function ResetPasswordPage() {
	return (
		<main className="relative isolate flex min-h-screen items-center overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(37,195,200,0.16),transparent_45%),radial-gradient(circle_at_92%_12%,rgba(4,90,132,0.2),transparent_38%),linear-gradient(180deg,#f9fcff_0%,#f1f5f9_100%)] py-10 sm:py-14">
			<div className="relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8">
				<ResetPasswordForm />
			</div>
		</main>
	);
}
