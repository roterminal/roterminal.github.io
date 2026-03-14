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

export function useRobloxApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (username: string): Promise<RobloxUser | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${ROPROXY_USERS}/users/get-by-username?username=${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      return data;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLimiteds = useCallback(async (cursor?: string): Promise<{ items: LimitedItem[]; nextCursor?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const url = `${ROPROXY_CATALOG}/search/items/details?Category=2&Subcategory=2&Limit=30&SortType=3${cursor ? `&Cursor=${cursor}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch catalog");
      const data = await res.json();
      const items: LimitedItem[] = (data.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        lowestPrice: item.lowestPrice,
        recentAveragePrice: item.recentAveragePrice,
        creatorName: item.creatorName,
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
