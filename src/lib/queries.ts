import { sql } from "./db";

export type Player = { id: number; name: string; account: string | null };

export type PlayerTotal = Player & {
  profit: number;
  balance: number;
  gamesPlayed: number;
  lastPlayed: string | null;
};

export type SettleItem = {
  id: number;
  gameId: number | null;
  gameDate: string | null;
  fromId: number;
  fromName: string;
  toId: number;
  toName: string;
  amount: number;
  status: "pending" | "awaiting_confirmation" | "paid";
  paidAt: string | null;
};

export type GameEntry = {
  id: number;
  playerId: number;
  name: string;
  buyIn: number;
  cashOut: number;
};

export type Game = {
  id: number;
  date: string;
  dateApprox: boolean;
  note: string | null;
  entries: GameEntry[];
};

export async function getPlayers(): Promise<Player[]> {
  const rows = await sql`select id, name, account from players order by name asc`;
  return rows as Player[];
}

// profit = raw lifetime result from games only.
// balance = net of items not yet fully confirmed paid; what's still outstanding.
export async function getPlayerTotals(): Promise<PlayerTotal[]> {
  const rows = await sql`
    select p.id, p.name, p.account,
      coalesce(g.profit, 0)::float as profit,
      (coalesce(s_in.received, 0) - coalesce(s_out.owed, 0))::float as balance,
      coalesce(g.games_played, 0)::int as "gamesPlayed",
      g.last_played::text as "lastPlayed"
    from players p
    left join (
      select e.player_id, sum(e.cash_out - e.buy_in) as profit, count(*) as games_played,
        max(g.game_date) as last_played
      from entries e join games g on g.id = e.game_id
      group by e.player_id
    ) g on g.player_id = p.id
    left join (
      select from_player_id, sum(amount) as owed from settle_items
      where status in ('pending', 'awaiting_confirmation') group by from_player_id
    ) s_out on s_out.from_player_id = p.id
    left join (
      select to_player_id, sum(amount) as received from settle_items
      where status in ('pending', 'awaiting_confirmation') group by to_player_id
    ) s_in on s_in.to_player_id = p.id
    order by profit desc
  `;
  return rows as PlayerTotal[];
}

export async function getPlayer(id: number): Promise<Player | null> {
  const rows = await sql`select id, name, account from players where id = ${id}`;
  return (rows[0] as Player) ?? null;
}

export async function getPlayerProfit(id: number): Promise<number> {
  const rows = await sql`
    select coalesce(sum(cash_out - buy_in), 0)::float as profit
    from entries where player_id = ${id}
  `;
  return (rows[0] as { profit: number }).profit;
}

export async function getPendingSettleItems(): Promise<SettleItem[]> {
  const rows = await sql`
    select si.id, si.game_id as "gameId", g.game_date::text as "gameDate",
      si.from_player_id as "fromId", pf.name as "fromName",
      si.to_player_id as "toId", pt.name as "toName",
      si.amount::float as amount, si.status, si.paid_at::text as "paidAt"
    from settle_items si
    join players pf on pf.id = si.from_player_id
    join players pt on pt.id = si.to_player_id
    left join games g on g.id = si.game_id
    where si.status = 'pending'
    order by g.game_date asc, si.id asc
  `;
  return rows as SettleItem[];
}

export async function getAwaitingConfirmationSettleItems(): Promise<SettleItem[]> {
  const rows = await sql`
    select si.id, si.game_id as "gameId", g.game_date::text as "gameDate",
      si.from_player_id as "fromId", pf.name as "fromName",
      si.to_player_id as "toId", pt.name as "toName",
      si.amount::float as amount, si.status, si.paid_at::text as "paidAt"
    from settle_items si
    join players pf on pf.id = si.from_player_id
    join players pt on pt.id = si.to_player_id
    left join games g on g.id = si.game_id
    where si.status = 'awaiting_confirmation'
    order by g.game_date asc, si.id asc
  `;
  return rows as SettleItem[];
}

export async function getPaidSettleItems(): Promise<SettleItem[]> {
  const rows = await sql`
    select si.id, si.game_id as "gameId", g.game_date::text as "gameDate",
      si.from_player_id as "fromId", pf.name as "fromName",
      si.to_player_id as "toId", pt.name as "toName",
      si.amount::float as amount, si.status, si.paid_at::text as "paidAt"
    from settle_items si
    join players pf on pf.id = si.from_player_id
    join players pt on pt.id = si.to_player_id
    left join games g on g.id = si.game_id
    where si.status = 'paid'
    order by si.paid_at desc, si.id desc
  `;
  return rows as SettleItem[];
}

export async function getPlayerSettleItems(id: number): Promise<SettleItem[]> {
  const rows = await sql`
    select si.id, si.game_id as "gameId", g.game_date::text as "gameDate",
      si.from_player_id as "fromId", pf.name as "fromName",
      si.to_player_id as "toId", pt.name as "toName",
      si.amount::float as amount, si.status, si.paid_at::text as "paidAt"
    from settle_items si
    join players pf on pf.id = si.from_player_id
    join players pt on pt.id = si.to_player_id
    left join games g on g.id = si.game_id
    where si.from_player_id = ${id} or si.to_player_id = ${id}
    order by si.status asc, g.game_date desc, si.id desc
  `;
  return rows as SettleItem[];
}

export async function getPlayerGames(id: number): Promise<
  { gameId: number; date: string; dateApprox: boolean; buyIn: number; cashOut: number; profit: number }[]
> {
  const rows = await sql`
    select g.id as "gameId", g.game_date::text as date, g.date_approx as "dateApprox",
      e.buy_in::float as "buyIn", e.cash_out::float as "cashOut",
      (e.cash_out - e.buy_in)::float as profit
    from entries e
    join games g on g.id = e.game_id
    where e.player_id = ${id}
    order by g.game_date desc, g.id desc
  `;
  return rows as any;
}

export async function getGames(): Promise<
  { id: number; date: string; dateApprox: boolean; note: string | null; total: number; playerCount: number }[]
> {
  const rows = await sql`
    select g.id, g.game_date::text as date, g.date_approx as "dateApprox", g.note,
      coalesce(sum(e.buy_in), 0)::float as total,
      count(e.id)::int as "playerCount"
    from games g
    left join entries e on e.game_id = g.id
    group by g.id
    order by g.game_date desc, g.id desc
  `;
  return rows as any;
}

export async function getGame(id: number): Promise<Game | null> {
  const gameRows = await sql`
    select id, game_date::text as date, date_approx as "dateApprox", note
    from games where id = ${id}
  `;
  if (gameRows.length === 0) return null;
  const entryRows = await sql`
    select e.id, e.player_id as "playerId", p.name, e.buy_in::float as "buyIn", e.cash_out::float as "cashOut"
    from entries e join players p on p.id = e.player_id
    where e.game_id = ${id}
    order by p.name asc
  `;
  const g = gameRows[0] as any;
  return { ...g, entries: entryRows as GameEntry[] };
}

export async function findOrCreatePlayer(name: string): Promise<number> {
  const trimmed = name.trim();
  const existing = await sql`select id from players where lower(name) = lower(${trimmed})`;
  if (existing.length > 0) return (existing[0] as { id: number }).id;
  const inserted = await sql`insert into players (name) values (${trimmed}) returning id`;
  return (inserted[0] as { id: number }).id;
}
