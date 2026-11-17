import { getCurrentUser } from "@/lib/auth";
import { pool, sql } from "@/lib/db";

export const runtime = "nodejs";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TEXT_LENGTH = 10_000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "founder") {
    return Response.json({ error: "Founder sign-in is required." }, { status: 401 });
  }

  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const startupName = String(form.get("startupName") ?? "").trim();
  const overview = String(form.get("overview") ?? "").trim();
  let teamMembers: string[];
  try {
    const parsed = JSON.parse(String(form.get("teamMembers") ?? "[]"));
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
      throw new Error("Invalid team members");
    }
    teamMembers = parsed.map((item) => item.trim()).filter(Boolean).slice(0, 20);
  } catch {
    return Response.json({ error: "Team members must be a valid list." }, { status: 400 });
  }

  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (!name || !email || !startupName || !overview) {
    return Response.json({ error: "All founder details are required." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if ([name, email, startupName, overview].some((value) => value.length > MAX_TEXT_LENGTH)) {
    return Response.json({ error: "One or more fields are too long." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return Response.json({ error: `You can attach up to ${MAX_FILES} files.` }, { status: 400 });
  }
  const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);
  if (oversizedFile) {
    return Response.json({ error: `${oversizedFile.name} is larger than 25 MB.` }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const applications = await client.query<{ id: string }>(
      `INSERT INTO applications (founder_user_id, founder_name, founder_email, startup_name, overview)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [user.id, name, email, startupName, overview],
    );
    const applicationId = applications.rows[0].id;

    for (const [sortOrder, member] of teamMembers.entries()) {
      await client.query(
        `INSERT INTO application_team_members (application_id, name, sort_order)
         VALUES ($1, $2, $3)`,
        [applicationId, member, sortOrder],
      );
    }

    for (const file of files) {
      await client.query(
        `INSERT INTO application_files (application_id, name, mime_type, size_bytes, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [applicationId, file.name, file.type, file.size, Buffer.from(await file.arrayBuffer())],
      );
    }

    await client.query("COMMIT");
    return Response.json({ id: applicationId }, { status: 201 });
  } catch {
    await client.query("ROLLBACK");
    return Response.json({ error: "Application could not be saved." }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const applications = user.role === "investor"
    ? await sql`
        SELECT a.id, a.founder_name AS name, a.founder_email AS email, a.startup_name AS "startupName",
          a.overview, a.submitted_at AS "submittedAt", a.review_status AS "reviewStatus",
          COALESCE((SELECT SUM(ft.amount) FROM funding_transactions ft WHERE ft.application_id = a.id), 0) AS "fundingReceived",
          COALESCE((SELECT json_agg(json_build_object('id', af.id, 'applicationId', af.application_id, 'name', af.name, 'mimeType', af.mime_type, 'size', af.size_bytes) ORDER BY af.created_at) FROM application_files af WHERE af.application_id = a.id), '[]') AS files,
          COALESCE((SELECT json_agg(atm.name ORDER BY atm.sort_order) FROM application_team_members atm WHERE atm.application_id = a.id), '[]') AS "teamMembers"
        FROM applications a WHERE a.review_status = 'approved' ORDER BY a.submitted_at DESC
      `
    : user.role === "founder"
    ? await sql`
        SELECT a.id, a.founder_name AS name, a.founder_email AS email, a.startup_name AS "startupName",
          a.overview, a.submitted_at AS "submittedAt", a.review_status AS "reviewStatus",
          COALESCE((SELECT SUM(ft.amount) FROM funding_transactions ft WHERE ft.application_id = a.id), 0) AS "fundingReceived",
          COALESCE((SELECT json_agg(json_build_object('id', af.id, 'applicationId', af.application_id, 'name', af.name, 'mimeType', af.mime_type, 'size', af.size_bytes) ORDER BY af.created_at) FROM application_files af WHERE af.application_id = a.id), '[]') AS files,
          COALESCE((SELECT json_agg(atm.name ORDER BY atm.sort_order) FROM application_team_members atm WHERE atm.application_id = a.id), '[]') AS "teamMembers"
        FROM applications a WHERE a.founder_user_id = ${user.id} ORDER BY a.submitted_at DESC
      `
    : await sql`
        SELECT a.id, a.founder_name AS name, a.founder_email AS email, a.startup_name AS "startupName",
          a.overview, a.submitted_at AS "submittedAt", a.review_status AS "reviewStatus",
          COALESCE((SELECT SUM(ft.amount) FROM funding_transactions ft WHERE ft.application_id = a.id), 0) AS "fundingReceived",
          COALESCE((SELECT json_agg(json_build_object('id', af.id, 'applicationId', af.application_id, 'name', af.name, 'mimeType', af.mime_type, 'size', af.size_bytes) ORDER BY af.created_at) FROM application_files af WHERE af.application_id = a.id), '[]') AS files,
          COALESCE((SELECT json_agg(atm.name ORDER BY atm.sort_order) FROM application_team_members atm WHERE atm.application_id = a.id), '[]') AS "teamMembers"
        FROM applications a ORDER BY a.submitted_at DESC
      `;
  return Response.json({ submissions: applications });
}
