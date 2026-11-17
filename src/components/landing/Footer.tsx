export default function Footer() {
  return <footer className="border-t border-white/10 px-6 py-8"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 text-xs text-white/35 sm:flex-row"><span className="font-display text-sm font-semibold text-white/70">Foundry<span className="text-[#ed8c65]">.</span></span><span>Campus venture studio · {new Date().getFullYear()}</span><span>Built for the next signal.</span></div></footer>;
}
