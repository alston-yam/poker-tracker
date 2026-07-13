import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poker Tracker",
  description: "Buy-ins, cash-outs, and who owes who.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <nav className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between text-sm">
            <Link href="/" className="font-semibold tracking-tight">
              Poker Tracker
            </Link>
            <div className="flex gap-5 text-muted">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/games" className="hover:text-foreground">
                Games
              </Link>
              <Link href="/games/new" className="hover:text-foreground">
                Add game
              </Link>
              <Link href="/players" className="hover:text-foreground">
                Players
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
