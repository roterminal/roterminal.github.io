import { useState } from "react";
import { Search, Loader2, User } from "lucide-react";
import { useRobloxApi, type RobloxUser, type InventoryItem } from "@/hooks/use-roblox-api";

export function PlayerLookup() {
  const { loading, error, fetchUser, fetchInventory, fetchThumbnails } = useRobloxApi();
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<RobloxUser | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!username.trim()) return;
    setSearched(true);
    const u = await fetchUser(username.trim());
    setUser(u);
    if (u) {
      const inv = await fetchInventory(u.id);
      setInventory(inv);
    }
  };

  const totalRap = inventory.reduce((sum, item) => sum + (item.recentAveragePrice || 0), 0);

  function formatRap(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
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

      {user && (
        <div className="space-y-4">
          <div className="surface-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
              <User size={20} className="text-muted-foreground" />
            </div>
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

      {searched && !user && !loading && (
        <div className="surface-card p-8 text-center text-sm text-loss">
          User not found. Check the username and try again.
        </div>
      )}
    </div>
  );
}
