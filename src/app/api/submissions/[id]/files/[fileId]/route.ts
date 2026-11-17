import { getCurrentUser } from "@/lib/auth";
import { canDownloadApplicationFile } from "@/lib/authorization";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const { id, fileId } = await params;
  const rows = await sql`
    SELECT af.name, af.mime_type, encode(af.data, 'base64') AS data,
      a.founder_user_id, a.review_status
    FROM application_files af
    JOIN applications a ON a.id = af.application_id
    WHERE af.id = ${fileId} AND af.application_id = ${id}
    LIMIT 1
  `;

  const file = rows[0] as { name: string; mime_type: string; data: string; founder_user_id: string | null; review_status: "pending" | "approved" | "rejected" } | undefined;
  if (!file) return Response.json({ error: "File not found." }, { status: 404 });
  if (!canDownloadApplicationFile(user.role, user.id, file.founder_user_id, file.review_status)) {
    return Response.json({ error: "You are not allowed to download this file." }, { status: 403 });
  }

  return new Response(Buffer.from(file.data, "base64"), {
    headers: {
      "Content-Type": file.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
