import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync } from "node:crypto";

const databaseUrl = process.env.DATABASE_URL;
const username = process.env.FOUNDRY_USERNAME;
const password = process.env.FOUNDRY_PASSWORD;
const role = process.env.FOUNDRY_ROLE;

if (!databaseUrl || !username || !password || !["admin", "investor"].includes(role)) {
  throw new Error("Set DATABASE_URL, FOUNDRY_USERNAME, FOUNDRY_PASSWORD, and FOUNDRY_ROLE.");
}

const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const sql = neon(databaseUrl);
await sql`
  INSERT INTO users (username, password_hash, role)
  VALUES (${username}, ${passwordHash}, ${role})
  ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
`;
console.log(`Created or updated ${role} user: ${username}`);
