const PROGRAMS = [
  { index: "01", title: "Clarify", description: "Turn a strong hunch into a problem worth solving." },
  { index: "02", title: "Build", description: "Work alongside mentors, peers, and early users." },
  { index: "03", title: "Launch", description: "Put the product in the world and find the next signal." },
];

export default function Programs() {
  return (
    <section id="programs" className="border-t border-white/10 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ed8c65]">02 / The path</p><h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl">Less noise.<br />More momentum.</h2></div>
          <p className="max-w-sm text-sm leading-6 text-white/45">A simple operating system for going from idea to evidence.</p>
        </div>
        <div className="mt-16 grid border-y border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
          {PROGRAMS.map((program) => <article key={program.index} className="border-b border-white/10 py-8 sm:border-b-0 sm:px-8 sm:first:pl-0 sm:last:pr-0"><p className="text-xs font-semibold tracking-[0.18em] text-[#ed8c65]">{program.index}</p><h3 className="mt-10 font-display text-2xl font-semibold text-white">{program.title}</h3><p className="mt-4 max-w-xs text-sm leading-6 text-white/45">{program.description}</p></article>)}
        </div>
      </div>
    </section>
  );
}
