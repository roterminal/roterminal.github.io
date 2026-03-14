import { useState, useEffect } from "react";
import { Loader2, ChevronRight, Filter, SortAsc } from "lucide-react";
import { useRobloxApi, formatRap, type LimitedItem, type CatalogSort, type CatalogCategory } from "@/hooks/use-roblox-api";

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "updated", label: "Recently Updated" },
  { value: "favorited", label: "Most Favorited" },
  { value: "sales", label: "Best Selling" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "price_asc", label: "Price: Low → High" },
];

const CATEGORY_OPTIONS: { value: CatalogCategory; label: string }[] = [
  { value: "all", label: "All Items" },
  { value: "collectibles", label: "Collectibles" },
  { value: "accessories", label: "Accessories" },
  { value: "hats", label: "Hats" },
  { value: "faces", label: "Faces" },
  { value: "gear", label: "Gear" },
  { value: "clothing", label: "Clothing" },
];

interface ItemGridProps {
  initialCategory?: CatalogCategory;
  initialSort?: CatalogSort;
  showFilters?: boolean;
  limit?: number;
  keyword?: string;
  title?: string;
}

export function ItemGrid({
  initialCategory = "all",
  initialSort = "updated",
  showFilters = true,
  limit = 30,
  keyword,
  title,
}: ItemGridProps) {
  // Clamp limit to Roblox allowed values: 10, 28, 30
  const safeLimit = limit <= 10 ? 10 : limit <= 28 ? 28 : 30;

  const { fetchLimiteds, fetchThumbnails } = useRobloxApi();
  const [items, setItems] = useState<LimitedItem[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<CatalogSort>(initialSort);
  const [category, setCategory] = useState<CatalogCategory>(initialCategory);
  const [search, setSearch] = useState(keyword || "");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, [sort, category]);

  const loadItems = async (nextCursor?: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await fetchLimiteds(
        { sort, category, limit: safeLimit, keyword: search || undefined },
        nextCursor
      );
      const newItems = nextCursor ? [...items, ...result.items] : result.items;
      setItems(newItems);
      setCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);

      const ids = result.items.map((i) => i.id);
      const thumbs = await fetchThumbnails(ids);
      setThumbnails((prev) => (nextCursor ? { ...prev, ...thumbs } : thumbs));
    } catch (e: any) {
      setLoadError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setItems([]);
      loadItems();
    }
  };

  const isLimited = (item: LimitedItem) =>
    item.itemRestrictions?.includes("Limited") || item.itemRestrictions?.includes("LimitedUnique");

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-primary" size={28} />
        <p className="text-xs text-muted-foreground">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search items..."
              className="w-full bg-secondary rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-shadow"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as CatalogCategory);
                setItems([]);
              }}
              className="bg-secondary text-sm text-foreground rounded-md px-3 py-2 outline-none border-none cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <SortAsc size={14} className="text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as CatalogSort);
                setItems([]);
              }}
              className="bg-secondary text-sm text-foreground rounded-md px-3 py-2 outline-none border-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {title && (
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">{title}</h2>
      )}

      {error && items.length === 0 && (
        <div className="surface-card p-6 text-center">
          <p className="text-loss text-sm mb-1">Failed to load items</p>
          <p className="text-muted-foreground text-xs">{error}</p>
          <button
            onClick={() => loadItems()}
            className="mt-3 px-3 py-1.5 rounded-md bg-secondary text-xs text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {items.map((item) => (
          <div key={item.id} className="surface-card p-3 cursor-pointer group">
            <div className="aspect-square bg-secondary rounded-md mb-2.5 overflow-hidden flex items-center justify-center relative">
              {thumbnails[item.id] ? (
                <img
                  src={thumbnails[item.id]}
                  alt={item.name}
                  className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-secondary animate-pulse" />
              )}
              {isLimited(item) && (
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-primary/20 text-profit">
                  {item.itemRestrictions?.includes("LimitedUnique") ? "LTD U" : "LTD"}
                </span>
              )}
            </div>
            <p className="text-xs text-foreground truncate font-medium">{item.name}</p>
            <div className="flex items-center justify-between mt-1.5">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">RAP</p>
                <p className="text-data text-xs text-foreground">{formatRap(item.recentAveragePrice)}</p>
              </div>
              {item.price !== undefined && item.price > 0 && (
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price</p>
                  <p className="text-data text-xs text-profit">{formatRap(item.price)}</p>
                </div>
              )}
            </div>
            {item.creatorName && (
              <p className="text-[10px] text-muted-foreground mt-1.5 truncate">by {item.creatorName}</p>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && !error && (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No items found.</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search or category.</p>
        </div>
      )}

      {hasMore && items.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => loadItems(cursor)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-secondary text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
