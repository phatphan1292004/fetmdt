import type { Metadata } from "next";
import { PostForm } from "@/src/features/post/components";

export const metadata: Metadata = {
	title: "Đăng tin cho thuê | PhòngTốt",
	description: "Đăng tin cho thuê trọ nhanh với đầy đủ thông tin vị trí, đặc điểm và nội dung tin đăng.",
};

export default function PostPage() {
	return <PostForm />;
}
