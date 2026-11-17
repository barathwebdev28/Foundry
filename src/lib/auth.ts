import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";

export type UserRole = "founder" | "admin" | "investor";
export type CurrentUser = { id: string; username: string; displayName: string | null; role: UserRole };

export const SESSION_COOKIE = "foundry_session";
const SESSION_DAYS = 7;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, storedHash] = stored.split(":");
  if (!salt || !storedHash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(storedHash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO sessions (user_id, token_hash, expires_at)
    VALUES (${userId}, ${hashToken(token)}, ${expiresAt.toISOString()})
  `;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await sql`
    SELECT s.expires_at, u.id, u.username, u.display_name AS "displayName", u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)}
    LIMIT 1
  `;
  const session = rows[0] as (CurrentUser & { expires_at: string }) | undefined;
  if (!session) return null;
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await sql`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
    (await cookies()).delete(SESSION_COOKIE);
    return null;
  }
  return {
    id: session.id,
    username: session.username,
    displayName: session.displayName,
    role: session.role,
  };
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await sql`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
  }
  cookieStore.delete(SESSION_COOKIE);
}
