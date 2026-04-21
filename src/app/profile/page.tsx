import type { Metadata } from "next";
import { ProfilePage } from "@/src/features/user";

export const metadata: Metadata = {
  title: "Profile | PhongTot",
  description: "Quan ly thong tin ca nhan, tin dang da luu va tin dang cua ban.",
};

export default function ProfileRoutePage() {
  return <ProfilePage />;
}
