"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { saveSubmission, type SubmissionFile } from "@/lib/submissions";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const inputClass = "mt-2 w-full rounded-lg border border-white/12 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#ed8c65] focus:ring-2 focus:ring-[#ed8c65]/20";

export default function ApplicationForm() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [teamMembers, setTeamMembers] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    const additions = Array.from(selected);
    const tooLarge = additions.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) { setError(`${tooLarge.name} is larger than 25 MB.`); return; }
    setError("");
    setFiles((current) => {
      const merged = [...current, ...additions].filter((file, index, all) => all.findIndex((candidate) => candidate.name === file.name && candidate.size === file.size) === index);
      if (merged.length > MAX_FILES) { setError(`You can attach up to ${MAX_FILES} files.`); return current; }
      return merged;
    });
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSaving(true);
    const form = new FormData(event.currentTarget);
    const uploads: SubmissionFile[] = files.map((file) => ({ id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, blob: file }));
    try {
      await saveSubmission({ name: String(form.get("name")).trim(), email: String(form.get("email")).trim(), startupName: String(form.get("startupName")).trim(), overview: String(form.get("overview")).trim(), teamMembers: teamMembers.map((member) => member.trim()).filter(Boolean), files: uploads });
      setSaved(true); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { setError("Your application could not be saved. Please try again."); } finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen bg-[#090a0a] px-5 pb-20 pt-6 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-5"><Link href="/" className="font-display text-lg font-semibold">Foundry<span className="text-[#ed8c65]">.</span></Link><Link href="/login" className="text-sm text-white/45 transition hover:text-white">Sign in</Link></header>
        {saved ? (
          <section className="mx-auto max-w-2xl py-28 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-[#193224] text-2xl text-[#b9dbbe]">✓</div><p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#ed8c65]">Application received</p><h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">You&apos;re in motion.</h1><p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/50">Your application is now in review. Track its progress from your founder workspace.</p><Link href="/founder" className="mt-9 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-[#ed8c65]">View application status <span className="ml-2">→</span></Link></section>
        ) : (
          <div className="grid gap-14 py-14 lg:grid-cols-[0.72fr_1.28fr] lg:py-20">
            <aside className="lg:sticky lg:top-10 lg:h-fit"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ed8c65]">Foundry / Application</p><h1 className="mt-6 max-w-lg font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-7xl">Give the idea a name.</h1><p className="mt-6 max-w-md text-base leading-7 text-white/45">Tell us what you&apos;re building, who&apos;s building it, and what you&apos;ve learned so far.</p><div className="mt-10 border-t border-white/10 pt-5 text-sm text-white/40"><span className="text-white">01</span><span className="mx-3 text-white/20">/</span>Founder details<span className="mx-3 text-white/20">→</span><span className="text-white">02</span><span className="mx-3 text-white/20">/</span>Team and work</div></aside>
            <form onSubmit={handleSubmit} className="space-y-12">
              <section className="border-t border-white/20 pt-5"><div className="mb-7 flex items-baseline justify-between"><h2 className="font-display text-2xl font-semibold">Founder details</h2><span className="text-xs text-white/35">Required *</span></div><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium">Your name *<input required name="name" autoComplete="name" placeholder="Full name" className={inputClass} /></label><label className="text-sm font-medium">Email address *<input required type="email" name="email" autoComplete="email" placeholder="you@example.com" className={inputClass} /></label><label className="text-sm font-medium sm:col-span-2">Startup name *<input required name="startupName" placeholder="What do you call it?" className={inputClass} /></label><label className="text-sm font-medium sm:col-span-2">What are you building? *<textarea required name="overview" rows={5} placeholder="The problem, your approach, and what you know so far..." className={`${inputClass} resize-y leading-6`} /></label></div></section>
              <section className="border-t border-white/20 pt-5"><div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-display text-2xl font-semibold">Your team</h2><p className="mt-1 text-sm text-white/40">Add collaborators if you have them.</p></div><button type="button" onClick={() => setTeamMembers((current) => [...current, ""])} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10">+ Add person</button></div><div className="space-y-3">{teamMembers.map((member, index) => <div key={index} className="flex items-center gap-3"><span className="w-7 text-xs text-white/30">{String(index + 1).padStart(2, "0")}</span><input value={member} onChange={(event) => setTeamMembers((current) => current.map((name, memberIndex) => memberIndex === index ? event.target.value : name))} aria-label={`Team member ${index + 1}`} placeholder="Full name" className={inputClass} />{teamMembers.length > 1 && <button type="button" aria-label={`Remove team member ${index + 1}`} onClick={() => setTeamMembers((current) => current.filter((_, memberIndex) => memberIndex !== index))} className="px-2 text-lg text-white/35 hover:text-[#ed8c65]">×</button>}</div>)}</div></section>
              <section className="border-t border-white/20 pt-5"><h2 className="font-display text-2xl font-semibold">Supporting work</h2><p className="mt-1 text-sm text-white/40">Decks, prototypes, plans, or anything useful.</p><button type="button" onClick={() => fileInput.current?.click()} className="mt-6 flex min-h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.03] px-5 text-center transition hover:border-[#ed8c65] hover:bg-white/[0.06]"><span className="text-sm font-semibold">Choose files</span><span className="mt-2 text-xs text-white/35">Up to {MAX_FILES} files · 25 MB each</span></button><input ref={fileInput} type="file" multiple className="sr-only" onChange={(event) => addFiles(event.target.files)} />{files.length > 0 && <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">{files.map((file, index) => <li key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="min-w-0 truncate">{file.name}<span className="ml-2 text-xs text-white/35">{(file.size / 1024 / 1024).toFixed(1)} MB</span></span><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="text-xs font-semibold text-white/45 hover:text-[#ed8c65]">Remove</button></li>)}</ul>}</section>
              {error && <p role="alert" aria-live="polite" className="rounded-lg border border-[#8f4433] bg-[#3a1d19] px-4 py-3 text-sm text-[#ffb29a]">{error}</p>}
              <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xs text-xs leading-5 text-white/35">Your application is private and visible only to the Foundry review team.</p><button disabled={saving} className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-[#ed8c65] disabled:cursor-wait disabled:opacity-50">{saving ? "Submitting..." : "Submit application"}<span className="ml-3">→</span></button></div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
