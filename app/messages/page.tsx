import AppNav from "@/components/AppNav";
import Messages from "@/components/Messages";

export default function MessagesPage() {
  return (
    <div className="min-h-screen">
      <AppNav />

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-32 sm:pt-24">
        <header className="card-layer relative overflow-hidden rounded-3xl p-10 sm:p-14">
          <div
            className="breathe pointer-events-none absolute -top-14 -right-14 h-52 w-52 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #c9a9a4 0%, transparent 70%)" }}
          />
          <div className="relative">
            <p className="hand text-sm text-blush">每一份心意，都及时抵达</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              消息
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed font-light text-ash">
              交换邀约、交换动态、成就解锁，所有重要通知都在这里。
            </p>
          </div>
        </header>

        <Messages />
      </section>
    </div>
  );
}
