"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-client";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const role = await login(String(form.get("username")), String(form.get("password")));
      router.push(role === "admin" ? "/admin" : role === "investor" ? "/investor" : "/founder");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Invalid username or password.");
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#090a0a] text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#101311] p-12 lg:flex lg:flex-col lg:justify-between lg:p-16">
        <Link href="/" className="relative z-10 font-display text-lg font-semibold">Foundry<span className="text-[#ed8c65]">.</span></Link>
        <div className="relative z-10 max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ed8c65]">Foundry / Access</p><h1 className="mt-6 font-display text-6xl font-semibold leading-[0.95] tracking-[-0.05em]">Good work<br />finds a way.</h1><p className="mt-7 max-w-sm text-base leading-7 text-white/45">One workspace for founders, reviewers, and the people backing the next idea.</p></div>
        <p className="relative z-10 text-xs tracking-[0.18em] text-white/25">FOUNDRY / 01</p>
        <div aria-hidden="true" className="absolute -bottom-24 -right-24 size-[30rem] rounded-full border border-white/10 blur-[1px]" /><div aria-hidden="true" className="absolute -bottom-8 right-16 size-48 rounded-full bg-[#8ed8ff]/10 blur-3xl" />
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <Link href="/" className="font-display text-lg font-semibold lg:hidden">Foundry<span className="text-[#ed8c65]">.</span></Link>
          <p className="mt-14 text-xs font-semibold uppercase tracking-[0.2em] text-[#ed8c65] lg:mt-0">Workspace access</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-3 text-sm text-white/45">Your workspace is waiting.</p>
          <label className="mt-10 block text-sm font-medium text-white/80">Email or username<input required name="username" autoComplete="username" className="mt-2 w-full rounded-lg border border-white/12 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#ed8c65] focus:ring-2 focus:ring-[#ed8c65]/20" /></label>
          <label className="mt-5 block text-sm font-medium text-white/80">Password<span className="relative mt-2 block"><input required type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" className="w-full rounded-lg border border-white/12 bg-white/[0.05] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-[#ed8c65] focus:ring-2 focus:ring-[#ed8c65]/20" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-white/35 hover:text-white">{showPassword ? "◉" : "◌"}</button></span></label>
          {error && <p role="alert" aria-live="polite" className="mt-5 rounded-lg border border-[#8f4433] bg-[#3a1d19] px-4 py-3 text-sm text-[#ffb29a]">{error}</p>}
          <button disabled={submitting} className="mt-7 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#ed8c65] disabled:cursor-wait disabled:opacity-50">{submitting ? "Signing in..." : "Sign in"}<span className="ml-2">→</span></button>
          <p className="mt-7 text-center text-sm text-white/40">New founder? <Link href="/founder/signup" className="text-white hover:text-[#ed8c65]">Create an account</Link></p>
        </form>
      </section>
    </main>
  );
}
