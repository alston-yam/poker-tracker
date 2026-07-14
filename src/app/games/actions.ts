"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { findOrCreatePlayer } from "@/lib/queries";
import { settle } from "@/lib/settle";

export type EntryInput = { name: string; buyIn: number; cashOut: number };

async function writeSettleItems(gameId: number, players: { id: number; name: string; amount: number }[]) {
  const transactions = settle(players);
  for (const t of transactions) {
    await sql`
      insert into settle_items (game_id, from_player_id, to_player_id, amount)
      values (${gameId}, ${t.fromId}, ${t.toId}, ${t.amount})
    `;
  }
}

export async function createGame(date: string, entries: EntryInput[]) {
  const clean = entries.filter((e) => e.name.trim() !== "");
  if (clean.length === 0) throw new Error("Add at least one player.");

  const gameRows = await sql`insert into games (game_date) values (${date}) returning id`;
  const gameId = (gameRows[0] as { id: number }).id;

  const players: { id: number; name: string; amount: number }[] = [];
  for (const e of clean) {
    const playerId = await findOrCreatePlayer(e.name);
    await sql`
      insert into entries (game_id, player_id, buy_in, cash_out)
      values (${gameId}, ${playerId}, ${e.buyIn}, ${e.cashOut})
    `;
    players.push({ id: playerId, name: e.name, amount: e.cashOut - e.buyIn });
  }
  await writeSettleItems(gameId, players);

  revalidatePath("/");
  revalidatePath("/games");
  redirect("/games");
}

export async function updateGame(gameId: number, date: string, entries: EntryInput[]) {
  const clean = entries.filter((e) => e.name.trim() !== "");
  if (clean.length === 0) throw new Error("Add at least one player.");

  await sql`update games set game_date = ${date}, date_approx = false where id = ${gameId}`;
  await sql`delete from entries where game_id = ${gameId}`;
  await sql`delete from settle_items where game_id = ${gameId}`;

  const players: { id: number; name: string; amount: number }[] = [];
  for (const e of clean) {
    const playerId = await findOrCreatePlayer(e.name);
    await sql`
      insert into entries (game_id, player_id, buy_in, cash_out)
      values (${gameId}, ${playerId}, ${e.buyIn}, ${e.cashOut})
    `;
    players.push({ id: playerId, name: e.name, amount: e.cashOut - e.buyIn });
  }
  await writeSettleItems(gameId, players);

  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath(`/games/${gameId}/edit`);
  redirect("/games");
}

export async function deleteGame(gameId: number) {
  await sql`delete from games where id = ${gameId}`;
  revalidatePath("/");
  revalidatePath("/games");
  redirect("/games");
}
