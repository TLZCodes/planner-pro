import React, { useState, useEffect } from "react";
import { useCanvasState } from "@/lib/canvasStore";
import { cn } from "@/lib/utils";

interface StickerItem {
  id: string;
  symbol: string;
  name: string;
  category: string;
}

const STICKER_CATEGORIES = [
  { key: "all", label: "All Elements", icon: "✨" },
  { key: "favs", label: "Favorites", icon: "❤️" },
  { key: "florals", label: "Florals", icon: "🌸" },
  { key: "celestial", label: "Celestial", icon: "🌙" },
  { key: "kawaii", label: "Kawaii", icon: "🧸" },
  { key: "y2k", label: "Y2K & Retro", icon: "⚡" },
  { key: "minimal", label: "Minimal", icon: "🌿" },
  { key: "badges", label: "Badges", icon: "🏅" },
  { key: "icons", label: "Icons", icon: "☀️" },
  { key: "doodles", label: "Doodles", icon: "〰️" },
  { key: "washi", label: "Washi Tape", icon: "🏷️" },
  { key: "sticky", label: "Sticky Notes", icon: "📝" },
];

const STICKERS_DATA: StickerItem[] = [
  // Florals
  { id: "s1", symbol: "🌸", name: "Cherry Blossom", category: "florals" },
  { id: "s2", symbol: "🌺", name: "Hibiscus", category: "florals" },
  { id: "s3", symbol: "🌻", name: "Sunflower", category: "florals" },
  { id: "s4", symbol: "🌿", name: "Botanical Leaf", category: "florals" },
  { id: "s5", symbol: "🌷", name: "Tulip", category: "florals" },
  { id: "s6", symbol: "🌹", name: "Rose", category: "florals" },
  { id: "s7", symbol: "🍀", name: "Four Leaf Clover", category: "florals" },

  // Celestial
  { id: "c1", symbol: "🌙", name: "Crescent Moon", category: "celestial" },
  { id: "c2", symbol: "✨", name: "Sparkles", category: "celestial" },
  { id: "c3", symbol: "⭐", name: "Star", category: "celestial" },
  { id: "c4", symbol: "☄️", name: "Comet", category: "celestial" },
  { id: "c5", symbol: "☀️", name: "Sun", category: "celestial" },
  { id: "c6", symbol: "🪐", name: "Saturn Planet", category: "celestial" },

  // Kawaii
  { id: "k1", symbol: "🧸", name: "Teddy Bear", category: "kawaii" },
  { id: "k2", symbol: "🎀", name: "Pink Ribbon", category: "kawaii" },
  { id: "k3", symbol: "🍓", name: "Strawberry", category: "kawaii" },
  { id: "k4", symbol: "🍰", name: "Cake Slice", category: "kawaii" },
  { id: "k5", symbol: "🐱", name: "Cat Face", category: "kawaii" },
  { id: "k6", symbol: "🍦", name: "Ice Cream", category: "kawaii" },

  // Y2K
  { id: "y1", symbol: "⚡", name: "Lightning Bolt", category: "y2k" },
  { id: "y2", symbol: "💿", name: "CD Disc", category: "y2k" },
  { id: "y3", symbol: "👾", name: "Alien Pixel", category: "y2k" },
  { id: "y4", symbol: "💖", name: "Sparkle Heart", category: "y2k" },
  { id: "y5", symbol: "🪩", name: "Disco Ball", category: "y2k" },

  // Minimal
  { id: "m1", symbol: "☕", name: "Coffee Cup", category: "minimal" },
  { id: "m2", symbol: "🕊️", name: "Dove", category: "minimal" },
  { id: "m3", symbol: "📖", name: "Open Book", category: "minimal" },
  { id: "m4", symbol: "🕯️", name: "Candle", category: "minimal" },
  { id: "m5", symbol: "🎨", name: "Palette", category: "minimal" },

  // Badges
  { id: "b1", symbol: "🏅", name: "Gold Medal", category: "badges" },
  { id: "b2", symbol: "🏆", name: "Trophy", category: "badges" },
  { id: "b3", symbol: "👑", name: "Crown", category: "badges" },
  { id: "b4", symbol: "🎯", name: "Bullseye Target", category: "badges" },

  // Icons
  { id: "i1", symbol: "🏃", name: "Runner", category: "icons" },
  { id: "i2", symbol: "🌧️", name: "Rain Cloud", category: "icons" },
  { id: "i3", symbol: "❄️", name: "Snowflake", category: "icons" },
  { id: "i4", symbol: "🌈", name: "Rainbow", category: "icons" },

  // Doodles
  { id: "d1", symbol: "〰️", name: "Wavy Line", category: "doodles" },
  { id: "d2", symbol: "➰", name: "Loop Ribbon", category: "doodles" },
  { id: "d3", symbol: "➡", name: "Arrow Right", category: "doodles" },

  // Washi & Sticky
  { id: "w1", symbol: "🏷️", name: "Pastel Stripe Tape", category: "washi" },
  { id: "w2", symbol: "🎀", name: "Floral Tape", category: "washi" },
  { id: "st1", symbol: "📝", name: "Yellow Memo", category: "sticky" },
  { id: "st2", symbol: "📌", name: "Pushpin", category: "sticky" },
];

