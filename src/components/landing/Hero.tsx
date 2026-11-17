export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16 text-center">
      <div className="pointer-events-none absolute left-1/2 top-24 size-[28rem] -translate-x-1/2 rounded-full bg-[#8ed8ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute left-[18%] top-[32%] size-24 rounded-full bg-[#ed8c65]/20 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.24em] text-[#ed8c65]">Foundry / Campus venture studio</p>
        <h1 className="relative mt-7 animate-fade-up-delay-1 font-display text-[15vw] font-semibold leading-[0.9] tracking-[-0.07em] text-white sm:text-8xl lg:text-[9.5rem]">
          Build what
          <br />
          matters.
        </h1>
        <p className="mx-auto mt-8 max-w-xl animate-fade-up-delay-1 text-base leading-7 text-white/50 sm:text-lg">
          A focused place for student founders to move from first signal to real company.
        </p>
        <div className="mt-10 flex animate-fade-up-delay-2 flex-wrap items-center justify-center gap-3">
          <a href="/founder/signup" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#ed8c65]">Start an application <span className="ml-2">→</span></a>
          <a href="#programs" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/70 transition hover:border-white/35 hover:text-white">Explore Foundry</a>
        </div>
      </div>
    </section>
  );
}
