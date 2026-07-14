"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

export async function markSettleItemPaid(id: number) {
  await sql`update settle_items set status = 'paid', paid_at = current_date where id = ${id}`;
  revalidatePath("/");
  revalidatePath("/players");
}

export async function removeSettleItem(id: number) {
  await sql`delete from settle_items where id = ${id}`;
  revalidatePath("/");
  revalidatePath("/players");
}
