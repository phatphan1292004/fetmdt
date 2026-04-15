import type { Metadata } from "next";
import { PostForm } from "@/src/features/post/components";

export const metadata: Metadata = {
	title: "Dang tin cho thue | PhongTot",
	description: "Dang tin cho thue tro nhanh voi day du thong tin vi tri, dac diem va noi dung tin dang.",
};

export default function PostPage() {
	return <PostForm />;
}
