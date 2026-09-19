import AppNav from "@/components/AppNav";
import Plaza from "@/components/Plaza";

export default function PlazaPage() {
  return (
    <div className="min-h-screen">
      <AppNav />

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-32 sm:pt-24">
        <header className="card-layer relative overflow-hidden rounded-3xl p-10 sm:p-14">
          <div
            className="breathe pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #c9a9a4 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #a8b5a0 0%, transparent 70%)" }}
          />
          <div className="relative">
            <p className="hand text-sm text-blush">以教代学，双向免费</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              技能广场
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed font-light text-ash">
              发布「我能教的」与「我想学的」，让系统帮你找到双向匹配的交换对象。
            </p>
          </div>
        </header>

        <Plaza />
      </section>
    </div>
  );
}
