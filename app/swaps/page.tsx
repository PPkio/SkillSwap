import AppNav from "@/components/AppNav";
import Swaps from "@/components/Swaps";

export default function SwapsPage() {
  return (
    <div className="min-h-screen">
      <AppNav />

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-32 sm:pt-24">
        <header className="card-layer relative overflow-hidden rounded-3xl p-10 sm:p-14">
          <div
            className="breathe pointer-events-none absolute -top-14 -right-14 h-52 w-52 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #c9b892 0%, transparent 70%)" }}
          />
          <div className="relative">
            <p className="hand text-sm text-oat">每一场交换，都是彼此成就</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              交换中心
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed font-light text-ash">
              从邀约、排期到完成互评，全程管理你的技能交换。接受邀约后，约定时间、开始交换、完成并互评。
            </p>
          </div>
        </header>

        <Swaps />
      </section>
    </div>
  );
}
