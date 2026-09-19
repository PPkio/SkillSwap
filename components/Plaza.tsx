"use client";

import { useAppState } from "@/lib/useStore";
import {
  computeMatch,
  createSwapRequest,
  getCurrentUser,
  listOtherUsers,
  type MatchResult,
} from "@/lib/store";
import { useState } from "react";

type MatchType = MatchResult["matchType"];

function MatchPill({ type }: { type: MatchType }) {
  if (type === "bidirectional") {
    return (
      <span className="rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage">
        ✦ 双向匹配
      </span>
    );
  }
  if (type === "single") {
    return (
      <span className="rounded-full bg-oat-soft px-3 py-1 text-xs font-medium text-oat">
        单向匹配
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-light text-ash">
      待发现
    </span>
  );
}

export default function Plaza() {
  useAppState();
  const me = getCurrentUser();
  const others = listOtherUsers();

  const [filter, setFilter] = useState<"all" | "bidirectional" | "single">("all");
  const [search, setSearch] = useState("");

  const [inviteTarget, setInviteTarget] = useState<MatchResult | null>(null);
  const [inviteSkill, setInviteSkill] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  if (!me) {
    return (
      <div className="mt-10">
        <div className="card-layer rounded-3xl p-10 text-center">
          <p className="hand text-xl text-blush">先认识一下彼此吧</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed font-light text-ash">
            请先在「我的」中选择或创建你的身份，然后回到这里查看与你匹配的技能供给。
          </p>
        </div>
      </div>
    );
  }

  const myLearnNames = me.skills.filter((s) => s.kind === "learn").map((s) => s.name);
  const myTeachNames = me.skills.filter((s) => s.kind === "teach").map((s) => s.name);

  const results = others
    .map((u) => computeMatch(u, me))
    .filter((r) => {
      if (filter === "bidirectional") return r.matchType === "bidirectional";
      if (filter === "single") return r.matchType !== "none";
      return true;
    })
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return r.user.skills.some((s) => s.name.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const order: Record<MatchType, number> = { bidirectional: 0, single: 1, none: 2 };
      return order[a.matchType] - order[b.matchType];
    });

  function openInvite(r: MatchResult) {
    setInviteTarget(r);
    setInviteSkill(
      r.matchDetail.theyTeachIWant[0] ??
        r.user.skills.find((s) => s.kind === "teach")?.name ??
        "",
    );
    setInviteMessage("");
  }

  function sendInvite() {
    if (!inviteTarget || !inviteSkill.trim()) return;
    createSwapRequest(
      inviteTarget.user.id,
      inviteSkill.trim(),
      inviteTarget.matchDetail.iTeachTheyWant[0] ?? "",
      inviteMessage.trim() || "想和你交换这个技能，方便吗？",
    );
    setInviteTarget(null);
    setInviteSkill("");
    setInviteMessage("");
  }

  return (
    <div className="mt-10">
      {/* 我的供需概览卡 */}
      <div className="card-layer rounded-2xl p-6">
        <p className="text-sm font-medium text-ink">我的供需</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-blush-soft/40 p-4">
            <p className="text-xs font-medium text-blush">我想学的</p>
            <p className="mt-1.5 text-sm font-light text-ink">
              {myLearnNames.length ? myLearnNames.join("、") : "（去档案添加）"}
            </p>
          </div>
          <div className="rounded-xl bg-sage-soft/40 p-4">
            <p className="text-xs font-medium text-sage">我能教的</p>
            <p className="mt-1.5 text-sm font-light text-ink">
              {myTeachNames.length ? myTeachNames.join("、") : "（去档案添加）"}
            </p>
          </div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(
            [
              ["all", "全部"],
              ["bidirectional", "双向匹配"],
              ["single", "可匹配"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                filter === key
                  ? "bg-primary-deep/90 font-medium text-white shadow-sm"
                  : "bg-white/50 font-light text-ash hover:bg-white/80 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索技能名…"
          className="h-10 w-48 rounded-full border border-white/60 bg-white/60 px-4 text-sm font-light text-ink placeholder:text-ash-light backdrop-blur-sm focus:border-primary-soft focus:outline-none"
        />
      </div>

      {/* 用户卡片网格 */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {results.length === 0 ? (
          <div className="card-layer col-span-full rounded-3xl p-12 text-center">
            <p className="hand text-lg text-ash">这里还空空的</p>
            <p className="mt-2 text-sm font-light text-ash">
              试试切换到「全部」，或先去「我的」补充想学/能教的技能。
            </p>
          </div>
        ) : (
          results.map((r) => (
            <div
              key={r.user.id}
              className="card-layer flex flex-col rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* 头像：莫兰迪色首字 */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft/50 text-base font-medium text-white">
                    {r.user.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-ink">{r.user.name}</h3>
                    <p className="text-xs font-light text-ash">
                      连胜 {r.user.streak} · 信用分 {r.user.credit}
                    </p>
                  </div>
                </div>
                <MatchPill type={r.matchType} />
              </div>

              <p className="mt-3 text-xs font-light text-ash">{r.user.bio}</p>

              {/* 技能标签 */}
              <div className="mt-4 flex flex-wrap gap-2">
                {r.user.skills.map((s) => (
                  <span
                    key={s.id}
                    className={`rounded-full px-3 py-1 text-xs font-light ${
                      s.kind === "teach"
                        ? "bg-sage-soft/50 text-sage"
                        : "bg-white/60 text-ash"
                    }`}
                  >
                    {s.kind === "teach" ? "教" : "学"} · {s.name}
                    {s.kind === "teach" && s.level !== "想学" ? ` · ${s.level}` : ""}
                  </span>
                ))}
              </div>

              {/* 匹配详情 */}
              {r.matchType !== "none" && (
                <div className="mt-4 space-y-1.5 rounded-xl bg-white/40 p-3 text-xs font-light">
                  {r.matchDetail.theyTeachIWant.length > 0 && (
                    <p className="text-ink">
                      他教的我正好想学：{r.matchDetail.theyTeachIWant.join("、")}
                    </p>
                  )}
                  {r.matchDetail.iTeachTheyWant.length > 0 && (
                    <p className="text-ash">
                      我教的他正好想学：{r.matchDetail.iTeachTheyWant.join("、")}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => openInvite(r)}
                className="mt-5 rounded-full bg-primary-deep/90 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-deep hover:shadow-md"
              >
                发起互换
              </button>
            </div>
          ))
        )}
      </div>

      {/* 邀请弹窗 */}
      {inviteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 p-6 backdrop-blur-sm"
          onClick={() => setInviteTarget(null)}
        >
          <div
            className="glass w-full max-w-md rounded-3xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="hand text-sm text-blush">一次交换的开始</p>
            <p className="mt-2 text-xl font-semibold text-ink">
              向 {inviteTarget.user.name} 发起互换
            </p>
            <p className="mt-1 text-sm font-light text-ash">你想学 TA 的哪个技能？</p>

            <div className="mt-6 space-y-4">
              <select
                value={inviteSkill}
                onChange={(e) => setInviteSkill(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/60 bg-white/70 px-3 text-sm font-light text-ink focus:border-primary-soft focus:outline-none"
              >
                {inviteTarget.user.skills
                  .filter((s) => s.kind === "teach")
                  .map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}（{s.level}）
                    </option>
                  ))}
              </select>

              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="说点什么（可选）：你的时间安排、想交换的方式"
                rows={3}
                className="w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-light text-ink placeholder:text-ash-light focus:border-primary-soft focus:outline-none"
              />
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setInviteTarget(null)}
                className="rounded-full border border-white/60 px-5 py-2.5 text-sm font-light text-ink transition-colors hover:bg-white/60"
              >
                取消
              </button>
              <button
                onClick={sendInvite}
                disabled={!inviteSkill.trim()}
                className="rounded-full bg-primary-deep/90 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-deep hover:shadow-md disabled:opacity-30"
              >
                发送邀请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
