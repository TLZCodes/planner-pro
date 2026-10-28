import React from "react";
import { useCanvasState } from "@/lib/canvasStore";
import { cn } from "@/lib/utils";

const STAMPS = [
  { symbol: "☐", name: "Checkbox" },
  { symbol: "★", name: "Priority Star" },
  { symbol: "➡", name: "Migrated Arrow" },
  { symbol: "❤", name: "Heart" },
  { symbol: "•", name: "Bullet Dot" },
  { symbol: "❓", name: "Question" },
  { symbol: "❗", name: "Important" },
  { symbol: "☕", name: "Coffee Break" },
];

export function QuickStampsToolbar() {
  const state = useCanvasState();
  const activePage = state.journal.pages[state.journal.activePageIndex];

  if (state.activeTool !== "stamps" || !activePage) return null;

  const handlePlaceStamp = (symbol: string, name: string) => {
    state.addLayer({
      name: `Stamp (${name})`,
      type: "stamp",
      x: activePage.size.width / 2 - 24,
      y: activePage.size.height / 2 - 24,
      width: 48,
      height: 48,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      blendMode: "normal",
      props: {
        stampSymbol: symbol,
      },
    });
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border/60 rounded-full px-4 py-2 shadow-rose-lg flex items-center gap-2 text-ink z-50 animate-fade-in select-none">
      <span className="text-xs font-bold text-hotpink uppercase tracking-wider mr-1">Stamps:</span>
      {STAMPS.map((s) => (
        <button
          key={s.name}
          onClick={() => handlePlaceStamp(s.symbol, s.name)}
          className="h-8 w-8 rounded-full bg-ghost hover:bg-hotpink hover:text-white flex items-center justify-center text-sm font-bold transition-all transform active:scale-90"
          title={`Stamp ${s.name}`}
        >
          {s.symbol}
        </button>
      ))}
    </div>
  );
}
