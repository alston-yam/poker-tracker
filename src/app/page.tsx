import Link from "next/link";
import { getPlayerTotals, getSettlements } from "@/lib/queries";
import { settle } from "@/lib/settle";
import { recordSettlement, deleteSettlement } from "./settlements/actions";

export const dynamic = "force-dynamic";

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export default async function Home() {
  const [totals, settlements] = await Promise.all([getPlayerTotals(), getSettlements()]);
  const transactions = settle(
    totals.map((t) => ({ id: t.id, name: t.name, amount: t.balance }))
  );
  const recentSettlements = settlements.slice(0, 8);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-lg font-semibold mb-4">Balances</h1>
        {totals.length === 0 ? (
          <p className="text-muted text-sm">No players yet. Add a game to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="py-2 font-normal">Player</th>
                <th className="py-2 font-normal text-right">Games</th>
                <th className="py-2 font-normal text-right">Total earnings</th>
                <th className="py-2 font-normal text-right">Still owed</th>
              </tr>
            </thead>
            <tbody>
              {totals
                .slice()
                .sort((a, b) => b.profit - a.profit)
                .map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="py-2">
                    <Link href={`/players/${t.id}`} className="hover:underline">
                      {t.name}
                    </Link>
                  </td>
                  <td className="py-2 text-right text-muted num">{t.gamesPlayed}</td>
                  <td
                    className={`py-2 text-right num ${
                      t.profit > 0 ? "text-positive" : t.profit < 0 ? "text-negative" : "text-muted"
                    }`}
                  >
                    {money(t.profit)}
                  </td>
                  <td className="py-2 text-right num text-muted">
                    {Math.abs(t.balance) < 0.005 ? "—" : money(t.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h1 className="text-lg font-semibold mb-4">Settle up</h1>
        {transactions.length === 0 ? (
          <p className="text-muted text-sm">Everyone&apos;s square. Nothing to settle.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {transactions.map((tx, i) => (
              <li
                key={i}
                className="flex items-center justify-between border border-border rounded px-3 py-2"
              >
                <span>
                  <span className="font-medium">{tx.fromName}</span>
                  <span className="text-muted"> pays </span>
                  <span className="font-medium">{tx.toName}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="num">{money(tx.amount)}</span>
                  <form action={recordSettlement.bind(null, tx.fromId, tx.toId, tx.amount)}>
                    <button
                      type="submit"
                      className="text-xs border border-border rounded px-2 py-1 hover:bg-surface"
                    >
                      Mark as paid
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recentSettlements.length > 0 && (
        <section>
          <h2 className="text-sm text-muted mb-3">Recently settled</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {recentSettlements.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-muted">
                <span>
                  <span className="text-foreground">{s.fromName}</span> paid{" "}
                  <span className="text-foreground">{s.toName}</span>{" "}
                  <span className="num">{money(s.amount)}</span>
                  <span> · {s.settledAt}</span>
                </span>
                <form action={deleteSettlement.bind(null, s.id)}>
                  <button type="submit" className="text-xs hover:text-negative">
                    Undo
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {totals.length > 0 && (
        <p className="text-xs text-muted">
          {totals.length} players tracked. <Link href="/games" className="underline">View all games</Link>.
        </p>
      )}
    </div>
  );
}
