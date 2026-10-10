import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import PointerAtmosphere from "@/components/PointerAtmosphere";

export const metadata: Metadata = {
  title: "孙烁飞 · 一张不断生长的桌面",
  description: "中国科学技术大学工商管理硕士。这里放着我的求学经历、研究、项目、荣誉和随笔。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}<PointerAtmosphere /><Toaster position="bottom-right"/></body>
    </html>
  );
}
