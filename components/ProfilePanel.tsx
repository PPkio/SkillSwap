"use client";

import { useAppState } from "@/lib/useStore";
import {
  addSkill,
  createUser,
  getCurrentUser,
  logout,
  removeSkill,
  resetToSeed,
  switchUser,
  type Skill,
  type SkillLevel,
} from "@/lib/store";
import { BADGES, SKILL_TAGS } from "@/lib/store";
import { useState } from "react";

function LevelBadge({ level }: { level: SkillLevel }) {
  const color =
    level === "精通"
      ? "bg-primary-deep text-white"
      : level === "熟练"
        ? "bg-sage-soft/60 text-sage"
        : "bg-oat-soft/60 text-oat";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${color}`}>
      {level}
    </span>
  );
}

export default function ProfilePanel() {
  const state = useAppState();
  const me = getCurrentUser();

  const [kind, setKind] = useState<"teach" | "learn">("teach");
  const [tag, setTag] = useState(SKILL_TAGS[0]);
  const [customTag, setCustomTag] = useState("");
  const [level, setLevel] = useState<SkillLevel>("熟练");

  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const effectiveTag = customTag.trim() || tag;

  function handleAdd() {
    const n = effectiveTag.trim();
    if (!n) return;
    addSkill(kind, n, kind === "learn" ? "想学" : level);
    setCustomTag("");
  }

  function handleRegister() {
    if (!name.trim()) return;
    createUser(name.trim(), bio.trim());
    setShowRegister(false);
    setName("");
    setBio("");
  }

  if (!me) {
    return (
      <div className="mt-10">
        <div className="card-layer rounded-3xl p-10">
          <p className="hand text-lg text-blush">先认识一下彼此吧</p>
          <p className="mt-2 max-w-md text-sm font-light text-ash">
            平台支持多用户切换，便于演示「双向匹配」与「交换」流程。
          </p>

          <div className="mt-8">
            <p className="text-xs font-medium tracking-wide text-ash uppercase">
              已有用户
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {state.users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className="card-layer rounded-2xl p-5 text-left"
                >
                  <span className="text-sm font-medium text-ink">{u.name}</span>
                  <span className="mt-1 block text-xs font-light text-ash">
                    {u.skills.filter((s) => s.kind === "teach").length} 教 ·{" "}
                    {u.skills.filter((s) => s.kind === "learn").length} 学
                  </span>
                </button>
              ))}
            </div>
          </div>

          {showRegister ? (
            <div className="mt-8 space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的昵称"
                className="h-11 w-full rounded-xl border border-white/60 bg-white/70 px-4 text-sm font-light text-ink placeholder:text-ash-light focus:border-primary-soft focus:outline-none"
              />
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="一句话介绍（可选）"
                className="h-11 w-full rounded-xl border border-white/60 bg-white/70 px-4 text-sm font-light text-ink placeholder:text-ash-light focus:border-primary-soft focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRegister}
                  className="rounded-full bg-primary-deep/90 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-deep hover:shadow-md"
                >
                  创建并进入
                </button>
                <button
                  onClick={() => setShowRegister(false)}
                  className="rounded-full border border-white/60 px-5 py-2.5 text-sm font-light text-ink transition-colors hover:bg-white/60"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowRegister(true)}
              className="mt-8 rounded-full border border-white/60 px-6 py-3 text-sm font-light text-ink transition-colors hover:bg-white/60"
            >
              + 创建新用户
            </button>
          )}
        </div>
      </div>
    );
  }

  const teachSkills = me.skills.filter((s) => s.kind === "teach");
  const learnSkills = me.skills.filter((s) => s.kind === "learn");

  return (
    <div className="mt-10 space-y-6">
      {/* 档案头卡 */}
      <div className="card-layer relative overflow-hidden rounded-3xl p-8">
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #7d93a8 0%, transparent 70%)" }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="hand text-sm text-primary-deep">你好，{me.name}</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">{me.name}</h3>
            <p className="mt-2 max-w-md text-sm font-light text-ash">{me.bio}</p>
          </div>
          <div className="flex gap-8 text-right">
            <div>
              <p className="text-xs font-light text-ash">连胜</p>
              <p className="mt-1 text-2xl font-semibold text-sage">{me.streak}</p>
            </div>
            <div>
              <p className="text-xs font-light text-ash">有效交换</p>
              <p className="mt-1 text-2xl font-semibold text-primary-deep">
                {me.completedSwaps}
              </p>
            </div>
            <div>
              <p className="text-xs font-light text-ash">信用分</p>
              <p className="mt-1 text-2xl font-semibold text-oat">{me.credit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 成就徽章 */}
      <div className="card-layer rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">成就徽章</p>
          <span className="text-xs font-light text-ash">
            {me.earnedBadges.length} / {BADGES.length} 已解锁
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {BADGES.map((b) => {
            const earned = me.earnedBadges.includes(b.id);
            const colorMap = {
              sage: "bg-sage-soft/60 text-sage",
              blush: "bg-blush-soft/60 text-blush",
              oat: "bg-oat-soft/60 text-oat",
              primary: "bg-primary-soft/50 text-primary-deep",
            } as const;
            return (
              <div
                key={b.id}
                className={`flex flex-col items-center rounded-2xl p-4 text-center ${
                  earned ? colorMap[b.color] : "bg-white/40"
                }`}
                title={b.desc}
              >
                <span className={`text-2xl ${earned ? "" : "opacity-30 grayscale"}`}>
                  {b.icon}
                </span>
                <span
                  className={`mt-2 text-xs font-medium ${
                    earned ? "text-ink" : "text-ash-light"
                  }`}
                >
                  {b.name}
                </span>
                <span className="mt-1 text-[10px] font-light text-ash-light">{b.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 技能两列 */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SkillColumn
          title="我能教的"
          accent="sage"
          skills={teachSkills}
          onRemove={removeSkill}
        />
        <SkillColumn
          title="我想学的"
          accent="blush"
          skills={learnSkills}
          onRemove={removeSkill}
        />
      </div>

      {/* 发布技能表单卡 */}
      <div className="card-layer rounded-3xl p-8">
        <p className="text-sm font-medium text-ink">发布新技能</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-full border border-white/60 bg-white/50">
            {(["teach", "learn"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`px-4 py-2 text-sm transition-colors ${
                  kind === k
                    ? "bg-primary-deep text-white"
                    : "font-light text-ash hover:text-ink"
                }`}
              >
                {k === "teach" ? "我能教" : "我想学"}
              </button>
            ))}
          </div>

          <select
            value={customTag ? "__custom" : tag}
            onChange={(e) => {
              if (e.target.value !== "__custom") {
                setTag(e.target.value);
                setCustomTag("");
              }
            }}
            className="h-10 rounded-full border border-white/60 bg-white/60 px-4 text-sm font-light text-ink focus:outline-none"
          >
            {customTag && <option value="__custom">自定义：{customTag}</option>}
            {SKILL_TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            placeholder="或自定义技能…"
            className="h-10 w-44 rounded-full border border-white/60 bg-white/60 px-4 text-sm font-light text-ink placeholder:text-ash-light focus:border-primary-soft focus:outline-none"
          />

          {kind === "teach" && (
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as SkillLevel)}
              className="h-10 rounded-full border border-white/60 bg-white/60 px-4 text-sm font-light text-ink focus:outline-none"
            >
              <option value="熟练">熟练</option>
              <option value="精通">精通</option>
            </select>
          )}

          <button
            onClick={handleAdd}
            disabled={!effectiveTag.trim()}
            className="rounded-full bg-primary-deep/90 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-deep hover:shadow-md disabled:opacity-30"
          >
            发布
          </button>
        </div>
        {kind === "learn" && (
          <p className="mt-3 text-xs font-light text-ash">
            想学的技能自动标记为「想学」；我能教的技能需自评「熟练」或「精通」。
          </p>
        )}
      </div>

      {/* 设置 */}
      <div className="card-layer rounded-3xl p-8">
        <p className="text-sm font-medium text-ink">设置</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={logout}
            className="rounded-full border border-white/60 px-5 py-2.5 text-sm font-light text-ink transition-colors hover:bg-white/60"
          >
            切换身份
          </button>
          <button
            onClick={() => {
              if (confirm("确定要重置所有数据吗？将恢复为初始种子数据。")) {
                resetToSeed();
              }
            }}
            className="rounded-full border border-white/60 px-5 py-2.5 text-sm font-light text-ash transition-colors hover:bg-white/60"
          >
            重置演示数据
          </button>
        </div>
        <p className="mt-4 text-xs font-light text-ash-light">
          数据保存在浏览器本地（localStorage），重置将恢复初始演示状态。
        </p>
      </div>
    </div>
  );
}

function SkillColumn({
  title,
  accent,
  skills,
  onRemove,
}: {
  title: string;
  accent: "sage" | "blush";
  skills: Skill[];
  onRemove: (id: string) => void;
}) {
  const labelColor = accent === "sage" ? "text-sage" : "text-blush";
  const emptyText =
    accent === "sage" ? "还没有可教的技能" : "还没有想学的技能";

  return (
    <div className="card-layer rounded-3xl p-6">
      <p className={`text-sm font-medium ${labelColor}`}>{title}</p>
      <div className="mt-4 space-y-2">
        {skills.length === 0 ? (
          <p className="py-4 text-sm font-light text-ash/70">{emptyText}</p>
        ) : (
          skills.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span className="text-sm font-light text-ink">{s.name}</span>
                <LevelBadge level={s.level} />
              </span>
              <button
                onClick={() => onRemove(s.id)}
                className="text-xs font-light text-ash transition-colors hover:text-ink"
                aria-label="移除"
              >
                移除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
