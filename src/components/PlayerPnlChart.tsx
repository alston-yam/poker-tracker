"use client";

import { useMemo, useState } from "react";

type GameResult = { date: string; profit: number };

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export default function PlayerPnlChart({ games }: { games: GameResult[] }) {
  const points = useMemo(() => {
    const chrono = [...games].sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    return chrono.map((g) => {
      running += g.profit;
      return { date: g.date, cum: running };
    });
  }, [games]);

  const [hover, setHover] = useState<number | null>(null);

  if (points.length === 0) {
    return <p className="text-muted text-sm">No games yet.</p>;
  }

  const W = 640;
  const H = 200;
  const PAD = 24;

  const values = points.map((p) => p.cum);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;

  const xAt = (i: number) =>
    points.length === 1 ? PAD : PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const yAt = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const zeroY = yAt(0);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.cum)}`).join(" ");
  const areaPath = `${linePath} L ${xAt(points.length - 1)} ${zeroY} L ${xAt(0)} ${zeroY} Z`;

  const final = points[points.length - 1].cum;
  const isPositive = final >= 0;
  const color = isPositive ? "#16a34a" : "#dc2626";
  const active = hover !== null ? points[hover] : points[points.length - 1];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-muted">Lifetime PnL</span>
        <span className={`num text-lg font-medium ${isPositive ? "text-positive" : "text-negative"}`}>
          {money(final)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseLeave={() => setHover(null)}
      >
        <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="currentColor" strokeOpacity={0.15} />
        <path d={areaPath} fill={color} fillOpacity={0.1} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xAt(i)}
            cy={yAt(p.cum)}
            r={hover === i ? 4 : 2.5}
            fill={color}
            onMouseEnter={() => setHover(i)}
          />
        ))}
        {/* invisible wider hit targets for easier hover */}
        {points.map((p, i) => (
          <rect
            key={`hit-${i}`}
            x={xAt(i) - (W / points.length) / 2}
            y={0}
            width={W / points.length}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>{points[0].date}</span>
        {active && (
          <span className="text-foreground">
            {active.date} · {money(active.cum)}
          </span>
        )}
        <span>{points[points.length - 1].date}</span>
      </div>
    </div>
  );
}
