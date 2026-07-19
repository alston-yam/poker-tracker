import { notFound } from "next/navigation";
import Link from "next/link";
import { getGame } from "@/lib/queries";

export const dynamic = "force-dynamic";

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gameId = Number(id);
  const game = await getGame(gameId);
  if (!game) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{game.date}</h1>
        <Link href={`/games/${gameId}/edit`} className="text-xs border border-border rounded px-2 py-1 hover:bg-surface">
          Edit
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-border">
            <th className="py-2 font-normal">Player</th>
            <th className="py-2 font-normal text-right">Buy-in</th>
            <th className="py-2 font-normal text-right">Cash-out</th>
            <th className="py-2 font-normal text-right">Profit</th>
          </tr>
        </thead>
        <tbody>
          {game.entries.map((e, i) => {
            const profit = e.cashOut - e.buyIn;
            return (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-2">{e.name}</td>
                <td className="py-2 text-right num text-muted">{money(e.buyIn)}</td>
                <td className="py-2 text-right num text-muted">{money(e.cashOut)}</td>
                <td
                  className={`py-2 text-right num ${
                    profit > 0 ? "text-positive" : profit < 0 ? "text-negative" : "text-muted"
                  }`}
                >
                  {money(profit)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}