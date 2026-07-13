"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { findOrCreatePlayer } from "@/lib/queries";

export type EntryInput = { name: string; buyIn: number; cashOut: number };

export async function createGame(date: string, entries: EntryInput[]) {
  const clean = entries.filter((e) => e.name.trim() !== "");
  if (clean.length === 0) throw new Error("Add at least one player.");

  const gameRows = await sql`insert into games (game_date) values (${date}) returning id`;
  const gameId = (gameRows[0] as { id: number }).id;

  for (const e of clean) {
    const playerId = await findOrCreatePlayer(e.name);
    await sql`
      insert into entries (game_id, player_id, buy_in, cash_out)
      values (${gameId}, ${playerId}, ${e.buyIn}, ${e.cashOut})
    `;
  }

  revalidatePath("/");
  revalidatePath("/games");
  redirect("/games");
}

export async function updateGame(gameId: number, date: string, entries: EntryInput[]) {
  const clean = entries.filter((e) => e.name.trim() !== "");
  if (clean.length === 0) throw new Error("Add at least one player.");

  await sql`update games set game_date = ${date}, date_approx = false where id = ${gameId}`;
  await sql`delete from entries where game_id = ${gameId}`;

  for (const e of clean) {
    const playerId = await findOrCreatePlayer(e.name);
    await sql`
      insert into entries (game_id, player_id, buy_in, cash_out)
      values (${gameId}, ${playerId}, ${e.buyIn}, ${e.cashOut})
    `;
  }

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
