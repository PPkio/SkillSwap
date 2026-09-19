/**
 * SkillSwap 核心数据模型与本地存储
 * 数据持久化到 localStorage，实现「发布 → 匹配 → 邀约 → 排期 → 交换 → 互评」的完整闭环。
 */

export type SkillLevel = "想学" | "熟练" | "精通";

export type SkillKind = "teach" | "learn";

export interface Skill {
  id: string;
  name: string;
  kind: SkillKind; // teach = 我能教的；learn = 我想学的
  level: SkillLevel;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  skills: Skill[];
  streak: number; // 连胜
  completedSwaps: number; // 有效交换次数
  credit: number; // 信用分（100 满分，含历史，只升不降，扣分单列）
  earnedBadges: string[]; // 已解锁的成就徽章 id
  createdAt: number;
}

/**
 * 交换状态机：
 * pending      邀约已发出，等待对方确认
 * confirmed    双方已确认，待排期
 * scheduled    已排期（约定了时间）
 * ongoing      交换进行中
 * completed    已完成并互评
 * cancelled    已取消（任一方发起）
 * declined     已拒绝
 */
export type SwapStatus =
  | "pending"
  | "confirmed"
  | "scheduled"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "declined";

export interface SwapTimelineEvent {
  at: number;
  type:
    | "created"
    | "accepted"
    | "declined"
    | "scheduled"
    | "started"
    | "completed"
    | "cancelled"
    | "rated";
  text: string;
}

export interface Rating {
  fromUserId: string;
  score: 1 | 2 | 3 | 4 | 5; // 对方给的评分
  comment: string;
  at: number;
}

export interface SwapRequest {
  id: string;
  fromUserId: string; // 发起邀约的人
  toUserId: string; // 被邀约的人
  fromSkill: string; // 我想学的技能名（对方教）
  toSkill: string; // 我教的技能名（作为交换条件）
  message: string;
  status: SwapStatus;
  createdAt: number;
  scheduledAt: number | null; // 约定时间
  timeline: SwapTimelineEvent[];
  ratings: Rating[]; // 双方互评
}

export type NotificationType =
  | "swap_invite" // 收到交换邀约
  | "swap_accepted" // 邀约被接受
  | "swap_declined" // 邀约被拒绝
  | "swap_completed" // 交换完成
  | "badge_unlocked" // 解锁成就
  | "system"; // 系统通知

export interface Notification {
  id: string;
  userId: string; // 归属用户
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  link?: string; // 可跳转的页面路径
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string; // 图标（emoji 或符号）
  color: "sage" | "blush" | "oat" | "primary";
}

export interface AppState {
  currentUserId: string | null;
  users: UserProfile[];
  swaps: SwapRequest[];
  notifications: Notification[];
}

// ---------- 技能标签库 ----------
export const SKILL_TAGS = [
  "简历撰写",
  "面试模拟",
  "PPT 制作",
  "Excel 数据处理",
  "视频剪辑",
  "英语口语",
  "前端开发",
  "Python 编程",
  "产品设计",
  "数据分析",
  "公众号运营",
  "摄影修图",
  "时间管理",
  "演讲表达",
  "求职规划",
  "作品集打磨",
];

// ---------- 成就徽章库 ----------
export const BADGES: Badge[] = [
  { id: "first_swap", name: "初次互换", desc: "完成第一次技能交换", icon: "🌱", color: "sage" },
  { id: "streak_3", name: "三连胜", desc: "连胜达到 3 次", icon: "🔥", color: "oat" },
  { id: "streak_7", name: "七连胜", desc: "连胜达到 7 次", icon: "⚡", color: "primary" },
  { id: "swap_5", name: "交换达人", desc: "累计完成 5 次交换", icon: "🤝", color: "blush" },
  { id: "swap_10", name: "交换大师", desc: "累计完成 10 次交换", icon: "🏆", color: "primary" },
  { id: "credit_full", name: "满分信誉", desc: "信用分保持 100 分", icon: "💎", color: "blush" },
  { id: "teach_3", name: "授人以渔", desc: "发布 3 个可教的技能", icon: "🎓", color: "sage" },
];

// ---------- 种子用户（冷启动 mock 供给） ----------
let seedCounter = 0;
function sid() {
  seedCounter += 1;
  return `s_seed_${seedCounter}`;
}

