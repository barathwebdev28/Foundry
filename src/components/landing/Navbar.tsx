import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import SignOutButton from "@/components/portal/SignOutButton";

const NAV_LINKS = [
  { label: "Programs", href: "#programs" },
  { label: "Startups", href: "#startups" },
  { label: "About", href: "#about" },
];

export default async function Navbar() {
  const user = await getCurrentUser();
  const workspaceHref = user?.role === "admin" ? "/admin" : user?.role === "investor" ? "/investor" : "/founder";
  const workspaceLabel = user?.role === "admin" ? "Admin" : user?.role === "investor" ? "Investor" : "Founder";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#090a0a]/75 backdrop-blur-2xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-[15px] font-semibold tracking-tight text-white">
          Foundry<span className="text-[#ed8c65]">.</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => <a key={link.href} href={link.href} className="text-[13px] text-white/50 transition hover:text-white">{link.label}</a>)}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <><Link href={workspaceHref} className="text-[13px] font-medium text-white/70 transition hover:text-white">{workspaceLabel}</Link><SignOutButton /></>
          ) : (
            <><Link href="/login" className="text-[13px] font-medium text-white/60 transition hover:text-white">Sign in</Link><Link href="/founder/signup" className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-black transition hover:bg-[#ed8c65]">Start building</Link></>
          )}
        </div>
      </nav>
    </header>
  );
}
