import type { Metadata } from "next";
import { PostForm } from "@/src/features/post/components";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Đăng tin cho thuê | Stayvia",
	description: "Đăng tin cho thuê trọ nhanh với đầy đủ thông tin vị trí, đặc điểm và nội dung tin đăng.",
};

export default function PostPage() {
	return (
		<Suspense fallback={
			<main className="flex-1 bg-[#f3f5f7] pb-12 pt-6 sm:pt-8">
				<div className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-8 text-center text-slate-500 py-12">
					Đang tải form đăng tin...
				</div>
			</main>
		}>
			<PostForm />
		</Suspense>
	);
}

