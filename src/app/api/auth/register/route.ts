import { createSession, hashPassword } from "@/lib/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = (await request.json()) as { name?: string; email?: string; password?: string };
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return Response.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return Response.json({ error: "Password must be 8–128 characters and include a letter and a number." }, { status: 400 });
  }

  try {
    const rows = await sql`
      INSERT INTO users (username, password_hash, role, display_name)
      VALUES (${email}, ${hashPassword(password)}, 'founder', ${name})
      RETURNING id
    `;
    await createSession((rows[0] as { id: string }).id);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Founder registration database error", error);
    return Response.json({ error: "The workspace is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
