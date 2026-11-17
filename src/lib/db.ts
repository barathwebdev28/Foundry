import { neon, Pool } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not configured. Add your Neon connection string to .env.local.",
  );
}

export const sql = neon(databaseUrl);
export const pool = new Pool({ connectionString: databaseUrl });
