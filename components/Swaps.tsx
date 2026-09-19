"use client";

import { useState } from "react";
import { useAppState } from "@/lib/useStore";
import {
  acceptSwap,
  cancelSwap,
  completeSwap,
  declineSwap,
  getCurrentUser,
  listMySwaps,
  rateSwap,
  scheduleSwap,
  startSwap,
  userName,
  type SwapRequest,
  type SwapStatus,
} from "@/lib/store";

const statusConfig: Record<SwapStatus, { label: string; className: string }> = {
  pending: { label: "待确认", className: "bg-oat-soft/60 text-oat" },
  confirmed: { label: "待排期", className: "bg-primary-soft/50 text-primary-deep" },
  scheduled: { label: "已排期", className: "bg-primary-soft/50 text-primary-deep" },
  ongoing: { label: "进行中", className: "bg-sage-soft/60 text-sage" },
  completed: { label: "已完成", className: "bg-blush-soft/60 text-blush" },
  cancelled: { label: "已取消", className: "bg-white/60 text-ash" },
  declined: { label: "已拒绝", className: "bg-white/60 text-ash" },
};

function TimeLine({ swap }: { swap: SwapRequest }) {
  return (
    <div className="mt-4 space-y-2 border-l-2 border-white/70 pl-4">
      {swap.timeline.map((e, i) => (
        <div key={i} className="relative">
          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary-soft" />
          <p className="text-xs font-light text-ink-soft">{e.text}</p>
          <p className="text-[11px] font-light text-ash-light">
            {new Date(e.at).toLocaleString("zh-CN")}
          </p>
        </div>
      ))}
    </div>
  );
}

function Ratings({ swap }: { swap: SwapRequest }) {
  if (swap.ratings.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      {swap.ratings.map((r, i) => (
        <div key={i} className="rounded-xl bg-white/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-ink">{userName(r.fromUserId)}</span>
            <span className="text-sm text-oat">
              {"★".repeat(r.score)}
              <span className="text-ash-light">{"★".repeat(5 - r.score)}</span>
            </span>
          </div>
          {r.comment && <p className="mt-1 text-xs font-light text-ash">“{r.comment}”</p>}
        </div>
      ))}
    </div>
  );
}

