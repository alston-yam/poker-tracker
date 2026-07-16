"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

// pending -> awaiting_confirmation -> paid
// Reuses the existing `status` text column; no schema change.

export async function markSettleItemPaid(id: number) {
  await sql`
    update settle_items
    set status = 'awaiting_confirmation'
    where id = ${id} and status = 'pending'
  `;
  revalidatePath("/");
}

export async function confirmSettleItem(id: number) {
  await sql`
    update settle_items
    set status = 'paid', paid_at = now()
    where id = ${id} and status = 'awaiting_confirmation'
  `;
  revalidatePath("/");
}

export async function undoSettleItem(id: number) {
  // steps back one stage: paid -> awaiting_confirmation -> pending
  await sql`
    update settle_items
    set
      status = case status
        when 'paid' then 'awaiting_confirmation'
        when 'awaiting_confirmation' then 'pending'
        else status
      end,
      paid_at = case when status = 'paid' then null else paid_at end
    where id = ${id}
  `;
  revalidatePath("/");
}

export async function removeSettleItem(id: number) {
  await sql`delete from settle_items where id = ${id}`;
  revalidatePath("/");
}
