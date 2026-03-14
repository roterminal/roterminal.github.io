import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useRobloxApi, type RobloxUser, type LimitedItem } from "@/hooks/use-roblox-api";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectUser?: (user: RobloxUser) => void;
}

export function SearchModal({ open, onClose, onSelectUser }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RobloxUser | null>(null);
  const { loading, fetchUser } = useRobloxApi();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) {
          // Parent should handle opening
        }
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const user = await fetchUser(query.trim());
    setResults(user);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-backdrop flex items-start justify-center pt-[20vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card rounded-lg w-full max-w-xl overflow-hidden"
            style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8), var(--surface-glow)" }}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 gap-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <Search size={18} className="text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search players, items..."
                className="flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {loading && <Loader2 size={16} className="text-muted-foreground animate-spin" />}
              <kbd className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">ESC</kbd>
            </div>

            {results && (
              <div className="p-2">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors text-left"
                  onClick={() => {
                    onSelectUser?.(results);
                    onClose();
                  }}
                >
                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-xs font-mono text-muted-foreground">
                    {results.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{results.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{results.name}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground font-mono">ID: {results.id}</span>
                </button>
              </div>
            )}

            {!results && !loading && query && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Press Enter to search for "{query}"
              </div>
            )}

            {!query && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Type a username or item name to search
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
