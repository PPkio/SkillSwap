"use client";

import Link from "next/link";
import { useAppState } from "@/lib/useStore";
import {
  computeMatch,
  getCurrentUser,
  listMyIncomingPending,
  listMyActive,
  listOtherUsers,
  unreadCount,
} from "@/lib/store";

export default function Overview() {
  useAppState();
  const me = getCurrentUser();

  if (!me) {
    return (
      <div className="mt-10">
        <div className="card-layer rounded-3xl p-10 text-center">
          <p className="hand text-xl text-blush">欢迎来到 SkillSwap</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed font-light text-ash">
            一个「技能换技能」的求职技能互换社区。先去「我的」创建或选择一个身份，再回来看看你能匹配到谁。
          </p>
          <Link
            href="/me"
            className="mt-6 inline-block rounded-full bg-primary-deep/90 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-deep hover:shadow-md"
          >
            创建我的身份
          </Link>
        </div>
      </div>
    );
  }

  const incoming = listMyIncomingPending();
  const active = listMyActive();
  const unread = unreadCount();

  // 双向匹配推荐（最多 3 个）
  const recommendations = listOtherUsers()
    .map((u) => computeMatch(u, me))
    .filter((r) => r.matchType === "bidirectional")
    .sort((a, b) => b.user.credit - a.user.credit)
    .slice(0, 3);

  // 待办数量
  const todoCount = incoming.length + active.filter((s) => s.status === "scheduled").length;

  const stats = [
    { label: "连胜", value: me.streak, color: "text-sage", hint: "连续完成的交换" },
    { label: "有效交换", value: me.completedSwaps, color: "text-primary-deep", hint: "累计完成" },
    { label: "信用分", value: me.credit, color: "text-oat", hint: "满分 100" },
    { label: "待办", value: todoCount, color: "text-blush", hint: "待处理事项" },
  ];

  return (
    <div className="mt-10 space-y-6">
      {/* 欢迎卡 */}
      <div className="card-layer relative overflow-hidden rounded-3xl p-8">
        <div
          className="breathe pointer-events-none absolute -top-14 -right-14 h-52 w-52 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #7d93a8 0%, transparent 70%)" }}
        />
        <div className="relative">
          <p className="hand text-sm text-primary-deep">下午好，{me.name}</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">
            {todoCount > 0 ? `你有 ${todoCount} 件事待处理` : "一切就绪，去发现新的交换吧"}
          </h3>
          <p className="mt-2 max-w-xl text-sm font-light text-ash">
            {incoming.length > 0
              ? `有 ${incoming.length} 个交换邀约等你确认。`
              : "暂无待确认的邀约。"}
            {active.length > 0 ? ` 还有 ${active.length} 场交换在进行中。` : ""}
          </p>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-layer rounded-2xl p-5">
            <p className="text-xs font-light text-ash">{s.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-[11px] font-light text-ash-light">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* 双向匹配推荐 */}
      <div className="card-layer rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">为你推荐 · 双向匹配</p>
          <Link href="/plaza" className="text-xs font-light text-primary-deep hover:underline">
            查看全部 →
          </Link>
        </div>
        {recommendations.length === 0 ? (
          <div className="mt-4 rounded-xl bg-white/40 p-6 text-center">
            <p className="text-sm font-light text-ash">
              暂无双向匹配。去「我的」补充想学/能教的技能，系统就能帮你精准配对。
            </p>
            <Link
              href="/me"
              className="mt-3 inline-block text-sm font-light text-primary-deep hover:underline"
            >
              去完善技能 →
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {recommendations.map((r) => (
              <div key={r.user.id} className="rounded-2xl bg-white/50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft/50 text-sm font-medium text-white">
                    {r.user.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{r.user.name}</p>
                    <p className="text-xs font-light text-ash">信用分 {r.user.credit}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-light text-ink">
                  他教「{r.matchDetail.theyTeachIWant[0]}」，正好是你要学的
                </p>
                <p className="mt-1 text-xs font-light text-ash">
                  你教「{r.matchDetail.iTeachTheyWant[0]}」，正好是 TA 要学的
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 快捷入口 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/plaza"
          className="card-layer group rounded-2xl p-6 text-left"
        >
          <p className="text-sm font-medium text-ink">🔍 技能广场</p>
          <p className="mt-1.5 text-xs font-light text-ash">浏览所有人的技能，发起交换</p>
        </Link>
        <Link
          href="/swaps"
          className="card-layer group rounded-2xl p-6 text-left"
        >
          <p className="text-sm font-medium text-ink">🔁 交换中心</p>
          <p className="mt-1.5 text-xs font-light text-ash">
            {active.length > 0 ? `${active.length} 场交换进行中` : "管理你的交换流程"}
          </p>
        </Link>
        <Link
          href="/messages"
          className="card-layer group rounded-2xl p-6 text-left"
        >
          <p className="text-sm font-medium text-ink">💬 消息</p>
          <p className="mt-1.5 text-xs font-light text-ash">
            {unread > 0 ? `${unread} 条未读通知` : "没有新通知"}
          </p>
        </Link>
      </div>
    </div>
  );
}
