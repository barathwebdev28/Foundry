import { getCurrentUser } from "@/lib/auth";
import { canRecordFunding, canReviewApplications } from "@/lib/authorization";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  let body: { reviewStatus?: "approved" | "rejected"; fundingAmount?: number };
  try {
    body = (await request.json()) as { reviewStatus?: "approved" | "rejected"; fundingAmount?: number };
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (canReviewApplications(user.role) && (body.reviewStatus === "approved" || body.reviewStatus === "rejected")) {
    const existing = await sql`
  SELECT review_status
  FROM applications
  WHERE id = ${id}
  LIMIT 1
`;

if (!existing[0]) {
  return Response.json(
    { error: "Application not found." },
    { status: 404 },
  );
}

if (existing[0].review_status !== "pending") {
  return Response.json(
    { error: "This application already has a final decision." },
    { status: 409 },
  );
}

    const updated = await sql`
  UPDATE applications
  SET review_status = ${body.reviewStatus},
      reviewed_at = NOW()
  WHERE id = ${id} AND review_status = 'pending'
  RETURNING id
`;
    if (!updated.length) {
      return Response.json(
        { error: "This application already has a final decision." },
        { status: 409 },
      );
    }
    return Response.json({ ok: true });
  }
  if (canRecordFunding(user.role) && typeof body.fundingAmount === "number" && Number.isFinite(body.fundingAmount) && body.fundingAmount > 0) {
    const rows = await sql`
      INSERT INTO funding_transactions (application_id, investor_id, amount)
      SELECT ${id}, ${user.id}, ${body.fundingAmount}
      WHERE EXISTS (
        SELECT 1 FROM applications
        WHERE id = ${id} AND review_status = 'approved'
      )
      RETURNING id
    `;
    if (!rows.length) {
      return Response.json({ error: "Only approved applications can receive funding." }, { status: 409 });
    }
    return Response.json({ ok: true });
  }
  return Response.json({ error: "This action is not allowed." }, { status: 403 });
}
