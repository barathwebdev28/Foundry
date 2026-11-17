export default function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 px-6 py-32 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ed8c65]/10 blur-3xl" />
      <div className="relative mx-auto max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ed8c65]">04 / Your move</p><h2 className="mt-6 font-display text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">Make the first move.</h2><p className="mx-auto mt-6 max-w-md text-base leading-7 text-white/50">Bring the idea. We&apos;ll help you find the next step.</p><a href="/founder/signup" className="mt-10 inline-flex rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-[#ed8c65]">Create founder account <span className="ml-2">→</span></a></div>
    </section>
  );
}
