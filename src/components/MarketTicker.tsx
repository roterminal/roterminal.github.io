import { motion } from "framer-motion";

interface TickerItem {
  name: string;
  rap: number;
  change: number;
}

const MOCK_TICKER: TickerItem[] = [
  { name: "Violet Valkyrie", rap: 250000, change: 5.2 },
  { name: "Dominus Empyreus", rap: 1200000, change: -2.1 },
  { name: "Sparkle Time Fedora", rap: 180000, change: 3.8 },
  { name: "Clockwork Headphones", rap: 45000, change: -0.5 },
  { name: "Perfectly Legitimate Hat", rap: 95000, change: 12.4 },
  { name: "Valkyrie Helm", rap: 65000, change: 1.7 },
  { name: "Illumina", rap: 38000, change: -3.2 },
  { name: "Headless Horseman", rap: 350000, change: 0.8 },
  { name: "Korblox Deathspeaker", rap: 28000, change: 4.1 },
  { name: "Red Domino Crown", rap: 12000, change: -1.9 },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function MarketTicker() {
  const items = [...MOCK_TICKER, ...MOCK_TICKER];

  return (
    <div
      className="w-full overflow-hidden py-2.5 relative"
      style={{ borderBottom: "1px solid hsl(var(--border))" }}
    >
      <div className="ticker-scroll flex gap-8 whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="text-data text-foreground">{formatNumber(item.rap)}</span>
            <span className={`text-data ${item.change >= 0 ? "text-profit" : "text-loss"}`}>
              {item.change >= 0 ? "+" : ""}{item.change}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
