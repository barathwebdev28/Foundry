export type SubmissionFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  blob?: Blob;
  downloadUrl?: string;
};

export type Submission = {
  id: string;
  name: string;
  email: string;
  startupName: string;
  overview: string;
  teamMembers: string[];
  files: SubmissionFile[];
  submittedAt: string;
  reviewStatus?: "pending" | "approved" | "rejected";
  fundingReceived?: number;
};

type ApiFile = { id: string; applicationId: string; name: string; mimeType: string; size: number };

// PostgreSQL NUMERIC values arrive from Neon as strings. Keep that transport
// detail at the API boundary so the rest of the app can safely do arithmetic.
type ApiSubmission = Omit<Submission, "files" | "fundingReceived"> & {
  files: ApiFile[];
  fundingReceived?: number | string | null;
};

function fromApiFile(file: ApiFile): SubmissionFile {
  return {
    id: file.id,
    name: file.name,
    type: file.mimeType,
    size: file.size,
    downloadUrl: `/api/submissions/${file.applicationId}/files/${file.id}`,
  };
}

export async function saveSubmission(submission: Omit<Submission, "id" | "submittedAt" | "reviewStatus" | "fundingReceived">) {
  const body = new FormData();
  body.set("name", submission.name);
  body.set("email", submission.email);
  body.set("startupName", submission.startupName);
  body.set("overview", submission.overview);
  body.set("teamMembers", JSON.stringify(submission.teamMembers));
  submission.files.forEach((file) => {
    if (file.blob) body.append("files", file.blob, file.name);
  });
  const response = await fetch("/api/submissions", { method: "POST", body });
  if (!response.ok) throw new Error("Application could not be saved.");
}

export async function getSubmissions(): Promise<Submission[]> {
  const response = await fetch("/api/submissions", { cache: "no-store" });
  if (!response.ok) throw new Error("Submissions could not be loaded.");
  const data = (await response.json()) as { submissions: ApiSubmission[] };
  return data.submissions.map((submission) => ({
    ...submission,
    fundingReceived: Number(submission.fundingReceived ?? 0),
    files: submission.files.map(fromApiFile),
  }));
}

export async function updateSubmission(id: string, updates: Pick<Submission, "reviewStatus"> | { fundingAmount: number }) {
  const response = await fetch(`/api/submissions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Submission could not be updated.");
}
