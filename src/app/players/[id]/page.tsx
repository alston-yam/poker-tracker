import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayer, getPlayerGames, getPlayerSettleItems } from "@/lib/queries";
import PlayerPnlChart from "@/components/PlayerPnlChart";

export const dynamic = "force-dynamic";

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);
  const player = await getPlayer(playerId);
  if (!player) notFound();

  const [games, settleItems] = await Promise.all([
    getPlayerGames(playerId),
    getPlayerSettleItems(playerId),
  ]);

  const lifetimeProfit = games.reduce((sum, g) => sum + g.profit, 0);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-lg font-semibold">{player.name}</h1>
        {player.account && <p className="text-xs text-muted mt-1">{player.account}</p>}
      </div>

      <section>
        <PlayerPnlChart games={games.map((g) => ({ date: g.date, profit: g.profit }))} />
      </section>

      <section>
        <h2 className="text-sm font-medium mb-3">
          Game history <span className="text-muted font-normal">({games.length})</span>
        </h2>
        {games.length === 0 ? (
          <p className="text-muted text-sm">No games played yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="py-2 font-normal">Date</th>
                <th className="py-2 font-normal text-right">Buy-in</th>
                <th className="py-2 font-normal text-right">Cash-out</th>
                <th className="py-2 font-normal text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.gameId} className="border-b border-border last:border-0">
                  <td className="py-2">
                    <Link href={`/games/${g.gameId}`} className="hover:underline">
                      {g.date}
                      {g.dateApprox && <span className="text-muted"> (approx)</span>}
                    </Link>
                  </td>
                  <td className="py-2 text-right num text-muted">{money(g.buyIn)}</td>
                  <td className="py-2 text-right num text-muted">{money(g.cashOut)}</td>
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

      {settleItems.length > 0 && (
        <section>
          <h2 className="text-sm font-medium mb-3">Settlements</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {settleItems.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span>
                  <span className="font-medium">{s.fromName}</span>
                  <span className="text-muted"> → </span>
                  <span className="font-medium">{s.toName}</span>
                  <span className="text-muted"> · {s.status.replace("_", " ")}</span>
                </span>
                <span className="num text-muted">{money(s.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted">
        Lifetime: <span className="num">{money(lifetimeProfit)}</span>
      </p>
    </div>
  );
}
