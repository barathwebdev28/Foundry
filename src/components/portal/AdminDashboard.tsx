"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSession, logout } from "@/lib/auth-client";
import {
  getSubmissions,
  updateSubmission,
  type Submission,
} from "@/lib/submissions";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function downloadFile(file: Submission["files"][number]) {
  if (!file.downloadUrl) throw new Error("File download is unavailable.");

  const response = await fetch(file.downloadUrl);
  if (!response.ok) throw new Error("File could not be downloaded.");

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = file.name;
  link.click();

  URL.revokeObjectURL(url);
}

function statusStyles(status: Submission["reviewStatus"]) {
  if (status === "approved") {
    return "bg-[#193224] text-[#b9dbbe]";
  }

  if (status === "rejected") {
    return "bg-[#3a1d19] text-[#ffb29a]";
  }

  return "bg-[#302a1c] text-[#e9c77d]";
}

export default function AdminDashboard() {
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const user = await getSession();

        if (user?.role !== "admin") {
          router.replace("/login");
          return;
        }

        const applications = await getSubmissions();

        if (active) {
          setSubmissions(applications);
        }
      } catch {
        if (active) {
          setLoadError(
            "Applications could not be loaded from the database.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  const filteredSubmissions = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return submissions.filter((submission) => {
      const matchesQuery = !normalizedQuery || `${submission.name} ${submission.email} ${submission.startupName}`.toLowerCase().includes(normalizedQuery);
      const status = submission.reviewStatus ?? "pending";
      return matchesQuery && (statusFilter === "all" || status === statusFilter);
    });
  }, [query, statusFilter, submissions]);

  const pendingCount = submissions.filter((submission) => (submission.reviewStatus ?? "pending") === "pending").length;

  async function reviewSubmission(
    submission: Submission,
    reviewStatus: "approved" | "rejected",
  ) {
    if (submission.reviewStatus && submission.reviewStatus !== "pending") {
      return;
    }

    if (reviewStatus === "rejected" && !window.confirm("Reject this application? This decision cannot be changed later.")) {
      return;
    }

    setUpdatingId(submission.id);
    setLoadError("");

    try {
      await updateSubmission(submission.id, { reviewStatus });

      setSubmissions((current) =>
        current.map((item) =>
          item.id === submission.id
            ? { ...item, reviewStatus }
            : item,
        ),
      );
    } catch {
      setLoadError(
        "The application decision could not be saved. Please try again.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function signOut() {
    await logout();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white">
      <header className="border-b border-white/10 bg-[#101311] px-5 sm:px-8">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-white"
          >
            Foundry
            <span className="text-[#ed8c65]">.</span>
            <span className="ml-3 border-l border-white/15 pl-3 text-sm font-medium text-white/45">
              Applications
            </span>
          </Link>

          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/50"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#ed8c65]">
              Foundry / Admin
            </p>

            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Founder applications
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
              Review founder profiles, make final decisions, and download
              supporting materials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-display text-4xl font-semibold">
              {submissions.length}
            </span>

            <span className="text-xs uppercase leading-4 tracking-[0.12em] text-white/40">
              Total
              <br />
              applications
            </span>
            <span className="rounded-full bg-[#302a1c] px-3 py-1 text-xs font-semibold text-[#e9c77d]">
              {pendingCount} pending
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-y border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full max-w-md items-center gap-3 rounded-md border border-white/15 bg-white/[0.04] px-3 transition focus-within:border-[#ed8c65]/60 focus-within:ring-2 focus-within:ring-[#ed8c65]/15">
            <span
              className="text-lg text-white/40"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search founders or startups"
              aria-label="Search applications"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </label>

          <span className="text-xs text-[#7c867d]">
            {filteredSubmissions.length} shown
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Application status filters">
          {(["all", "pending", "approved", "rejected"] as const).map((filter) => {
            const count = filter === "all"
              ? submissions.length
              : submissions.filter((submission) => (submission.reviewStatus ?? "pending") === filter).length;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/40 ${statusFilter === filter ? "bg-white text-[#151a17]" : "border border-white/15 text-white/50 hover:border-white/30 hover:bg-white/10"}`}
              >
                {filter} ({count})
              </button>
            );
          })}
        </div>

        {loadError && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-[#8f4433] bg-[#3a1d19] px-4 py-3 text-sm text-[#ffb29a]"
          >
            {loadError}
          </p>
        )}

        {loading ? (
          <div className="mt-8 space-y-4" aria-label="Loading applications" aria-busy="true">
            {[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />)}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center">
            <p className="font-display text-2xl font-semibold">
              {query
                ? "No matching applications"
                : "No applications yet"}
            </p>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">
              {query || statusFilter !== "all"
                ? "Try another search or status filter."
                : "New founder applications will appear here after submission."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredSubmissions.map((submission, index) => {
              const status = submission.reviewStatus ?? "pending";
              const decisionComplete =
                status === "approved" || status === "rejected";

              return (
                <article
                  key={submission.id}
                  className="grid gap-8 rounded-xl py-9 transition hover:bg-white/[0.025] md:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)] md:px-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="text-xs font-semibold tabular-nums text-white/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h2 className="font-display text-2xl font-semibold">
                        {submission.startupName}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyles(status)}`}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-white/45">
                      {submission.name}
                      <span className="mx-2 text-[#bdc4bb]">·</span>

                      <a
                        href={`mailto:${submission.email}`}
                        className="transition hover:text-[#ed8c65]"
                      >
                        {submission.email}
                      </a>
                    </p>

                    <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-white/65">
                      {submission.overview}
                    </p>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                      Team

                      <span className="ml-2 font-normal normal-case tracking-normal text-white/65">
                        {submission.teamMembers.length
                          ? submission.teamMembers.join(", ")
                          : "Founder-led"}
                      </span>
                    </p>

                    <div className="mt-7">
                      {decisionComplete ? (
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/45">
                          Final decision recorded. This application is closed.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={updatingId === submission.id}
                            onClick={() =>
                              reviewSubmission(submission, "approved")
                            }
                            className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#151a17] transition hover:bg-[#ed8c65] focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === submission.id
                              ? "Saving..."
                              : "Approve startup"}
                          </button>

                          <button
                            type="button"
                            disabled={updatingId === submission.id}
                            onClick={() =>
                              reviewSubmission(submission, "rejected")
                            }
                            className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-white/65 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject application
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                        Shared files
                        <span className="ml-1 text-[#ed8c65]">
                          {submission.files.length}
                        </span>
                      </p>

                      <time className="text-xs text-white/35">
                        {new Date(
                          submission.submittedAt,
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>

                    {submission.files.length > 0 ? (
                      <ul className="mt-4 divide-y divide-white/10">
                        {submission.files.map((file) => (
                          <li
                            key={file.id}
                            className="flex items-center justify-between gap-3 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {file.name}
                              </p>

                              <p className="mt-1 text-xs text-white/35">
                                {formatBytes(file.size)}
                                {file.type ? ` · ${file.type}` : ""}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => downloadFile(file)}
                              className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/65 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ed8c65]/50"
                            >
                              Download
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-5 text-sm text-white/35">
                        No files attached.
                      </p>
                    )}
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