function RatingModal({
  swap,
  onClose,
}: {
  swap: SwapRequest;
  onClose: () => void;
}) {
  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");

  function submit() {
    rateSwap(swap.id, score, comment.trim());
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="glass w-full max-w-md rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
        <p className="hand text-sm text-blush">一场交换的句点</p>
        <p className="mt-2 text-xl font-semibold text-ink">给对方评分</p>
        <p className="mt-1 text-sm font-light text-ash">
          为 {userName(swap.fromUserId === getCurrentUser()?.id ? swap.toUserId : swap.fromUserId)}{" "}
          的这次交换打分
        </p>

        <div className="mt-6 flex items-center gap-1">
          {([1, 2, 3, 4, 5] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScore(s)}
              className={`text-3xl transition-colors ${
                s <= score ? "text-oat" : "text-ash-light"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs font-light text-ash">
          {score === 5 ? "非常满意" : score === 4 ? "满意" : score === 3 ? "一般" : "不太满意"}
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="说点什么（可选）"
          rows={3}
          className="mt-5 w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-light text-ink placeholder:text-ash-light focus:border-primary-soft focus:outline-none"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/60 px-5 py-2.5 text-sm font-light text-ink transition-colors hover:bg-white/60"
          >
            稍后再说
          </button>
          <button
            onClick={submit}
            className="rounded-full bg-primary-deep/90 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-deep hover:shadow-md"
          >
            提交评分
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Swaps() {
  useAppState();
  const me = getCurrentUser();

  const [scheduleTarget, setScheduleTarget] = useState<SwapRequest | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [ratingTarget, setRatingTarget] = useState<SwapRequest | null>(null);

  if (!me) {
    return (
      <div className="mt-10">
        <div className="card-layer rounded-3xl p-10 text-center">
          <p className="hand text-lg text-blush">先认识一下彼此吧</p>
          <p className="mt-2 text-sm font-light text-ash">
            请先在「我的」中选择或创建你的身份，然后查看交换中心。
          </p>
        </div>
      </div>
    );
  }

  const swaps = listMySwaps();
  const incoming = swaps.filter((s) => s.toUserId === me.id && s.status === "pending");
  const active = swaps.filter(
    (s) => s.status === "confirmed" || s.status === "scheduled" || s.status === "ongoing",
  );
  const history = swaps.filter(
    (s) => s.status === "completed" || s.status === "cancelled" || s.status === "declined",
  );

  function openSchedule(s: SwapRequest) {
    setScheduleTarget(s);
    const d = new Date(Date.now() + 24 * 3600 * 1000);
    d.setMinutes(0, 0, 0);
    setScheduleAt(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:00`,
    );
  }

  function confirmSchedule() {
    if (!scheduleTarget || !scheduleAt) return;
    scheduleSwap(scheduleTarget.id, new Date(scheduleAt).getTime());
    setScheduleTarget(null);
  }

  // 我是否已经给这场交换评分
  function iRated(s: SwapRequest): boolean {
    return s.ratings.some((r) => r.fromUserId === me!.id);
  }

  return (
    <div className="mt-10 space-y-6">
      {/* 待确认 */}
      <div className="card-layer rounded-3xl p-8">
        <p className="text-sm font-medium text-ink">
          待确认的邀约
          {incoming.length > 0 && (
            <span className="ml-2 rounded-full bg-blush-soft/60 px-2 py-0.5 text-xs font-medium text-blush">
              {incoming.length}
            </span>
          )}
        </p>
        <div className="mt-4 space-y-3">
          {incoming.length === 0 ? (
            <p className="py-4 text-sm font-light text-ash/70">暂无待确认的邀约</p>
          ) : (
            incoming.map((s) => (
              <div key={s.id} className="rounded-2xl bg-white/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      {userName(s.fromUserId)} 想学你的「{s.fromSkill}」
                    </p>
                    <p className="mt-1.5 text-sm font-light text-ash">
                      愿用「{s.toSkill || "未指定"}」作为交换
                    </p>
                    {s.message && (
                      <p className="mt-2 text-sm font-light text-ink-soft">“{s.message}”</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      onClick={() => acceptSwap(s.id)}
                      className="rounded-full bg-primary-deep/90 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-deep hover:shadow-md"
                    >
                      接受
                    </button>
                    <button
                      onClick={() => declineSwap(s.id)}
                      className="rounded-full border border-white/60 px-4 py-2 text-sm font-light text-ink transition-colors hover:bg-white/60"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 进行中 */}
      <div className="card-layer rounded-3xl p-8">
        <p className="text-sm font-medium text-ink">进行中的交换</p>
        <div className="mt-4 space-y-3">
          {active.length === 0 ? (
            <p className="py-4 text-sm font-light text-ash/70">暂无进行中的交换</p>
          ) : (
            active.map((s) => {
              const other =
                s.fromUserId === me.id ? s.toUserId : s.fromUserId;
              const cfg = statusConfig[s.status];
              return (
                <div key={s.id} className="rounded-2xl bg-white/50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink">
                          与 {userName(other)} 交换「{s.fromSkill}」
                        </p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs font-light text-ash">
                        对方用「{s.toSkill || "未指定"}」交换
                      </p>
                      {s.scheduledAt && (
                        <p className="mt-1 text-xs font-light text-ink-soft">
                          📅 约定时间：
                          {new Date(s.scheduledAt).toLocaleString("zh-CN")}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {s.status === "confirmed" && (
                        <button
                          onClick={() => openSchedule(s)}
                          className="rounded-full border border-white/60 px-4 py-2 text-sm font-light text-ink transition-colors hover:bg-white/60"
                        >
                          约定时间
                        </button>
                      )}
                      {s.status === "scheduled" && (
                        <button
                          onClick={() => startSwap(s.id)}
                          className="rounded-full bg-primary-deep/90 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-deep hover:shadow-md"
                        >
                          开始交换
                        </button>
                      )}
                      {s.status === "ongoing" && (
                        <button
                          onClick={() => completeSwap(s.id)}
                          className="rounded-full bg-primary-deep/90 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-deep hover:shadow-md"
                        >
                          完成交换
                        </button>
                      )}
                      <button
                        onClick={() => cancelSwap(s.id)}
                        className="rounded-full border border-white/60 px-4 py-2 text-sm font-light text-ash transition-colors hover:bg-white/60"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                  <TimeLine swap={s} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 历史 */}
      <div className="card-layer rounded-3xl p-8">
        <p className="text-sm font-medium text-ink">交换历史</p>
        <div className="mt-4 space-y-3">
          {history.length === 0 ? (
            <p className="py-4 text-sm font-light text-ash/70">还没有交换记录</p>
          ) : (
            history.map((s) => {
              const isFrom = s.fromUserId === me.id;
              const other = isFrom ? s.toUserId : s.fromUserId;
              const cfg = statusConfig[s.status];
              return (
                <div key={s.id} className="rounded-2xl bg-white/50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-light text-ink">
                          {isFrom ? "我" : other} → {isFrom ? other : "我"} · 技能「{s.fromSkill}」
                        </p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-light text-ash">
                        {new Date(s.createdAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    {s.status === "completed" && !iRated(s) && (
                      <button
                        onClick={() => setRatingTarget(s)}
                        className="shrink-0 rounded-full bg-oat/90 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-oat hover:shadow-md"
                      >
                        去评分
                      </button>
                    )}
                  </div>
                  <Ratings swap={s} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 排期弹窗 */}
      {scheduleTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 p-6 backdrop-blur-sm"
          onClick={() => setScheduleTarget(null)}
        >
          <div className="glass w-full max-w-md rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
            <p className="hand text-sm text-sage">定个时间，双向奔赴</p>
            <p className="mt-2 text-xl font-semibold text-ink">约定交换时间</p>
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="mt-6 h-11 w-full rounded-xl border border-white/60 bg-white/70 px-3 text-sm font-light text-ink focus:border-primary-soft focus:outline-none"
            />
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setScheduleTarget(null)}
                className="rounded-full border border-white/60 px-5 py-2.5 text-sm font-light text-ink transition-colors hover:bg-white/60"
              >
                取消
              </button>
              <button
                onClick={confirmSchedule}
                disabled={!scheduleAt}
                className="rounded-full bg-primary-deep/90 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-deep hover:shadow-md disabled:opacity-30"
              >
                确认时间
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 评分弹窗 */}
      {ratingTarget && (
        <RatingModal swap={ratingTarget} onClose={() => setRatingTarget(null)} />
      )}
    </div>
  );
}
