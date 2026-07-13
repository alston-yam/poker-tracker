import { notFound } from "next/navigation";
import { getGame, getPlayers } from "@/lib/queries";
import GameForm from "../../GameForm";
import { updateGame, deleteGame } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gameId = Number(id);
  const [game, players] = await Promise.all([getGame(gameId), getPlayers()]);
  if (!game) notFound();

  const boundUpdate = updateGame.bind(null, gameId);
  const boundDelete = deleteGame.bind(null, gameId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Edit game</h1>
        <form action={boundDelete}>
          <button type="submit" className="text-sm text-negative hover:underline">
            Delete game
          </button>
        </form>
      </div>
      <GameForm
        playerNames={players.map((p) => p.name)}
        initialDate={game.date}
        initialEntries={game.entries.map((e) => ({ name: e.name, buyIn: e.buyIn, cashOut: e.cashOut }))}
        onSubmit={boundUpdate}
        submitLabel="Save changes"
      />
    </div>
  );
}