function seedUsers(): UserProfile[] {
  const now = Date.now();
  return [
    {
      id: "u_lin",
      name: "林同学",
      bio: "新闻专业大三，秋招备战中，想补齐数据硬技能。",
      skills: [
        { id: sid(), name: "公众号运营", kind: "teach", level: "精通", createdAt: 0 },
        { id: sid(), name: "视频剪辑", kind: "teach", level: "熟练", createdAt: 0 },
        { id: sid(), name: "摄影修图", kind: "teach", level: "熟练", createdAt: 0 },
        { id: sid(), name: "数据分析", kind: "learn", level: "想学", createdAt: 0 },
        { id: sid(), name: "Excel 数据处理", kind: "learn", level: "想学", createdAt: 0 },
      ],
      streak: 3,
      completedSwaps: 5,
      credit: 96,
      earnedBadges: ["first_swap", "swap_5", "streak_3"],
      createdAt: 0,
    },
    {
      id: "u_chen",
      name: "陈同学",
      bio: "计算机大四，想转产品方向，技术是强项。",
      skills: [
        { id: sid(), name: "前端开发", kind: "teach", level: "精通", createdAt: 0 },
        { id: sid(), name: "Python 编程", kind: "teach", level: "熟练", createdAt: 0 },
        { id: sid(), name: "数据分析", kind: "teach", level: "熟练", createdAt: 0 },
        { id: sid(), name: "产品设计", kind: "learn", level: "想学", createdAt: 0 },
        { id: sid(), name: "PPT 制作", kind: "learn", level: "想学", createdAt: 0 },
        { id: sid(), name: "求职规划", kind: "learn", level: "想学", createdAt: 0 },
      ],
      streak: 7,
      completedSwaps: 12,
      credit: 100,
      earnedBadges: ["first_swap", "streak_3", "streak_7", "swap_5", "swap_10", "credit_full", "teach_3"],
      createdAt: 0,
    },
    {
      id: "u_wang",
      name: "王同学",
      bio: "设计专业，求职方向 UI/产品，审美在线。",
      skills: [
        { id: sid(), name: "产品设计", kind: "teach", level: "精通", createdAt: 0 },
        { id: sid(), name: "PPT 制作", kind: "teach", level: "熟练", createdAt: 0 },
        { id: sid(), name: "作品集打磨", kind: "teach", level: "精通", createdAt: 0 },
        { id: sid(), name: "前端开发", kind: "learn", level: "想学", createdAt: 0 },
        { id: sid(), name: "英语口语", kind: "learn", level: "想学", createdAt: 0 },
      ],
      streak: 2,
      completedSwaps: 3,
      credit: 90,
      earnedBadges: ["first_swap"],
      createdAt: 0,
    },
    {
      id: "u_zhao",
      name: "赵同学",
      bio: "经管专业，想补充编程硬技能。",
      skills: [
        { id: sid(), name: "数据分析", kind: "teach", level: "熟练", createdAt: 0 },
        { id: sid(), name: "Excel 数据处理", kind: "teach", level: "精通", createdAt: 0 },
        { id: sid(), name: "求职规划", kind: "teach", level: "熟练", createdAt: 0 },
        { id: sid(), name: "Python 编程", kind: "learn", level: "想学", createdAt: 0 },
        { id: sid(), name: "时间管理", kind: "learn", level: "想学", createdAt: 0 },
      ],
      streak: 1,
      completedSwaps: 2,
      credit: 85,
      earnedBadges: ["first_swap"],
      createdAt: 0,
    },
    {
      id: "u_zhou",
      name: "周同学",
      bio: "外语专业，雅思 7.5，口语是看家本领。",
      skills: [
        { id: sid(), name: "英语口语", kind: "teach", level: "精通", createdAt: 0 },
        { id: sid(), name: "演讲表达", kind: "teach", level: "熟练", createdAt: 0 },
        { id: sid(), name: "面试模拟", kind: "teach", level: "熟练", createdAt: 0 },
        { id: sid(), name: "视频剪辑", kind: "learn", level: "想学", createdAt: 0 },
        { id: sid(), name: "公众号运营", kind: "learn", level: "想学", createdAt: 0 },
      ],
      streak: 4,
      completedSwaps: 6,
      credit: 98,
      earnedBadges: ["first_swap", "streak_3", "swap_5"],
      createdAt: 0,
    },
    {
      id: "u_wu",
      name: "吴同学",
      bio: "人力资源方向，擅长时间管理与求职方法论。",
      skills: [
        { id: sid(), name: "时间管理", kind: "teach", level: "精通", createdAt: 0 },
        { id: sid(), name: "简历撰写", kind: "teach", level: "精通", createdAt: 0 },
        { id: sid(), name: "求职规划", kind: "teach", level: "精通", createdAt: 0 },
        { id: sid(), name: "演讲表达", kind: "learn", level: "想学", createdAt: 0 },
      ],
      streak: 0,
      completedSwaps: 0,
      credit: 100,
      earnedBadges: [],
      createdAt: 0,
    },
  ];
}

