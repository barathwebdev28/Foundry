"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { registerFounder } from "@/lib/auth-client";

export default function FounderSignup() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const form = new FormData(event.currentTarget);

    try {
      await registerFounder(
        String(form.get("name")),
        String(form.get("email")),
        String(form.get("password")),
      );
      router.push("/register");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Account could not be created.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#0b0d0c] text-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#151a17] p-10 lg:flex lg:flex-col lg:justify-between lg:p-16">
        <Link href="/" className="relative z-10 font-display text-lg font-semibold">
          Foundry<span className="text-[#ed8c65]">.</span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ef9d7d]">
            Founder access
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-tight">
            Give your idea a place to grow.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/60">
            Create your founder account, submit your application, and follow
            your progress from one workspace.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/35">FOUNDRY / FOUNDERS</p>
        <div aria-hidden="true" className="absolute -bottom-32 -right-24 size-[32rem] rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-10 right-0 size-64 rounded-full border border-white/10" />
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <Link href="/" className="font-display text-lg font-semibold lg:hidden">
            Foundry<span className="text-[#ed8c65]">.</span>
          </Link>

          <p className="mt-12 text-xs font-semibold uppercase tracking-[0.16em] text-[#ed8c65] lg:mt-0">
            Founder workspace
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Create your account
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/50">
            Your account lets you submit and track your application.
          </p>

          <label className="mt-8 block text-sm font-medium">
            Full name
            <input
              required
              name="name"
              autoComplete="name"
              className="mt-2 w-full rounded-md border border-white/15 bg-white/[0.06] px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-[#ed8c65] focus:ring-2 focus:ring-[#ed8c65]/20"
              placeholder="Jordan Lee"
            />
          </label>

          <label className="mt-5 block text-sm font-medium">
            Email address
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              className="mt-2 w-full rounded-md border border-white/15 bg-white/[0.06] px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-[#ed8c65] focus:ring-2 focus:ring-[#ed8c65]/20"
              placeholder="jordan@example.com"
            />
          </label>

          <label className="mt-5 block text-sm font-medium">
            Password
            <span className="relative mt-2 block">
              <input
                required
                minLength={8}
                maxLength={128}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                className="w-full rounded-md border border-white/15 bg-white/[0.06] px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-white/25 focus:border-[#ed8c65] focus:ring-2 focus:ring-[#ed8c65]/20"
              placeholder="8+ characters"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-white/40 transition hover:text-white/80">
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.3A10.8 10.8 0 0112 4c5.2 0 8.5 4 9.8 6a11.9 11.9 0 01-3.2 3.5M6.3 6.3A12.7 12.7 0 002.2 10c1.3 2 4.6 6 9.8 6 1 0 1.9-.2 2.7-.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.2 10c1.3-2 4.6-6 9.8-6s8.5 4 9.8 6c-1.3 2-4.6 6-9.8 6s-8.5-4-9.8-6z" />
                    <circle cx="12" cy="10" r="2.3" />
                  </svg>
                )}
              </button>
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-5 rounded-md border border-[#8f4433] bg-[#3a1d19] px-4 py-3 text-sm text-[#ffb29a]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-7 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#151a17] transition hover:bg-[#ed8c65] disabled:cursor-wait disabled:opacity-50"
          >
            {saving ? "Creating account..." : "Create founder account"}
            <span className="ml-2" aria-hidden="true">→</span>
          </button>

          <p className="mt-6 text-center text-sm text-white/45">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-[#ed8c65]">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
