import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronRight, Search, X, ChevronDown } from "lucide-react";
import { useRobloxApi, formatRap, type LimitedItem, type CatalogSort, type CatalogCategory } from "@/hooks/use-roblox-api";
import { ItemDetailModal } from "@/components/ItemDetailModal";

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "updated", label: "Recently Updated" },
  { value: "favorited", label: "Most Favorited" },
  { value: "sales", label: "Best Selling" },
  { value: "relevance", label: "Relevance" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "price_asc", label: "Price: Low → High" },
];

const CATEGORY_OPTIONS: { value: CatalogCategory; label: string; emoji: string }[] = [
  { value: "all", label: "All Items", emoji: "📦" },
  { value: "collectibles", label: "Collectibles", emoji: "⭐" },
  { value: "accessories", label: "Accessories", emoji: "👒" },
  { value: "hats", label: "Hats", emoji: "🎩" },
  { value: "faces", label: "Faces", emoji: "😎" },
  { value: "gear", label: "Gear", emoji: "⚔️" },
  { value: "clothing", label: "Clothing", emoji: "👕" },
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
  const [selectedItem, setSelectedItem] = useState<LimitedItem | null>(null);
  const [limitedOnly, setLimitedOnly] = useState(false);

  // Dropdown states
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadItems();
  }, [sort, category, limitedOnly]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCatDropdown(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const handleSearchSubmit = () => {
    setItems([]);
    loadItems();
  };

  const handleCategoryChange = (cat: CatalogCategory) => {
    setCategory(cat);
    setItems([]);
    setShowCatDropdown(false);
  };

  const handleSortChange = (s: CatalogSort) => {
    setSort(s);
    setItems([]);
    setShowSortDropdown(false);
  };

  const isLimited = (item: LimitedItem) =>
    item.itemRestrictions?.includes("Limited") || item.itemRestrictions?.includes("LimitedUnique");

  const currentCat = CATEGORY_OPTIONS.find((c) => c.value === category);
  const currentSort = SORT_OPTIONS.find((s) => s.value === sort);

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
      {/* Filter Bar */}
      {showFilters && (
        <div className="surface-card p-4 mb-5 space-y-3">
          {/* Search row */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                placeholder="Search items by name..."
                className="w-full bg-background rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-shadow"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setItems([]); setTimeout(() => loadItems(), 0); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearchSubmit}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>

          {/* Filter chips row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">Filters:</span>

            {/* Category dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => { setShowCatDropdown(!showCatDropdown); setShowSortDropdown(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  category !== "all" ? "bg-primary/15 text-profit" : "bg-background text-secondary-foreground hover:bg-background/80"
                }`}
              >
                <span>{currentCat?.emoji}</span>
                <span>{currentCat?.label}</span>
                <ChevronDown size={12} className={`transition-transform ${showCatDropdown ? "rotate-180" : ""}`} />
              </button>
              {showCatDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-card rounded-md py-1 z-50 min-w-[180px]" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.5), var(--surface-glow)" }}>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleCategoryChange(opt.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                        category === opt.value ? "bg-primary/15 text-profit" : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => { setShowSortDropdown(!showSortDropdown); setShowCatDropdown(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-background text-secondary-foreground hover:bg-background/80 transition-colors"
              >
                <span>Sort: {currentSort?.label}</span>
                <ChevronDown size={12} className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-card rounded-md py-1 z-50 min-w-[200px]" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.5), var(--surface-glow)" }}>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                        sort === opt.value ? "bg-primary/15 text-profit" : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active filter badges */}
            {search && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-[10px] text-profit">
                "{search}"
                <button onClick={() => { setSearch(""); setItems([]); setTimeout(() => loadItems(), 0); }}>
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {title && (
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">{title}</h2>
      )}

      {loadError && items.length === 0 && (
        <div className="surface-card p-6 text-center">
          <p className="text-loss text-sm mb-1">Failed to load items</p>
          <p className="text-muted-foreground text-xs">{loadError}</p>
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
          <div
            key={item.id}
            className="surface-card p-3 cursor-pointer group"
            onClick={() => setSelectedItem(item)}
          >
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
              {item.price !== undefined && item.price > 0 ? (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price</p>
                  <p className="text-data text-xs text-profit">{formatRap(item.price)}</p>
                </div>
              ) : item.recentAveragePrice ? (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">RAP</p>
                  <p className="text-data text-xs text-foreground">{formatRap(item.recentAveragePrice)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price</p>
                  <p className="text-data text-xs text-muted-foreground">Free</p>
                </div>
              )}
              {item.lowestPrice && item.lowestPrice > 0 && (
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lowest</p>
                  <p className="text-data text-xs text-foreground">{formatRap(item.lowestPrice)}</p>
                </div>
              )}
            </div>
            {item.creatorName && (
              <p className="text-[10px] text-muted-foreground mt-1.5 truncate">by {item.creatorName}</p>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && !isLoading && !loadError && (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No items found.</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search or category.</p>
        </div>
      )}

      {hasMore && items.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => loadItems(cursor)}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-secondary text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
            Load More
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        thumbnailUrl={selectedItem ? thumbnails[selectedItem.id] : undefined}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
