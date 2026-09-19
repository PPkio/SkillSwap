"use client";

import Link from "next/link";
import { useAppState } from "@/lib/useStore";
import {
  getCurrentUser,
  listMyNotifications,
  markAllRead,
  markNotificationRead,
} from "@/lib/store";

const typeIcon: Record<string, string> = {
  swap_invite: "🔔",
  swap_accepted: "✅",
  swap_declined: "↩️",
  swap_completed: "🎉",
  badge_unlocked: "🏅",
  system: "💬",
};

export default function Messages() {
  useAppState();
  const me = getCurrentUser();

  if (!me) {
    return (
      <div className="mt-10">
        <div className="card-layer rounded-3xl p-10 text-center">
          <p className="hand text-lg text-blush">先认识一下彼此吧</p>
          <p className="mt-2 text-sm font-light text-ash">
            请先在「我的」中选择或创建你的身份，然后查看消息。
          </p>
        </div>
      </div>
    );
  }

  const notifications = listMyNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mt-10 space-y-6">
      <div className="card-layer rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">
            通知中心
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-blush-soft/60 px-2 py-0.5 text-xs font-medium text-blush">
                {unread} 条未读
              </span>
            )}
          </p>
          {notifications.length > 0 && unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-light text-primary-deep hover:underline"
            >
              全部标为已读
            </button>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {notifications.length === 0 ? (
            <p className="py-6 text-sm font-light text-ash/70">暂无通知</p>
          ) : (
            notifications.map((n) => {
              const inner = (
                <div
                  className={`flex items-start gap-4 rounded-2xl px-5 py-4 transition-colors ${
                    n.read ? "bg-white/40" : "bg-white/70"
                  }`}
                >
                  <span className="mt-0.5 text-lg">{typeIcon[n.type] ?? "💬"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-blush" />
                      )}
                    </div>
                    <p className="mt-1 text-sm font-light text-ash">{n.body}</p>
                    <p className="mt-1.5 text-xs font-light text-ash-light">
                      {new Date(n.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>
              );

              return (
                <div key={n.id}>
                  {n.link ? (
                    <Link href={n.link} onClick={() => markNotificationRead(n.id)}>
                      {inner}
                    </Link>
                  ) : (
                    <div onClick={() => markNotificationRead(n.id)}>{inner}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
