import { createSession, verifyPassword } from "@/lib/auth";
import { sql } from "@/lib/db";
import { clearLoginFailures, getLoginKey, isLoginBlocked, recordLoginFailure } from "@/lib/login-rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return Response.json({ error: "Invalid username or password." }, { status: 401 });
  }
  const username = body.username?.trim().toLowerCase() ?? "";
  if (!username || !body.password) {
    return Response.json({ error: "Invalid username or password." }, { status: 401 });
  }
  const key = getLoginKey(username, request);
  if (isLoginBlocked(key)) {
    return Response.json({ error: "Too many sign-in attempts. Try again later." }, { status: 429 });
  }

  let rows;
  try {
    rows = await sql`
      SELECT id, password_hash, role FROM users WHERE username = ${username} LIMIT 1
    `;
  } catch (error) {
    console.error("Login database error", error);
    return Response.json({ error: "The workspace is temporarily unavailable. Please try again." }, { status: 503 });
  }

  const user = rows[0] as { id: string; password_hash: string; role: "founder" | "admin" | "investor" } | undefined;
  if (!user || !verifyPassword(body.password, user.password_hash)) {
    recordLoginFailure(key);
    return Response.json({ error: "Invalid username or password." }, { status: 401 });
  }
  clearLoginFailures(key);
  try {
    await createSession(user.id);
  } catch (error) {
    console.error("Session creation database error", error);
    return Response.json({ error: "The workspace is temporarily unavailable. Please try again." }, { status: 503 });
  }
  return Response.json({ ok: true, role: user.role });
}
