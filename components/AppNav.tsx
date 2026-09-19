"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentUser, unreadCount } from "@/lib/store";
import { useAppState } from "@/lib/useStore";

const tabs = [
  { href: "/", label: "概览" },
  { href: "/plaza", label: "技能广场" },
  { href: "/swaps", label: "交换中心" },
  { href: "/messages", label: "消息" },
  { href: "/me", label: "我的" },
];

export default function AppNav() {
  const pathname = usePathname();
  useAppState();
  const me = getCurrentUser();
  const unread = unreadCount();

  return (
    <nav className="sticky top-0 z-50">
      <div className="glass border-x-0 border-t-0 border-b border-white/40">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold tracking-tight text-primary-deep">
              SkillSwap
            </span>
            <span className="hand text-sm text-sage">换你所想</span>
          </Link>

          <div className="flex items-center gap-1.5">
            {tabs.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`relative rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                    active
                      ? "bg-primary-deep/90 font-medium text-white shadow-sm"
                      : "font-light text-ash hover:bg-white/50 hover:text-ink"
                  }`}
                >
                  {t.label}
                  {t.href === "/messages" && unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blush px-1 text-[10px] font-medium text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <Link
            href="/me"
            className="flex items-center gap-2 rounded-full bg-white/60 px-3.5 py-1.5 text-xs font-light text-ink-soft transition-colors hover:bg-white/80"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft/50 text-[10px] text-white">
              {me ? me.name.slice(0, 1) : "?"}
            </span>
            {me ? me.name : "未登录"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
