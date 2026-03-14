import { useState, useEffect } from "react";
import { X, Loader2, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type LimitedItem, formatRap } from "@/hooks/use-roblox-api";
import { robloxApi } from "@/lib/roblox-api";

interface ItemDetailModalProps {
  item: LimitedItem | null;
  thumbnailUrl?: string;
  onClose: () => void;
}

interface ResaleInfo {
  recentAveragePrice: number;
  originalPrice: number;
  sales: number;
  assetStock: number;
  numberRemaining: number;
  priceDataPoints: { value: number; date: string }[];
  volumeDataPoints: { value: number; date: string }[];
}

export function ItemDetailModal({ item, thumbnailUrl, onClose }: ItemDetailModalProps) {
  const [resaleData, setResaleData] = useState<ResaleInfo | null>(null);
  const [loadingResale, setLoadingResale] = useState(false);

  useEffect(() => {
    if (!item) return;
    setResaleData(null);

    // Only fetch resale data for limiteds
    const isLimited = item.itemRestrictions?.includes("Limited") || item.itemRestrictions?.includes("LimitedUnique");
    if (isLimited) {
      setLoadingResale(true);
      robloxApi.getResaleData(item.id)
        .then((data) => setResaleData(data))
        .catch(() => {})
        .finally(() => setLoadingResale(false));
    }
  }, [item]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;

  const isLimited = item.itemRestrictions?.includes("Limited") || item.itemRestrictions?.includes("LimitedUnique");
  const isLimitedU = item.itemRestrictions?.includes("LimitedUnique");
  const rap = resaleData?.recentAveragePrice || item.recentAveragePrice;
  const spread = rap && item.lowestPrice ? item.lowestPrice - rap : null;
  const spreadPct = rap && spread ? ((spread / rap) * 100) : null;

  return (
    <div
      className="search-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-card rounded-lg w-full max-w-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8), var(--surface-glow)" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2">
            {isLimited && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-primary/20 text-profit">
                {isLimitedU ? "LIMITED U" : "LIMITED"}
              </span>
            )}
            <h2 className="text-sm font-semibold text-foreground">{item.name}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left: Image */}
          <div className="md:w-2/5 p-5">
            <div className="aspect-square bg-secondary rounded-md overflow-hidden flex items-center justify-center">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-secondary animate-pulse" />
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={`https://www.roblox.com/catalog/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-secondary text-xs text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <ExternalLink size={12} />
                View on Roblox
              </a>
            </div>
          </div>

          {/* Right: Data */}
          <div className="md:w-3/5 p-5 md:pl-0 space-y-4">
            {/* Price stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Price" value={formatRap(item.price)} />
              <StatBox label="RAP" value={rap ? formatRap(rap) : "N/A"} loading={loadingResale} highlight />
              {item.lowestPrice && <StatBox label="Lowest Price" value={formatRap(item.lowestPrice)} />}
              {spread !== null && spreadPct !== null && (
                <StatBox
                  label="Spread"
                  value={`${spread >= 0 ? "+" : ""}${formatRap(Math.abs(spread))}`}
                  sub={`${spreadPct >= 0 ? "+" : ""}${spreadPct.toFixed(1)}%`}
                  positive={spread >= 0}
                />
              )}
              {resaleData && (
                <>
                  <StatBox label="Total Sales" value={resaleData.sales.toLocaleString()} />
                  <StatBox label="Stock" value={resaleData.assetStock > 0 ? resaleData.assetStock.toLocaleString() : "∞"} />
                  {resaleData.numberRemaining > 0 && (
                    <StatBox label="Remaining" value={resaleData.numberRemaining.toLocaleString()} />
                  )}
                  {resaleData.originalPrice > 0 && (
                    <StatBox label="Original Price" value={formatRap(resaleData.originalPrice)} />
                  )}
                </>
              )}
            </div>

            {/* Price History Mini Chart */}
            {resaleData?.priceDataPoints && resaleData.priceDataPoints.length > 1 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Price History (Recent)</p>
                <MiniChart data={resaleData.priceDataPoints.slice(-30)} />
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Creator */}
            {item.creatorName && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Creator</p>
                <p className="text-xs text-foreground">{item.creatorName}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatBox({ label, value, sub, loading, highlight, positive }: {
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="surface-card p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      {loading ? (
        <Loader2 size={14} className="animate-spin text-muted-foreground" />
      ) : (
        <p className={`text-data text-sm font-semibold ${highlight ? "text-profit" : "text-foreground"}`}>{value}</p>
      )}
      {sub && (
        <p className={`text-data text-[10px] mt-0.5 ${positive === true ? "text-profit" : positive === false ? "text-loss" : "text-muted-foreground"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

function MiniChart({ data }: { data: { value: number; date: string }[] }) {
  if (data.length < 2) return null;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const height = 60;
  const width = 100;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = values[values.length - 1] >= values[0];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "hsl(var(--profit))" : "hsl(var(--loss))"}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
