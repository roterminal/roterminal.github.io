import { supabase } from "@/integrations/supabase/client";

type ProxyRequest = {
  api: 'users' | 'catalog' | 'economy' | 'inventory' | 'thumbnails' | 'games' | 'search';
  path: string;
  params?: Record<string, string>;
};

async function robloxProxy<T = any>(request: ProxyRequest): Promise<T> {
  const { data, error } = await supabase.functions.invoke('roblox-proxy', {
    body: request,
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || 'API request failed');
  return data.data as T;
}

export const robloxApi = {
  // Users
  async searchUsers(keyword: string, limit = 10) {
    return robloxProxy({
      api: 'users',
      path: '/v1/users/search',
      params: { keyword, limit: String(limit) },
    });
  },

  async getUserByUsername(username: string) {
    return robloxProxy({
      api: 'users',
      path: '/v1/users/get-by-username',
      params: { username },
    });
  },

  // Catalog
  async searchCatalog(params: {
    keyword?: string;
    Category?: string;
    Subcategory?: string;
    SortType?: string;
    Limit?: string;
    Cursor?: string;
  }) {
    return robloxProxy({
      api: 'catalog',
      path: '/v1/search/items/details',
      params: params as Record<string, string>,
    });
  },

  // Economy
  async getResaleData(assetId: number) {
    return robloxProxy({
      api: 'economy',
      path: `/v1/assets/${assetId}/resale-data`,
    });
  },

  // Inventory
  async getUserCollectibles(userId: number, limit = 100) {
    return robloxProxy({
      api: 'inventory',
      path: `/v1/users/${userId}/assets/collectibles`,
      params: { limit: String(limit), sortOrder: 'Desc' },
    });
  },

  // Thumbnails
  async getAssetThumbnails(assetIds: number[], size = '150x150') {
    return robloxProxy({
      api: 'thumbnails',
      path: '/v1/assets',
      params: { assetIds: assetIds.join(','), size, format: 'Png' },
    });
  },

  async getUserAvatarThumbnails(userIds: number[], size = '150x150') {
    return robloxProxy({
      api: 'thumbnails',
      path: '/v1/users/avatar-headshot',
      params: { userIds: userIds.join(','), size, format: 'Png' },
    });
  },

  // Games
  async searchGames(keyword: string) {
    return robloxProxy({
      api: 'games',
      path: '/v1/games/list',
      params: { 'model.keyword': keyword },
    });
  },
};
