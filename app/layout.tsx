import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillSwap · 技能互换平台",
  description:
    "「技能换技能」的求职技能互换社区——发布我能教的、我想学的，实现技能匹配与交换。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
