import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/src/features/forgot-password/components";

export const metadata: Metadata = {
	title: "Quên mật khẩu | Stayvia",
	description: "Khôi phục mật khẩu tài khoản Stayvia của bạn để tiếp tục tìm kiếm phòng trọ.",
};

export default function ForgotPasswordPage() {
	return (
		<main className="relative isolate flex min-h-screen items-center overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(37,195,200,0.16),transparent_45%),radial-gradient(circle_at_92%_12%,rgba(4,90,132,0.2),transparent_38%),linear-gradient(180deg,#f9fcff_0%,#f1f5f9_100%)] py-10 sm:py-14">
			<div className="relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8">
				<ForgotPasswordForm />
			</div>
		</main>
	);
}
