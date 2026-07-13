import { neon } from "@neondatabase/serverless";

let client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (!client) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

// Lazy wrapper so importing this module doesn't require DATABASE_URL
// to be present at build time (only at request time).
export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  getClient()(strings, ...values)) as (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<any[]>;
