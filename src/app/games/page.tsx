import Link from "next/link";
import { getGames } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const games = await getGames();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Games</h1>
        <Link href="/games/new" className="text-sm border border-border rounded px-3 py-1.5 hover:bg-surface">
          + Add game
        </Link>
      </div>

      {games.length === 0 ? (
        <p className="text-muted text-sm">No games yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="py-2 font-normal">Date</th>
              <th className="py-2 font-normal text-right">Players</th>
              <th className="py-2 font-normal text-right">Total buy-in</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.id} className="border-b border-border last:border-0">
                <td className="py-2">
                  <Link href={`/games/${g.id}/edit`} className="hover:underline">
                    {g.date}
                    {g.dateApprox && <span className="text-muted"> (approx)</span>}
                  </Link>
                </td>
                <td className="py-2 text-right text-muted num">{g.playerCount}</td>
                <td className="py-2 text-right num">${g.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
