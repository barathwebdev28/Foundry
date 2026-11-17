import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return Response.json({ user });
  } catch (error) {
    console.error("Session lookup database error", error);
    return Response.json({ error: "The workspace is temporarily unavailable." }, { status: 503 });
  }
}
