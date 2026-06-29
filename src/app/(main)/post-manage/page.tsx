import type { Metadata } from "next";
import { PostManagementPage } from "@/src/features/post";

export const metadata: Metadata = {
  title: "Quan ly tin | PhongTot",
  description: "Theo doi va quan ly cac tin dang cho thue phong tro cua ban.",
};

export default function PostManagementRoutePage() {
  return <PostManagementPage />;
}
