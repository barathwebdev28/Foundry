export default function About() {
  return (
    <section id="about" className="border-t border-white/10 px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ed8c65]">01 / The premise</p>
        <div>
          <h2 className="max-w-4xl font-display text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl">Ideas need room, pressure, and people who take them seriously.</h2>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/50">Foundry brings workspace, mentorship, capital, and a sharp community into one focused path for student founders.</p>
        </div>
      </div>
    </section>
  );
}
