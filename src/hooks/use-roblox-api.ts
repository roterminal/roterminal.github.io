import { useState, useCallback } from "react";

const ROPROXY_USERS = "https://users.roproxy.com/v1";
const ROPROXY_CATALOG = "https://catalog.roproxy.com/v1";
const ROPROXY_ECONOMY = "https://economy.roproxy.com/v1";
const ROPROXY_INVENTORY = "https://inventory.roproxy.com/v1";
const ROPROXY_THUMBNAILS = "https://thumbnails.roproxy.com/v1";

export interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
}

export interface LimitedItem {
  id: number;
  name: string;
  description?: string;
  price?: number;
  lowestPrice?: number;
  recentAveragePrice?: number;
  assetType?: string;
  creatorName?: string;
  thumbnailUrl?: string;
  itemRestrictions?: string[];
}

export interface ResaleData {
  assetStock: number;
  sales: number;
  numberRemaining: number;
  recentAveragePrice: number;
  originalPrice: number;
  priceDataPoints: { value: number; date: string }[];
  volumeDataPoints: { value: number; date: string }[];
}

export interface InventoryItem {
  userAssetId: number;
  assetId: number;
  name: string;
  recentAveragePrice: number;
  originalPrice: number;
  assetStock: number;
  serialNumber?: number;
}

export type CatalogSort = "relevance" | "favorited" | "sales" | "updated" | "price_asc" | "price_desc";
export type CatalogCategory = "all" | "collectibles" | "clothing" | "accessories" | "hats" | "faces" | "gear";

const SORT_MAP: Record<CatalogSort, number> = {
  relevance: 0,
  favorited: 1,
  sales: 2,
  updated: 3,
  price_asc: 4,
  price_desc: 5,
};

const CATEGORY_MAP: Record<CatalogCategory, { category: number; subcategory?: number }> = {
  all: { category: 1 },
  collectibles: { category: 2 },
  clothing: { category: 3 },
  accessories: { category: 11 },
  hats: { category: 11, subcategory: 9 },
  faces: { category: 11, subcategory: 10 },
  gear: { category: 11, subcategory: 5 },
};

export interface CatalogFilters {
  keyword?: string;
  sort?: CatalogSort;
  category?: CatalogCategory;
  limit?: number;
}

export function useRobloxApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (username: string): Promise<RobloxUser | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${ROPROXY_USERS}/users/get-by-username?username=${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error("User not found");
      return await res.json();
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLimiteds = useCallback(async (filters?: CatalogFilters, cursor?: string): Promise<{ items: LimitedItem[]; nextCursor?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const sort = SORT_MAP[filters?.sort || "updated"];
      const cat = CATEGORY_MAP[filters?.category || "all"];
      const limit = filters?.limit || 30;

      const params = new URLSearchParams();
      params.set("Category", String(cat.category));
      if (cat.subcategory) params.set("Subcategory", String(cat.subcategory));
      params.set("Limit", String(limit));
      params.set("SortType", String(sort));
      if (filters?.keyword) params.set("Keyword", filters.keyword);
      if (cursor) params.set("Cursor", cursor);

      const url = `${ROPROXY_CATALOG}/search/items/details?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.errors?.[0]?.message || "Failed to fetch catalog");
      }
      const data = await res.json();
      const items: LimitedItem[] = (data.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        lowestPrice: item.lowestPrice,
        recentAveragePrice: item.recentAveragePrice,
        creatorName: item.creatorName,
        itemRestrictions: item.itemRestrictions,
      }));
      return { items, nextCursor: data.nextPageCursor };
    } catch (e: any) {
      setError(e.message);
      return { items: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResaleData = useCallback(async (assetId: number): Promise<ResaleData | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${ROPROXY_ECONOMY}/assets/${assetId}/resale-data`);
      if (!res.ok) throw new Error("Failed to fetch resale data");
      return await res.json();
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchThumbnails = useCallback(async (assetIds: number[]): Promise<Record<number, string>> => {
    if (assetIds.length === 0) return {};
    try {
      const ids = assetIds.join(",");
      const res = await fetch(`${ROPROXY_THUMBNAILS}/assets?assetIds=${ids}&size=150x150&format=Png`);
      if (!res.ok) return {};
      const data = await res.json();
      const map: Record<number, string> = {};
      (data.data || []).forEach((t: any) => {
        if (t.imageUrl) map[t.targetId] = t.imageUrl;
      });
      return map;
    } catch {
      return {};
    }
  }, []);

  const fetchInventory = useCallback(async (userId: number): Promise<InventoryItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${ROPROXY_INVENTORY}/users/${userId}/assets/collectibles?limit=100&sortOrder=Desc`);
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      return data.data || [];
    } catch (e: any) {
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchUser, fetchLimiteds, fetchResaleData, fetchThumbnails, fetchInventory };
}

export function formatRap(n?: number): string {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
