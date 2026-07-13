"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { findOrCreatePlayer } from "@/lib/queries";

export async function updatePlayerAccount(playerId: number, formData: FormData) {
  const account = String(formData.get("account") ?? "").trim();
  await sql`update players set account = ${account || null} where id = ${playerId}`;
  revalidatePath("/players");
}

export async function addPlayer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await findOrCreatePlayer(name);
  revalidatePath("/players");
  revalidatePath("/");
}

export async function deletePlayer(playerId: number) {
  await sql`delete from players where id = ${playerId}`;
  revalidatePath("/players");
  revalidatePath("/");
}
