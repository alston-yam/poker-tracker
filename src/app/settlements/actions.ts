"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

export async function recordSettlement(fromId: number, toId: number, amount: number) {
  await sql`
    insert into settlements (from_player_id, to_player_id, amount)
    values (${fromId}, ${toId}, ${amount})
  `;
  revalidatePath("/");
  revalidatePath("/players");
}

export async function deleteSettlement(id: number) {
  await sql`delete from settlements where id = ${id}`;
  revalidatePath("/");
  revalidatePath("/players");
}
