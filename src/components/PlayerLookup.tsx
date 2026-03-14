import { useState } from "react";
import { Search, Loader2, User } from "lucide-react";
import { useRobloxApi, formatRap, type RobloxUser, type InventoryItem } from "@/hooks/use-roblox-api";
import { robloxApi } from "@/lib/roblox-api";

export function PlayerLookup() {
  const { loading, error, fetchUser, searchUsers, fetchInventory, fetchUserAvatar } = useRobloxApi();
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<RobloxUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchResults, setSearchResults] = useState<RobloxUser[]>([]);
  const [searchAvatars, setSearchAvatars] = useState<Record<number, string>>({});
  const [searched, setSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!username.trim()) return;
    setSearched(true);
    setUser(null);
    setInventory([]);
    setAvatarUrl(null);

    // Try exact match first
    const u = await fetchUser(username.trim());
    if (u) {
      selectUser(u);
    } else {
      // Fall back to search
      const results = await searchUsers(username.trim());
      setSearchResults(results);
      setShowResults(true);
      // Fetch avatars for all results
      if (results.length > 0) {
        const ids = results.map((u: RobloxUser) => u.id);
        const data = await robloxApi.getUserAvatarThumbnails(ids);
        const map: Record<number, string> = {};
        (data.data || []).forEach((t: any) => {
          if (t.imageUrl) map[t.targetId] = t.imageUrl;
        });
        setSearchAvatars(map);
      }
    }
  };

  const selectUser = async (u: RobloxUser) => {
    setUser(u);
    setShowResults(false);
    setSearchResults([]);
    const [inv, avatar] = await Promise.all([
      fetchInventory(u.id),
      fetchUserAvatar(u.id),
    ]);
    setInventory(inv);
    setAvatarUrl(avatar);
  };

  const totalRap = inventory.reduce((sum, item) => sum + (item.recentAveragePrice || 0), 0);

  return (
    <div className="max-w-3xl">
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Roblox username..."
            className="w-full bg-secondary rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-shadow"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !username.trim()}
          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Search"}
        </button>
      </div>

      {/* Search results dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="surface-card mb-4 overflow-hidden">
          <p className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            {searchResults.length} users found
          </p>
          {searchResults.map((u) => (
            <button
              key={u.id}
              onClick={() => selectUser(u)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-card-hover transition-colors text-left"
              style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}
            >
              {searchAvatars[u.id] ? (
                <img src={searchAvatars[u.id]} alt={u.displayName} className="w-8 h-8 rounded-md bg-secondary object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-xs font-mono text-muted-foreground">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm text-foreground">{u.displayName}</p>
                <p className="text-xs text-muted-foreground">@{u.name}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground font-mono">ID: {u.id}</span>
            </button>
          ))}
        </div>
      )}

      {user && (
        <div className="space-y-4">
          <div className="surface-card p-4 flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.displayName} className="w-12 h-12 rounded-md bg-secondary object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
                <User size={20} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-foreground font-semibold">{user.displayName}</h3>
              <p className="text-sm text-muted-foreground">@{user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total RAP</p>
              <p className="text-data text-lg text-profit font-semibold">{formatRap(totalRap)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Items</p>
              <p className="text-data text-lg text-foreground font-semibold">{inventory.length}</p>
            </div>
          </div>

          {inventory.length > 0 && (
            <div className="surface-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Item</th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">RAP</th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Serial</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr
                      key={item.userAssetId}
                      className="hover:bg-card-hover transition-colors"
                      style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}
                    >
                      <td className="px-4 py-2.5 text-foreground">{item.name}</td>
                      <td className="px-4 py-2.5 text-right text-data text-profit">{formatRap(item.recentAveragePrice)}</td>
                      <td className="px-4 py-2.5 text-right text-data text-muted-foreground">
                        {item.serialNumber ? `#${item.serialNumber}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {inventory.length === 0 && !loading && (
            <div className="surface-card p-8 text-center text-sm text-muted-foreground">
              No collectibles found in this player's inventory.
            </div>
          )}
        </div>
      )}

      {searched && !user && !loading && searchResults.length === 0 && (
        <div className="surface-card p-8 text-center text-sm text-loss">
          User not found. Check the username and try again.
        </div>
      )}
    </div>
  );
}
