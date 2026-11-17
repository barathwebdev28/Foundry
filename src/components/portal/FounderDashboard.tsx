"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, logout } from "@/lib/auth-client";
import { getSubmissions, type Submission } from "@/lib/submissions";

const statusStyles: Record<string, string> = {
  pending: "bg-[#302a1c] text-[#e9c77d]",
  approved: "bg-[#193224] text-[#b9dbbe]",
  rejected: "bg-[#3a1d19] text-[#ffb29a]",
};

export default function FounderDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSession()
      .then((user) => {
        if (user?.role !== "founder") {
          router.replace("/login");
          return;
        }
        return getSubmissions().then(setApplications);
      })
      .catch(() => setError("Your applications could not be loaded."))
      .finally(() => setLoading(false));
  }, [router]);

  async function signOut() {
    await logout();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white">
      <header className="border-b border-white/10 bg-[#101311] px-5 sm:px-8">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold">
            Foundry<span className="text-[#ed8c65]">.</span>
            <span className="ml-3 border-l border-white/15 pl-3 text-sm font-medium text-white/45">
              Founder workspace
            </span>
          </Link>
          <button onClick={signOut} className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/50">
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#ed8c65]">
          Foundry / Founders
        </p>
        <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Your applications
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">
              Follow every application from submission to decision.
            </p>
          </div>
          <Link href="/register" className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#151a17] transition hover:bg-[#ed8c65] focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/50">
            New application <span className="ml-2">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/35">Total applications</p>
            <p className="mt-2 font-display text-3xl font-semibold">{applications.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/35">In review</p>
            <p className="mt-2 font-display text-3xl font-semibold text-[#e9c77d]">{applications.filter((item) => (item.reviewStatus ?? "pending") === "pending").length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/35">Decisions</p>
            <p className="mt-2 font-display text-3xl font-semibold text-[#b9dbbe]">{applications.filter((item) => item.reviewStatus === "approved" || item.reviewStatus === "rejected").length}</p>
          </div>
        </div>

        {error && <p role="alert" className="mt-8 rounded-md border border-[#8f4433] bg-[#3a1d19] px-4 py-3 text-sm text-[#ffb29a]">{error}</p>}

        {loading ? (
          <div className="mt-10 space-y-4" aria-label="Loading applications" aria-busy="true">
            {[1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-semibold">No applications yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">When you are ready, submit your first startup application and track it here.</p>
            <Link href="/register" className="mt-7 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#151a17] transition hover:bg-[#ed8c65] focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/50">Start an application</Link>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {applications.map((application) => {
              const status = application.reviewStatus ?? "pending";
              return (
                <article key={application.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/20 hover:bg-white/[0.055] sm:p-8">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-white/35">Application</p>
                      <h2 className="mt-2 font-display text-2xl font-semibold">{application.startupName}</h2>
                      <p className="mt-2 text-sm text-white/45">Submitted {new Date(application.submittedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[status] ?? statusStyles.pending}`}>
                      {status}
                    </span>
                  </div>

                  <p className="mt-6 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-white/65">{application.overview}</p>

                  <div className="mt-7 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3" aria-label={`Application status: ${status}`}>
                    <div className="relative text-[#ed8c65]">
                      <p className="text-xs font-semibold uppercase tracking-wide">01</p>
                      <p className="mt-1 text-sm">Submitted</p>
                    </div>
                    <div className={status === "pending" ? "text-[#ed8c65]" : "text-white/50"}>
                      <p className="text-xs font-semibold uppercase tracking-wide">02</p>
                      <p className="mt-1 text-sm">Under review</p>
                    </div>
                    <div className={status === "approved" || status === "rejected" ? "text-[#ed8c65]" : "text-white/25"}>
                      <p className="text-xs font-semibold uppercase tracking-wide">03</p>
                      <p className="mt-1 text-sm">Decision recorded</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
