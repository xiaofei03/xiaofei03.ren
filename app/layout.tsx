import type { Metadata } from "next";
import "./globals.css";
import AppToaster from "@/components/AppToaster";
import PointerAtmosphere from "@/components/PointerAtmosphere";
import { MotionPreferences } from '@/components/MotionPreferences';
import SiteRegistration from '@/components/SiteRegistration';

export const metadata: Metadata = {
  title: "日光之间",
  description: "中国科学技术大学工商管理硕士。这里放着我的求学经历、研究、项目、荣誉和随笔。",
  openGraph: {
    title: "日光之间",
    description: "在日光之间，记录求学、研究、项目与生活里的好奇心。",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "日光之间",
    description: "在日光之间，记录求学、研究、项目与生活里的好奇心。",
  },
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
      <body className="antialiased"><MotionPreferences>{children}<SiteRegistration/><PointerAtmosphere /><AppToaster/></MotionPreferences></body>
    </html>
  );
}