// ---------- 预置不同状态的交换记录 ----------
function seedSwaps(): SwapRequest[] {
  const now = Date.now();
  const d = (hours: number) => now - hours * 3600 * 1000;
  return [
    // 林同学 → 陈同学：已完成并互评（历史闭环示例）
    {
      id: "r_seed_1",
      fromUserId: "u_lin",
      toUserId: "u_chen",
      fromSkill: "数据分析",
      toSkill: "公众号运营",
      message: "想学你的数据分析，我可以教你公众号运营，方便约个时间吗？",
      status: "completed",
      createdAt: d(72),
      scheduledAt: d(48),
      timeline: [
        { at: d(72), type: "created", text: "林同学发起邀约" },
        { at: d(70), type: "accepted", text: "陈同学接受邀约" },
        { at: d(68), type: "scheduled", text: "约定时间：2 天后 20:00" },
        { at: d(48), type: "started", text: "交换开始" },
        { at: d(47), type: "completed", text: "交换完成" },
        { at: d(46), type: "rated", text: "双方完成互评" },
      ],
      ratings: [
        { fromUserId: "u_lin", score: 5, comment: "陈同学讲得很清晰，收获很大！", at: d(46) },
        { fromUserId: "u_chen", score: 5, comment: "公众号运营思路很专业，谢谢！", at: d(45) },
      ],
    },
    // 王同学 → 当前可能用户（占位）的进行中示例：用 王→陈 进行中
    {
      id: "r_seed_2",
      fromUserId: "u_wang",
      toUserId: "u_chen",
      fromSkill: "产品设计",
      toSkill: "前端开发",
      message: "想跟你换产品设计和前端开发，互相补短板！",
      status: "ongoing",
      createdAt: d(30),
      scheduledAt: d(10),
      timeline: [
        { at: d(30), type: "created", text: "王同学发起邀约" },
        { at: d(28), type: "accepted", text: "陈同学接受邀约" },
        { at: d(26), type: "scheduled", text: "约定时间：今天上午 10:00" },
        { at: d(10), type: "started", text: "交换进行中" },
      ],
      ratings: [],
    },
    // 周同学 → 陈同学：已确认待排期
    {
      id: "r_seed_3",
      fromUserId: "u_zhou",
      toUserId: "u_chen",
      fromSkill: "英语口语",
      toSkill: "Python 编程",
      message: "口语换编程，成交吗？",
      status: "confirmed",
      createdAt: d(20),
      scheduledAt: null,
      timeline: [
        { at: d(20), type: "created", text: "周同学发起邀约" },
        { at: d(18), type: "accepted", text: "陈同学接受邀约" },
      ],
      ratings: [],
    },
    // 陈同学 → 林同学：待处理（林同学视角的待办）
    {
      id: "r_seed_4",
      fromUserId: "u_chen",
      toUserId: "u_lin",
      fromSkill: "产品设计",
      toSkill: "数据分析",
      message: "想学产品设计，我教你数据分析，可以吗？",
      status: "pending",
      createdAt: d(6),
      scheduledAt: null,
      timeline: [{ at: d(6), type: "created", text: "陈同学发起邀约" }],
      ratings: [],
    },
  ];
}

// ---------- 预置通知 ----------
function seedNotifications(): Notification[] {
  const now = Date.now();
  const d = (hours: number) => now - hours * 3600 * 1000;
  return [
    {
      id: "n_seed_1",
      userId: "u_lin",
      type: "swap_invite",
      title: "新的交换邀约",
      body: "陈同学想学你的「产品设计」，愿用「数据分析」交换。",
      read: false,
      createdAt: d(6),
      link: "/swaps",
    },
    {
      id: "n_seed_2",
      userId: "u_lin",
      type: "swap_completed",
      title: "交换已完成",
      body: "你与陈同学的「数据分析 ↔ 公众号运营」交换已完成，记得去互评哦。",
      read: false,
      createdAt: d(47),
      link: "/swaps",
    },
    {
      id: "n_seed_3",
      userId: "u_lin",
      type: "badge_unlocked",
      title: "解锁成就",
      body: "恭喜解锁「交换达人」成就！",
      read: true,
      createdAt: d(50),
      link: "/me",
    },
    {
      id: "n_seed_4",
      userId: "u_lin",
      type: "system",
      title: "欢迎来到 SkillSwap",
      body: "发布你能教的、标记你想学的，开始你的第一场技能交换吧。",
      read: true,
      createdAt: d(120),
    },
  ];
}

