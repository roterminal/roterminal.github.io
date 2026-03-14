import { useState, useCallback } from "react";
import { robloxApi } from "@/lib/roblox-api";

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

const SORT_MAP: Record<CatalogSort, string> = {
  relevance: "0", favorited: "1", sales: "2", updated: "3", price_asc: "4", price_desc: "5",
};

const CATEGORY_MAP: Record<CatalogCategory, { Category: string; Subcategory?: string }> = {
  all: { Category: "1" },
  collectibles: { Category: "1", Subcategory: "2" },
  clothing: { Category: "3" },
  accessories: { Category: "11" },
  hats: { Category: "11", Subcategory: "9" },
  faces: { Category: "11", Subcategory: "10" },
  gear: { Category: "11", Subcategory: "5" },
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
      const data = await robloxApi.getUserByUsername(username);
      return data;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (keyword: string): Promise<RobloxUser[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await robloxApi.searchUsers(keyword);
      return data.data || [];
    } catch (e: any) {
      setError(e.message);
      return [];
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
      const limit = String(filters?.limit || 30);

      const params: Record<string, string> = {
        ...cat,
        Limit: limit,
        SortType: sort,
      };
      if (filters?.keyword) params.Keyword = filters.keyword;
      if (cursor) params.Cursor = cursor;

      const data = await robloxApi.searchCatalog(params);
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

  const fetchThumbnails = useCallback(async (assetIds: number[]): Promise<Record<number, string>> => {
    if (assetIds.length === 0) return {};
    try {
      const data = await robloxApi.getAssetThumbnails(assetIds);
      const map: Record<number, string> = {};
      (data.data || []).forEach((t: any) => {
        if (t.imageUrl) map[t.targetId] = t.imageUrl;
      });
      return map;
    } catch {
      return {};
    }
  }, []);

  const fetchUserAvatar = useCallback(async (userId: number): Promise<string | null> => {
    try {
      const data = await robloxApi.getUserAvatarThumbnails([userId]);
      return data.data?.[0]?.imageUrl || null;
    } catch {
      return null;
    }
  }, []);

  const fetchInventory = useCallback(async (userId: number): Promise<InventoryItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await robloxApi.getUserCollectibles(userId);
      return data.data || [];
    } catch (e: any) {
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchUser, searchUsers, fetchLimiteds, fetchThumbnails, fetchUserAvatar, fetchInventory };
}

export function formatRap(n?: number): string {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
