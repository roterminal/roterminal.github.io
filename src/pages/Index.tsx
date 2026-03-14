import { useState, useEffect } from "react";
import { Search, TrendingUp, Package, Zap } from "lucide-react";
import { SidebarNav } from "@/components/SidebarNav";
import { SearchModal } from "@/components/SearchModal";
import { MarketTicker } from "@/components/MarketTicker";
import { ItemGrid } from "@/components/ItemGrid";
import { PlayerLookup } from "@/components/PlayerLookup";

const Index = () => {
  const [activeTab, setActiveTab] = useState("market");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="ml-16">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-md"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                {activeTab === "market" && "Market Overview"}
                {activeTab === "catalog" && "Limited Catalog"}
                {activeTab === "players" && "Player Lookup"}
                {activeTab === "analytics" && "Analytics"}
              </h1>
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search size={14} />
              <span>Search...</span>
              <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded ml-4">⌘K</kbd>
            </button>
          </div>
          <MarketTicker />
        </header>

        {/* Content */}
        <main className="p-6">
          {activeTab === "market" && (
            <div className="space-y-6">
              {/* Stats row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="surface-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-profit" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Market Volume</span>
                  </div>
                  <p className="text-data text-2xl font-semibold text-foreground">2.4B</p>
                  <p className="text-data text-xs text-profit mt-1">+3.2% 24h</p>
                </div>
                <div className="surface-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Active Limiteds</span>
                  </div>
                  <p className="text-data text-2xl font-semibold text-foreground">12,847</p>
                  <p className="text-data text-xs text-muted-foreground mt-1">Tracked items</p>
                </div>
                <div className="surface-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-warning" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Top Gainer</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Perfectly Legitimate Hat</p>
                  <p className="text-data text-xs text-profit mt-1">+12.4%</p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Recently Updated Limiteds</h2>
                <ItemGrid />
              </div>
            </div>
          )}

          {activeTab === "catalog" && <ItemGrid />}
          {activeTab === "players" && <PlayerLookup />}
          {activeTab === "analytics" && (
            <div className="surface-card p-12 text-center">
              <BarChart3Icon className="mx-auto mb-3 text-muted-foreground" size={32} />
              <p className="text-sm text-muted-foreground">Analytics coming soon.</p>
              <p className="text-xs text-muted-foreground mt-1">Price charts, volume trends, and portfolio tracking.</p>
            </div>
          )}
        </main>
      </div>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectUser={(user) => {
          setActiveTab("players");
        }}
      />
    </div>
  );
};

function BarChart3Icon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
}

export default Index;
