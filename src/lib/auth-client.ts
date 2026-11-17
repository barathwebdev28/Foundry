export type ClientRole = "founder" | "admin" | "investor";

export async function login(username: string, password: string): Promise<ClientRole> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Invalid username or password.");
  }
  const data = (await response.json()) as { role: ClientRole };
  return data.role;
}

export async function registerFounder(name: string, email: string, password: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Founder account could not be created.");
  }
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function getSession() {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (!response.ok) return null;
  const data = (await response.json()) as { user: { role: ClientRole } | null };
  return data.user;
}
