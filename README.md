# Poker Tracker

Tracks each player's buy-ins, cash-outs, profit, and who owes who. No data is
hardcoded — everything lives in a Postgres database and is edited through the
site itself.

## 1. Database (free)

1. Go to https://neon.tech (or Vercel's Storage tab → Postgres, same thing) and create a free project.
2. Copy the connection string (starts with `postgres://...`).

## 2. Local setup

```
npm install
cp .env.example .env.local   # paste your connection string into DATABASE_URL
npm run seed                 # creates tables + imports your old spreadsheet history
npm run dev                  # http://localhost:3000
```

## 3. Deploy (free, Vercel)

1. Push this folder to a GitHub repo.
2. Import it at https://vercel.com/new.
3. Add an environment variable `DATABASE_URL` (same value as `.env.local`).
4. Deploy.

## Notes

- `npm run seed` is a one-time import of the old Google Sheet (`data/seed.json`,
  already parsed from your CSV). Re-running it is safe for players (it upserts)
  but will duplicate games if run twice — only run it once per database.
- A handful of the most recent games in the old sheet had no date filled in;
  those were given an approximate date (flagged "(approx)" in the UI) so you
  can fix them under Games → edit.
- The old sheet's totals don't sum to exactly zero (~$230 short) because of
  uncashed chips / food money tracked as "Extra" rather than a specific
  person. That money isn't attributed to anyone in the new system — add it
  under a player (e.g. yourself, or a "Kitty" player) if you want it settled.
