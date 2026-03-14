import { useState, useEffect } from "react";
import { Search, TrendingUp, Package, Zap, Layers, Star, ArrowRight, Crown } from "lucide-react";
import { SidebarNav } from "@/components/SidebarNav";
import { SearchModal } from "@/components/SearchModal";
import { MarketTicker } from "@/components/MarketTicker";
import { ItemGrid } from "@/components/ItemGrid";
import { PlayerLookup } from "@/components/PlayerLookup";
import { motion } from "framer-motion";

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
        <header
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-md"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center justify-between px-6 py-3">
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              {activeTab === "market" && "Market Overview"}
              {activeTab === "catalog" && "Catalog"}
              {activeTab === "limiteds" && "Limiteds"}
              {activeTab === "players" && "Player Lookup"}
              {activeTab === "analytics" && "Analytics"}
            </h1>
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

        <main className="p-6">
          {activeTab === "market" && <MarketHome onNavigate={setActiveTab} />}
          {activeTab === "catalog" && <ItemGrid />}
          {activeTab === "limiteds" && <ItemGrid initialCategory="collectibles" />}
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
        onSelectUser={() => setActiveTab("players")}
      />
    </div>
  );
};

function MarketHome({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="surface-card p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium uppercase tracking-wider">Live Market</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tighter mb-2">
            Real-time liquidity tracking
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mb-6">
            Track Roblox limited items, search player inventories, and monitor market trends — all in one terminal.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate("catalog")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Package size={14} />
              Browse Catalog
            </button>
            <button
              onClick={() => onNavigate("limiteds")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
            >
              <Crown size={14} />
              Limiteds
            </button>
            <button
              onClick={() => onNavigate("players")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
            >
              <Search size={14} />
              Player Lookup
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: TrendingUp, iconClass: "text-profit", label: "Market Volume", value: "2.4B", sub: "+3.2% 24h", subClass: "text-profit" },
          { icon: Package, iconClass: "text-muted-foreground", label: "Active Limiteds", value: "12,847", sub: "Tracked", subClass: "text-muted-foreground" },
          { icon: Zap, iconClass: "text-warning", label: "Top Gainer", value: "+12.4%", sub: "Legitimate Hat", subClass: "text-muted-foreground" },
          { icon: Star, iconClass: "text-primary", label: "Most Traded", value: "1.2K", sub: "Trades today", subClass: "text-muted-foreground" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="surface-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className={stat.iconClass} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-data text-xl font-semibold text-foreground">{stat.value}</p>
            <p className={`text-data text-xs mt-0.5 ${stat.subClass}`}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Categories</h3>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: Layers, label: "All Items", tab: "catalog" },
            { icon: Crown, label: "Limiteds", tab: "limiteds" },
            { icon: Package, label: "Accessories", tab: "catalog" },
            { icon: "🎩", label: "Hats", tab: "catalog" },
            { icon: "😎", label: "Faces", tab: "catalog" },
            { icon: "⚔️", label: "Gear", tab: "catalog" },
          ].map((c) => (
            <button
              key={c.label}
              onClick={() => onNavigate(c.tab)}
              className="surface-card p-4 flex flex-col items-center gap-2 text-center hover:bg-card-hover transition-colors"
            >
              {typeof c.icon === "string" ? (
                <span className="text-2xl">{c.icon}</span>
              ) : (
                <c.icon size={20} className="text-muted-foreground" />
              )}
              <span className="text-xs text-foreground">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">New & Updated</h3>
          <button
            onClick={() => onNavigate("catalog")}
            className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
          >
            View All <ArrowRight size={12} />
          </button>
        </div>
        <ItemGrid showFilters={false} limit={12} initialSort="updated" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Best Selling</h3>
          <button
            onClick={() => onNavigate("catalog")}
            className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
          >
            View All <ArrowRight size={12} />
          </button>
        </div>
        <ItemGrid showFilters={false} limit={6} initialSort="sales" />
      </div>
    </div>
  );
}

function BarChart3Icon(props: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
    </svg>
  );
}

export default Index;
