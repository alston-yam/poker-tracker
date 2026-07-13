import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer, getPlayerGames, getPlayerProfit, getPlayerBalance, getPlayerSettlements } from "@/lib/queries";
import { deleteSettlement } from "../../settlements/actions";

export const dynamic = "force-dynamic";

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playerId = Number(id);
  const player = await getPlayer(playerId);
  if (!player) notFound();

  const [games, profit, balance, settlements] = await Promise.all([
    getPlayerGames(playerId),
    getPlayerProfit(playerId),
    getPlayerBalance(playerId),
    getPlayerSettlements(playerId),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold">{player.name}</h1>
        {player.account && <p className="text-sm text-muted num mt-1">{player.account}</p>}
        <p className={`text-2xl mt-2 num ${balance > 0 ? "text-positive" : balance < 0 ? "text-negative" : ""}`}>
          {money(balance)}
        </p>
        <p className="text-xs text-muted mt-1">
          still owed / owing · lifetime game result {money(profit)}
        </p>
      </div>

      {settlements.length > 0 && (
        <section>
          <h2 className="text-sm text-muted mb-3">Settlements</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {settlements.map((s) => (
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

      <section>
        <h2 className="text-sm text-muted mb-3">Game history</h2>
        {games.length === 0 ? (
          <p className="text-muted text-sm">No games recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="py-2 font-normal">Date</th>
                <th className="py-2 font-normal text-right">Buy in</th>
                <th className="py-2 font-normal text-right">Cash out</th>
                <th className="py-2 font-normal text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.gameId} className="border-b border-border last:border-0">
                  <td className="py-2">
                    <Link href={`/games/${g.gameId}/edit`} className="hover:underline">
                      {g.date}
                      {g.dateApprox && <span className="text-muted"> (approx)</span>}
                    </Link>
                  </td>
                  <td className="py-2 text-right num">${g.buyIn.toFixed(2)}</td>
                  <td className="py-2 text-right num">${g.cashOut.toFixed(2)}</td>
                  <td
                    className={`py-2 text-right num ${
                      g.profit > 0 ? "text-positive" : g.profit < 0 ? "text-negative" : "text-muted"
                    }`}
                  >
                    {money(g.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