const STORAGE_KEY = "skillswap_state_v2";

function loadState(): AppState {
  if (typeof window === "undefined") {
    return {
      currentUserId: null,
      users: seedUsers(),
      swaps: seedSwaps(),
      notifications: seedNotifications(),
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  const fresh: AppState = {
    currentUserId: null,
    users: seedUsers(),
    swaps: seedSwaps(),
    notifications: seedNotifications(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

let state: AppState = loadState();

// 写操作后触发通知（由 useStore 注册的回调消费）
let notifyFn: (() => void) | null = null;
export function setNotifyFn(fn: (() => void) | null) {
  notifyFn = fn;
}

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  notifyFn?.();
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ---------- 基础查询 ----------
export function getState(): AppState {
  return state;
}

export function getCurrentUser(): UserProfile | null {
  if (!state.currentUserId) return null;
  return state.users.find((u) => u.id === state.currentUserId) ?? null;
}

export function userName(id: string): string {
  return state.users.find((u) => u.id === id)?.name ?? "未知用户";
}

export function getUser(id: string): UserProfile | undefined {
  return state.users.find((u) => u.id === id);
}

// ---------- 用户 ----------
export function createUser(name: string, bio: string): UserProfile {
  const user: UserProfile = {
    id: uid("u"),
    name,
    bio,
    skills: [],
    streak: 0,
    completedSwaps: 0,
    credit: 100,
    earnedBadges: [],
    createdAt: Date.now(),
  };
  state.users.push(user);
  state.currentUserId = user.id;
  pushNotification(user.id, "system", "欢迎来到 SkillSwap", "发布你能教的、标记你想学的，开始你的第一场技能交换吧。");
  persist();
  return user;
}

export function switchUser(id: string) {
  state.currentUserId = id;
  persist();
}

export function logout() {
  state.currentUserId = null;
  persist();
}

export function updateUser(patch: Partial<UserProfile>) {
  const me = getCurrentUser();
  if (!me) return;
  Object.assign(me, patch);
  persist();
}

export function resetToSeed() {
  state = {
    currentUserId: null,
    users: seedUsers(),
    swaps: seedSwaps(),
    notifications: seedNotifications(),
  };
  persist();
}

// ---------- 技能 ----------
export function addSkill(kind: SkillKind, name: string, level: SkillLevel) {
  const me = getCurrentUser();
  if (!me) return;
  me.skills.push({ id: uid("s"), name, kind, level, createdAt: Date.now() });
  // 检查成就：授人以渔（教 3 个）
  maybeUnlockBadges(me);
  persist();
}

export function removeSkill(id: string) {
  const me = getCurrentUser();
  if (!me) return;
  me.skills = me.skills.filter((s) => s.id !== id);
  persist();
}

// ---------- 匹配 ----------
export interface MatchResult {
  user: UserProfile;
  matchType: "bidirectional" | "single" | "none";
  matchDetail: {
    theyTeachIWant: string[]; // 对方教的正是我想学的
    iTeachTheyWant: string[]; // 我教的正是他想学的
  };
}

/**
 * 计算某用户与当前用户的匹配关系
 * bidirectional：互相满足；single：单向满足
 */
export function computeMatch(other: UserProfile, me: UserProfile | null): MatchResult {
  const empty = { theyTeachIWant: [] as string[], iTeachTheyWant: [] as string[] };
  if (!me) return { user: other, matchType: "none", matchDetail: empty };
  const myLearn = new Set(me.skills.filter((s) => s.kind === "learn").map((s) => s.name));
  const myTeach = new Set(me.skills.filter((s) => s.kind === "teach").map((s) => s.name));
  const theirTeach = new Set(other.skills.filter((s) => s.kind === "teach").map((s) => s.name));
  const theirLearn = new Set(other.skills.filter((s) => s.kind === "learn").map((s) => s.name));

  const theyTeachIWant = [...theirTeach].filter((n) => myLearn.has(n));
  const iTeachTheyWant = [...myTeach].filter((n) => theirLearn.has(n));

  let matchType: MatchResult["matchType"] = "none";
  if (theyTeachIWant.length > 0 && iTeachTheyWant.length > 0) {
    matchType = "bidirectional";
  } else if (theyTeachIWant.length > 0 || iTeachTheyWant.length > 0) {
    matchType = "single";
  }

  return { user: other, matchType, matchDetail: { theyTeachIWant, iTeachTheyWant } };
}

export function listOtherUsers(): UserProfile[] {
  return state.users.filter((u) => u.id !== state.currentUserId);
}

// ---------- 交换邀约与状态流转 ----------
export function createSwapRequest(
  toUserId: string,
  fromSkill: string,
  toSkill: string,
  message: string,
): SwapRequest | null {
  const me = getCurrentUser();
  if (!me) return null;
  const req: SwapRequest = {
    id: uid("r"),
    fromUserId: me.id,
    toUserId,
    fromSkill,
    toSkill,
    message,
    status: "pending",
    createdAt: Date.now(),
    scheduledAt: null,
    timeline: [{ at: Date.now(), type: "created", text: `${me.name}发起邀约` }],
    ratings: [],
  };
  state.swaps.push(req);
  // 通知对方
  const other = getUser(toUserId);
  pushNotification(
    toUserId,
    "swap_invite",
    "新的交换邀约",
    `${me.name}想学你的「${fromSkill}」${toSkill ? `，愿用「${toSkill}」交换` : ""}。`,
    "/swaps",
  );
  persist();
  return req;
}

/** 接受邀约 → confirmed */
export function acceptSwap(id: string) {
  const req = state.swaps.find((r) => r.id === id);
  if (!req || req.status !== "pending") return;
  req.status = "confirmed";
  req.timeline.push({ at: Date.now(), type: "accepted", text: "对方接受邀约" });
  pushNotification(
    req.fromUserId,
    "swap_accepted",
    "邀约已被接受",
    `${userName(req.toUserId)}接受了你的交换邀约，快去约定时间吧。`,
    "/swaps",
  );
  persist();
}

/** 拒绝邀约 → declined */
export function declineSwap(id: string) {
  const req = state.swaps.find((r) => r.id === id);
  if (!req || req.status !== "pending") return;
  req.status = "declined";
  req.timeline.push({ at: Date.now(), type: "declined", text: "对方拒绝邀约" });
  pushNotification(
    req.fromUserId,
    "swap_declined",
    "邀约被拒绝",
    `${userName(req.toUserId)}暂时无法参与这次交换。`,
    "/swaps",
  );
  persist();
}

/** 约定时间 → scheduled */
export function scheduleSwap(id: string, at: number) {
  const req = state.swaps.find((r) => r.id === id);
  if (!req || (req.status !== "confirmed" && req.status !== "scheduled")) return;
  req.scheduledAt = at;
  req.status = "scheduled";
  const timeText = new Date(at).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  req.timeline.push({ at: Date.now(), type: "scheduled", text: `约定时间：${timeText}` });
  persist();
}

/** 开始交换 → ongoing */
export function startSwap(id: string) {
  const req = state.swaps.find((r) => r.id === id);
  if (!req || (req.status !== "scheduled" && req.status !== "confirmed")) return;
  req.status = "ongoing";
  req.timeline.push({ at: Date.now(), type: "started", text: "交换开始" });
  persist();
}

/** 完成交换 → completed，双方交换数 +1、连胜 +1，并触发成就 */
export function completeSwap(id: string) {
  const req = state.swaps.find((r) => r.id === id);
  if (!req || req.status !== "ongoing") return;
  req.status = "completed";
  req.timeline.push({ at: Date.now(), type: "completed", text: "交换完成" });
  for (const u of state.users) {
    if (u.id === req.fromUserId || u.id === req.toUserId) {
      u.streak += 1;
      u.completedSwaps += 1;
      maybeUnlockBadges(u);
    }
  }
  // 通知双方互评
  for (const uid of [req.fromUserId, req.toUserId]) {
    pushNotification(
      uid,
      "swap_completed",
      "交换已完成",
      `你与 ${userName(uid === req.fromUserId ? req.toUserId : req.fromUserId)} 的「${req.fromSkill}」交换已完成，去给对方评分吧。`,
      "/swaps",
    );
  }
  persist();
}

/** 取消交换 → cancelled */
export function cancelSwap(id: string) {
  const req = state.swaps.find((r) => r.id === id);
  if (!req) return;
  if (req.status === "completed" || req.status === "cancelled" || req.status === "declined") return;
  req.status = "cancelled";
  req.timeline.push({ at: Date.now(), type: "cancelled", text: "交换已取消" });
  persist();
}

/** 互评（影响信用分：5 星 +3，4 星 +1，3 星 0，1-2 星 -2） */
export function rateSwap(id: string, score: 1 | 2 | 3 | 4 | 5, comment: string) {
  const req = state.swaps.find((r) => r.id === id);
  const me = getCurrentUser();
  if (!req || !me || req.status !== "completed") return;
  // 不允许重复评
  if (req.ratings.some((r) => r.fromUserId === me.id)) return;
  req.ratings.push({ fromUserId: me.id, score, comment, at: Date.now() });
  req.timeline.push({ at: Date.now(), type: "rated", text: `${me.name}完成评分` });

  // 信用分调整作用于「被评人」（交换的对方）
  const otherId = me.id === req.fromUserId ? req.toUserId : req.fromUserId;
  const other = getUser(otherId);
  if (other) {
    const delta = score === 5 ? 3 : score === 4 ? 1 : score === 3 ? 0 : -2;
    other.credit = Math.max(0, Math.min(100, other.credit + delta));
    maybeUnlockBadges(other);
  }
  persist();
}

// ---------- 成就 ----------
function maybeUnlockBadges(user: UserProfile) {
  const unlocked = new Set(user.earnedBadges);
  const check = (id: string, cond: boolean) => {
    if (cond && !unlocked.has(id)) {
      user.earnedBadges.push(id);
      pushNotification(
        user.id,
        "badge_unlocked",
        "解锁成就",
        `恭喜解锁「${BADGES.find((b) => b.id === id)?.name}」成就！`,
        "/me",
      );
    }
  };
  const teachCount = user.skills.filter((s) => s.kind === "teach").length;
  check("first_swap", user.completedSwaps >= 1);
  check("swap_5", user.completedSwaps >= 5);
  check("swap_10", user.completedSwaps >= 10);
  check("streak_3", user.streak >= 3);
  check("streak_7", user.streak >= 7);
  check("credit_full", user.credit >= 100);
  check("teach_3", teachCount >= 3);
}

// ---------- 通知 ----------
function pushNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string,
) {
  state.notifications.unshift({
    id: uid("n"),
    userId,
    type,
    title,
    body,
    read: false,
    createdAt: Date.now(),
    link,
  });
}

export function listMyNotifications(): Notification[] {
  const me = getCurrentUser();
  if (!me) return [];
  return state.notifications
    .filter((n) => n.userId === me.id)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function unreadCount(): number {
  const me = getCurrentUser();
  if (!me) return 0;
  return state.notifications.filter((n) => n.userId === me.id && !n.read).length;
}

export function markNotificationRead(id: string) {
  const n = state.notifications.find((x) => x.id === id);
  if (n) n.read = true;
  persist();
}

export function markAllRead() {
  const me = getCurrentUser();
  if (!me) return;
  state.notifications.forEach((n) => {
    if (n.userId === me.id) n.read = true;
  });
  persist();
}

// ---------- 交换记录查询 ----------
export function listMySwaps(): SwapRequest[] {
  const me = getCurrentUser();
  if (!me) return [];
  return state.swaps
    .filter((r) => r.fromUserId === me.id || r.toUserId === me.id)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getSwap(id: string): SwapRequest | undefined {
  return state.swaps.find((r) => r.id === id);
}

/** 当前用户视角下的「待办」：作为接收方待确认，或作为发起方/接收方待排期/待开始 */
export function listMyIncomingPending(): SwapRequest[] {
  const me = getCurrentUser();
  if (!me) return [];
  return state.swaps.filter((r) => r.toUserId === me.id && r.status === "pending");
}

export function listMyActive(): SwapRequest[] {
  const me = getCurrentUser();
  if (!me) return [];
  return state.swaps.filter(
    (r) =>
      (r.fromUserId === me.id || r.toUserId === me.id) &&
      (r.status === "confirmed" || r.status === "scheduled" || r.status === "ongoing"),
  );
}
