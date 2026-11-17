"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSession, logout } from "@/lib/auth-client";
import { getSubmissions, updateSubmission, type Submission } from "@/lib/submissions";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function InvestorDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fundingId, setFundingId] = useState("");

  useEffect(() => {
    let active = true;
    getSession()
      .then((user) => {
        if (user?.role !== "investor") {
          router.replace("/login");
          return;
        }
        return getSubmissions().then((items) => active && setSubmissions(items));
      })
      .catch(() => active && setError("Approved startups could not be loaded."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [router]);

  const approved = useMemo(() => submissions.filter((item) => item.reviewStatus === "approved"), [submissions]);
  const totalFunded = approved.reduce((total, startup) => total + Number(startup.fundingReceived ?? 0), 0);

  async function signOut() {
    await logout();
    router.replace("/login");
  }

  async function provideFunding(startup: Submission) {
    const amount = Number(amounts[startup.id]);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a funding amount greater than zero.");
      setSuccess("");
      return;
    }
    setFundingId(startup.id);
    setError("");
    setSuccess("");
    try {
      await updateSubmission(startup.id, { fundingAmount: amount });
      const fundingReceived = Number(startup.fundingReceived ?? 0) + amount;
      setSubmissions((current) => current.map((item) => item.id === startup.id ? { ...item, fundingReceived } : item));
      setAmounts((current) => ({ ...current, [startup.id]: "" }));
      setSuccess(`Your support for ${startup.startupName} was recorded.`);
    } catch {
      setError("Funding could not be recorded. Please try again.");
    } finally {
      setFundingId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white">
      <header className="border-b border-white/10 bg-[#101311] px-5 sm:px-8">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold">Foundry<span className="text-[#ed8c65]">.</span><span className="ml-3 border-l border-white/15 pl-3 text-sm font-medium text-white/45">Investor workspace</span></Link>
          <button type="button" onClick={signOut} className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/50">Sign out</button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#ed8c65]">Foundry / Investors</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Ideas worth backing</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">Explore approved startups and record your support.</p>
          </div>
          <div className="rounded-xl border border-[#ed8c65]/25 bg-[#ed8c65]/[0.07] px-6 py-4 shadow-[0_0_40px_rgba(237,140,101,0.06)] sm:min-w-48">
            <p className="text-xs uppercase tracking-[0.14em] text-white/35">Funds provided</p>
            <p className="mt-2 font-display text-3xl font-semibold">{currency.format(totalFunded)}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/45">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{approved.length} approved startups</span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">Funding updates are instant</span>
        </div>

        <div className="mt-8 rounded-lg border border-[#8c624f]/40 bg-[#291b16] px-4 py-3 text-xs leading-5 text-[#f3b49d]" role="note">Funding actions are stored securely in Neon.</div>
        {error && <p role="alert" aria-live="polite" className="mt-4 rounded-lg border border-[#8f4433] bg-[#3a1d19] px-4 py-3 text-sm text-[#ffb29a]">{error}</p>}
        {success && <p role="status" aria-live="polite" className="mt-4 rounded-lg border border-[#44614a] bg-[#17261b] px-4 py-3 text-sm text-[#b9dbbe]">{success}</p>}

        {loading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2" aria-label="Loading approved startups" aria-busy="true">
            {[1, 2].map((item) => <div key={item} className="h-80 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />)}
          </div>
        ) : approved.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center">
            <p className="font-display text-2xl font-semibold">No approved startups yet</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">Approved applications will appear here when the Foundry team makes a decision.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {approved.map((startup) => (
              <article key={startup.id} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-0.5 hover:border-[#ed8c65]/35 hover:bg-white/[0.055] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ed8c65]">Foundry approved</p><h2 className="mt-2 font-display text-2xl font-semibold">{startup.startupName}</h2></div>
                  <span className="rounded-full bg-[#193224] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#b9dbbe]">Open to funding</span>
                </div>
                <p className="mt-5 flex-1 whitespace-pre-wrap text-sm leading-7 text-white/65">{startup.overview}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm"><span className="text-white/45">Founded by <strong className="font-medium text-white/80">{startup.name}</strong></span><span className="font-semibold text-white/80">{currency.format(Number(startup.fundingReceived ?? 0))} raised</span></div>
                <p className="mt-2 text-xs text-white/35">Team: {startup.teamMembers.length ? startup.teamMembers.join(", ") : "Founder-led"}</p>
                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-end">
                  <label className="flex-1 text-xs font-semibold uppercase tracking-wide text-white/45">Funding amount (USD)
                    <input type="number" min="1" step="1" value={amounts[startup.id] ?? ""} onChange={(event) => setAmounts((current) => ({ ...current, [startup.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") provideFunding(startup); }} placeholder="e.g. 500" aria-label={`Funding amount for ${startup.startupName}`} className="mt-2 w-full rounded-md border border-white/15 bg-black/20 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#ed8c65] focus:ring-2 focus:ring-[#ed8c65]/20" />
                  </label>
                  <button type="button" disabled={fundingId === startup.id} onClick={() => provideFunding(startup)} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#151a17] transition hover:bg-[#ed8c65] focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/50 disabled:cursor-wait disabled:opacity-50">{fundingId === startup.id ? "Recording..." : "Provide funds"}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
