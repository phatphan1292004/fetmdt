import type { Metadata } from "next";
import { Be_Vietnam_Pro, Sora } from "next/font/google";
import { Footer, Header } from "@/src/components";
import "@/src/app/globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PhòngTốt | Tìm phòng thông minh",
  description: "Nền tảng tìm phòng nhanh, tiện và tối ưu trải nghiệm trên mọi thiết bị.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f3f5f7] text-slate-700">
        {children}
      </body>
    </html>
  );
}