// One-off migration: loads data/seed.json (parsed from the old Google Sheet)
// into the database. Run once after setting DATABASE_URL: `npm run seed`
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const seed = JSON.parse(readFileSync(join(__dirname, "../data/seed.json"), "utf-8"));

async function main() {
  const schema = readFileSync(join(__dirname, "../sql/schema.sql"), "utf-8");
  for (const stmt of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await sql.query(stmt);
  }

  const playerIds = {};
  for (const p of seed.players) {
    const rows = await sql`
      insert into players (name, account) values (${p.name}, ${p.account})
      on conflict (name) do update set account = coalesce(excluded.account, players.account)
      returning id
    `;
    playerIds[p.name] = rows[0].id;
  }

  let count = 0;
  for (const g of seed.games) {
    const gameRows = await sql`
      insert into games (game_date, date_approx) values (${g.date}, ${!!g.dateApprox})
      returning id
    `;
    const gameId = gameRows[0].id;
    for (const p of g.players) {
      const pid = playerIds[p.name];
      await sql`
        insert into entries (game_id, player_id, buy_in, cash_out)
        values (${gameId}, ${pid}, ${p.buyIn}, ${p.cashOut})
      `;
    }
    count += 1;
  }

  console.log(`Seeded ${seed.players.length} players, ${count} games.`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
