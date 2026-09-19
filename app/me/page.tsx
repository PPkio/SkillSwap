import AppNav from "@/components/AppNav";
import ProfilePanel from "@/components/ProfilePanel";

export default function MePage() {
  return (
    <div className="min-h-screen">
      <AppNav />

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-32 sm:pt-24">
        <header className="card-layer relative overflow-hidden rounded-3xl p-10 sm:p-14">
          <div
            className="breathe pointer-events-none absolute -top-14 -right-14 h-52 w-52 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #a8b5a0 0%, transparent 70%)" }}
          />
          <div className="relative">
            <p className="hand text-sm text-sage">你的技能，值得被看见</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              我的
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed font-light text-ash">
              管理你的身份与技能，查看成就徽章。发布你能教的、标注你想学的，让别人能准确找到你。
            </p>
          </div>
        </header>

        <ProfilePanel />
      </section>
    </div>
  );
}
