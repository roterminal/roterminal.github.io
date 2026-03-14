import { useState, useEffect } from "react";
import { Loader2, ChevronRight } from "lucide-react";
import { useRobloxApi, type LimitedItem } from "@/hooks/use-roblox-api";

export function ItemGrid() {
  const { loading, error, fetchLimiteds, fetchThumbnails } = useRobloxApi();
  const [items, setItems] = useState<LimitedItem[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async (nextCursor?: string) => {
    const result = await fetchLimiteds(nextCursor);
    const newItems = nextCursor ? [...items, ...result.items] : result.items;
    setItems(newItems);
    setCursor(result.nextCursor);
    setHasMore(!!result.nextCursor);

    // Fetch thumbnails
    const ids = result.items.map((i) => i.id);
    const thumbs = await fetchThumbnails(ids);
    setThumbnails((prev) => ({ ...prev, ...thumbs }));
  };

  function formatRap(n?: number) {
    if (!n) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="surface-card p-6 text-center">
        <p className="text-loss text-sm">Failed to load items</p>
        <p className="text-muted-foreground text-xs mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {items.map((item) => (
          <div key={item.id} className="surface-card p-3 cursor-pointer group">
            <div className="aspect-square bg-secondary rounded-md mb-2.5 overflow-hidden flex items-center justify-center">
              {thumbnails[item.id] ? (
                <img
                  src={thumbnails[item.id]}
                  alt={item.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-secondary animate-pulse" />
              )}
            </div>
            <p className="text-xs text-foreground truncate font-medium">{item.name}</p>
            <div className="flex items-center justify-between mt-1.5">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">RAP</p>
                <p className="text-data text-xs text-foreground">{formatRap(item.recentAveragePrice)}</p>
              </div>
              {item.lowestPrice && (
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lowest</p>
                  <p className="text-data text-xs text-profit">{formatRap(item.lowestPrice)}</p>
                </div>
              )}
            </div>
            {item.creatorName && (
              <p className="text-[10px] text-muted-foreground mt-1.5 truncate">
                by {item.creatorName}
              </p>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => loadItems(cursor)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
