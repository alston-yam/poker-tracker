"use client";

import { useState, useTransition } from "react";
import type { EntryInput } from "./actions";

type Row = EntryInput & { key: number };

let keyCounter = 0;
function newRow(): Row {
  keyCounter += 1;
  return { key: keyCounter, name: "", buyIn: 0, cashOut: 0 };
}

export default function GameForm({
  playerNames,
  initialDate,
  initialEntries,
  onSubmit,
  submitLabel = "Save game",
}: {
  playerNames: string[];
  initialDate?: string;
  initialEntries?: EntryInput[];
  onSubmit: (date: string, entries: EntryInput[]) => Promise<void>;
  submitLabel?: string;
}) {
  const [date, setDate] = useState(initialDate ?? new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>(() => {
    const initial = initialEntries?.map((e) => ({ ...e, key: (keyCounter += 1) }));
    return initial && initial.length > 0 ? initial : [newRow(), newRow()];
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, newRow()]);
  }

  function removeRow(key: number) {
    setRows((rs) => rs.filter((r) => r.key !== key));
  }

  function totalBuyIn() {
    return rows.reduce((sum, r) => sum + (Number(r.buyIn) || 0), 0);
  }

  function totalCashOut() {
    return rows.reduce((sum, r) => sum + (Number(r.cashOut) || 0), 0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const entries = rows
      .filter((r) => r.name.trim() !== "")
      .map(({ name, buyIn, cashOut }) => ({
        name: name.trim(),
        buyIn: Number(buyIn) || 0,
        cashOut: Number(cashOut) || 0,
      }));
    if (entries.length === 0) {
      setError("Add at least one player.");
      return;
    }
    const diff = Math.abs(totalBuyIn() - totalCashOut());
    if (diff > 0.02) {
      const proceed = confirm(
        `Buy-ins ($${totalBuyIn().toFixed(2)}) and cash-outs ($${totalCashOut().toFixed(
          2
        )}) don't match. Save anyway?`
      );
      if (!proceed) return;
    }
    startTransition(async () => {
      try {
        await onSubmit(date, entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="block text-sm text-muted mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border border-border rounded px-2 py-1.5 text-sm num"
        />
      </div>

      <datalist id="player-names">
        {playerNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-border">
            <th className="py-2 font-normal">Player</th>
            <th className="py-2 font-normal text-right w-28">Buy in</th>
            <th className="py-2 font-normal text-right w-28">Cash out</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-border last:border-0">
              <td className="py-1.5 pr-2">
                <input
                  list="player-names"
                  value={r.name}
                  onChange={(e) => updateRow(r.key, { name: e.target.value })}
                  placeholder="Name"
                  className="w-full border border-border rounded px-2 py-1"
                />
              </td>
              <td className="py-1.5 pr-2">
                <input
                  type="number"
                  step="0.01"
                  value={r.buyIn}
                  onChange={(e) => updateRow(r.key, { buyIn: Number(e.target.value) })}
                  className="w-full border border-border rounded px-2 py-1 text-right num"
                />
              </td>
              <td className="py-1.5 pr-2">
                <input
                  type="number"
                  step="0.01"
                  value={r.cashOut}
                  onChange={(e) => updateRow(r.key, { cashOut: Number(e.target.value) })}
                  className="w-full border border-border rounded px-2 py-1 text-right num"
                />
              </td>
              <td className="text-center">
                <button
                  type="button"
                  onClick={() => removeRow(r.key)}
                  className="text-muted hover:text-negative"
                  aria-label="Remove row"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="text-muted num">
            <td className="py-2">Total</td>
            <td className="py-2 text-right">${totalBuyIn().toFixed(2)}</td>
            <td className="py-2 text-right">${totalCashOut().toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <button
        type="button"
        onClick={addRow}
        className="self-start text-sm border border-border rounded px-3 py-1.5 hover:bg-surface"
      >
        + Add player
      </button>

      {error && <p className="text-sm text-negative">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-foreground text-background text-sm rounded px-4 py-2 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
