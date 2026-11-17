const PRINCIPLES = [
  { mark: "↗", title: "Make it real", body: "A prototype is a beginning. Feedback is the work." },
  { mark: "◌", title: "Stay close", body: "Build with people, not assumptions about them." },
  { mark: "＋", title: "Keep going", body: "Small, consistent progress compounds into a company." },
];

export default function Startups() {
  return (
    <section id="startups" className="border-t border-white/10 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ed8c65]">03 / The standard</p>
        <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><h2 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl">Built in public.<br />Backed by people.</h2><p className="max-w-sm text-sm leading-6 text-white/45">The best work is curious, useful, and a little unreasonable.</p></div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((principle) => <article key={principle.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-7 transition hover:border-white/25 hover:bg-white/[0.06]"><span className="text-2xl text-[#ed8c65]">{principle.mark}</span><h3 className="mt-16 font-display text-xl font-semibold text-white">{principle.title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{principle.body}</p></article>)}
        </div>
      </div>
    </section>
  );
}
