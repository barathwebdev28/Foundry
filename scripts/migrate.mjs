import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the migration.");
}

function splitSqlStatements(schema) {
  const statements = [];
  let current = "";
  let quote = null;
  let dollarTag = null;

  for (let index = 0; index < schema.length; index += 1) {
    const character = schema[index];
    const next = schema[index + 1];

    if (dollarTag) {
      current += character;
      if (schema.startsWith(dollarTag, index + 1)) {
        current += dollarTag;
        index += dollarTag.length;
        dollarTag = null;
      }
      continue;
    }

    if (quote) {
      current += character;
      if (character === quote && next === quote) {
        current += next;
        index += 1;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
      current += character;
      continue;
    }

    const dollarMatch = schema.slice(index).match(/^\$[A-Za-z0-9_]*\$/);
    if (dollarMatch) {
      dollarTag = dollarMatch[0];
      current += dollarTag;
      index += dollarTag.length - 1;
      continue;
    }

    if (character === ";") {
      if (current.trim()) statements.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const sql = neon(databaseUrl);
const statements = splitSqlStatements(schema);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Foundry database schema applied successfully (${statements.length} statements).`);
