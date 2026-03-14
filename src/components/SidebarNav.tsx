import { Search, Package, Users, TrendingUp, BarChart3, Settings } from "lucide-react";
import { useState } from "react";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "market", icon: TrendingUp, label: "Market" },
  { id: "catalog", icon: Package, label: "Catalog" },
  { id: "players", icon: Users, label: "Players" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
];

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-sidebar z-40 flex flex-col items-center py-6 transition-all duration-200"
      style={{
        width: expanded ? 200 : 64,
        boxShadow: "1px 0 0 0 hsl(var(--border))",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="mb-8 flex items-center gap-2 px-4">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">R</span>
        </div>
        {expanded && (
          <span className="text-foreground font-semibold text-sm whitespace-nowrap">RoTerminal</span>
        )}
      </div>

      <nav className="flex flex-col gap-1 w-full px-2 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm ${
              activeTab === item.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <item.icon size={18} />
            {expanded && <span className="whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="px-2 w-full">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors text-sm w-full">
          <Settings size={18} />
          {expanded && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