const FAVORITES_KEY = "ayxa_favorite_stickers_v1";

interface StickerLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StickerLibraryModal({ isOpen, onClose }: StickerLibraryModalProps) {
  const state = useCanvasState();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch (err) {}
  }, []);

  if (!isOpen) return null;

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(updated);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (err) {}
  };

  const filteredStickers = STICKERS_DATA.filter((st) => {
    if (activeCategory === "favs") return favorites.includes(st.id);
    const matchesCategory = activeCategory === "all" || st.category === activeCategory;
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlaceSticker = (item: StickerItem) => {
    const activePage = state.journal.pages[state.journal.activePageIndex];
    if (!activePage) return;

    if (item.category === "washi") {
      state.addLayer({
        name: `Washi Tape (${item.name})`,
        type: "washiTape",
        x: activePage.size.width / 2 - 120,
        y: activePage.size.height / 2 - 20,
        width: 240,
        height: 36,
        rotation: -4,
        opacity: 0.9,
        locked: false,
        visible: true,
        blendMode: "normal",
        props: {
          pattern: "stripes",
          tapeColor: "#FF69B4",
        },
      });
    } else {
      state.addLayer({
        name: `Sticker (${item.name})`,
        type: "sticker",
        x: activePage.size.width / 2 - 50,
        y: activePage.size.height / 2 - 50,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        blendMode: "normal",
        props: {
          stampSymbol: item.symbol,
          stickerCategory: item.category,
        },
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border/60 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-rose-lg text-ink">
        {/* Header */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h2 className="text-lg font-extrabold text-ink">Stickers & Elements Library</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-ghost flex items-center justify-center font-bold text-xs hover:bg-hotpink hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-border/40 space-y-3">
          <input
            type="text"
            placeholder="Search 50+ stickers, washi tape, stamps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-surface border border-border/60 px-4 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
          />

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {STICKER_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                  activeCategory === cat.key
                    ? "bg-hotpink text-white border-hotpink shadow-rose-sm"
                    : "bg-ghost border-transparent text-ink-light hover:text-ink hover:bg-surface"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sticker Items Grid */}
        <div className="p-4 flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-5 gap-3">
          {filteredStickers.map((item) => {
            const isFav = favorites.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handlePlaceSticker(item)}
                className="relative flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-border/40 hover:border-hotpink hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm group"
              >
                <button
                  onClick={(e) => toggleFavorite(item.id, e)}
                  className="absolute top-1 right-1 text-xs text-hotpink"
                  title={isFav ? "Remove Favorite" : "Add Favorite"}
                >
                  {isFav ? "❤️" : "🤍"}
                </button>
                <span className="text-4xl group-hover:animate-bounce">{item.symbol}</span>
                <span className="mt-2 text-[10px] font-bold text-ink-light text-center truncate w-full">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
