export type Balance = { id: number; name: string; amount: number };
export type Transaction = {
  fromId: number;
  fromName: string;
  toId: number;
  toName: string;
  amount: number;
};

// Greedy minimal-transaction debt settlement: match largest debtor with largest creditor.
export function settle(balances: Balance[]): Transaction[] {
  const EPS = 0.005;
  const debtors = balances
    .filter((b) => b.amount < -EPS)
    .map((b) => ({ ...b, amount: -b.amount }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .filter((b) => b.amount > EPS)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const amount = Math.min(d.amount, c.amount);
    if (amount > EPS) {
      transactions.push({
        fromId: d.id,
        fromName: d.name,
        toId: c.id,
        toName: c.name,
        amount: Math.round(amount * 100) / 100,
      });
    }
    d.amount -= amount;
    c.amount -= amount;
    if (d.amount <= EPS) i += 1;
    if (c.amount <= EPS) j += 1;
  }
  return transactions;
}
