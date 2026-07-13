import { getPlayers } from "@/lib/queries";
import GameForm from "../GameForm";
import { createGame } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewGamePage() {
  const players = await getPlayers();

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Add game</h1>
      <GameForm playerNames={players.map((p) => p.name)} onSubmit={createGame} submitLabel="Save game" />
    </div>
  );
}
