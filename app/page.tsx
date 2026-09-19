import AppNav from "@/components/AppNav";
import Overview from "@/components/Overview";

export default function Home() {
  return (
    <div className="min-h-screen">
      <AppNav />

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-32 sm:pt-24">
        <header className="card-layer relative overflow-hidden rounded-3xl p-10 sm:p-14">
          <div
            className="breathe pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #c9b892 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #aebdcc 0%, transparent 70%)" }}
          />
          <div className="relative">
            <p className="hand text-sm text-oat">技能换技能，一起变强</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              概览
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed font-light text-ash">
              你的技能互换总览——待办、匹配推荐、进行中的交换，一屏掌握。
            </p>
          </div>
        </header>

        <Overview />
      </section>
    </div>
  );
}
