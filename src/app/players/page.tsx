import { getPlayers } from "@/lib/queries";
import { updatePlayerAccount, addPlayer, deletePlayer } from "./actions";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold mb-6">Players</h1>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="py-2 font-normal">Name</th>
              <th className="py-2 font-normal">Payment details</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="py-2 pr-3">{p.name}</td>
                <td className="py-2 pr-3">
                  <form action={updatePlayerAccount.bind(null, p.id)} className="flex gap-2">
                    <input
                      name="account"
                      defaultValue={p.account ?? ""}
                      placeholder="BSB / account, PayID, etc."
                      className="w-full border border-border rounded px-2 py-1 num text-xs"
                    />
                    <button type="submit" className="text-xs text-muted hover:text-foreground shrink-0">
                      Save
                    </button>
                  </form>
                </td>
                <td className="py-2 text-right">
                  <form action={deletePlayer.bind(null, p.id)}>
                    <button type="submit" className="text-xs text-muted hover:text-negative">
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-sm text-muted mb-3">Add player</h2>
        <form action={addPlayer} className="flex gap-2">
          <input
            name="name"
            placeholder="Name"
            required
            className="border border-border rounded px-2 py-1.5 text-sm"
          />
          <button type="submit" className="text-sm border border-border rounded px-3 py-1.5 hover:bg-surface">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
