import React from "react";
import { useCanvasState } from "@/lib/canvasStore";
import type { BrushStyle } from "@/types/canvasTypes";
import { cn } from "@/lib/utils";

const BRUSHES: { key: BrushStyle; label: string; icon: string }[] = [
  { key: "fineliner", label: "Fine Liner", icon: "✏️" },
  { key: "marker", label: "Highlighter", icon: "🖍️" },
  { key: "watercolor", label: "Watercolor", icon: "🎨" },
  { key: "calligraphy", label: "Calligraphy", icon: "✒️" },
  { key: "dashed", label: "Dashed Line", icon: "✂️" },
  { key: "glitter", label: "Glitter", icon: "✨" },
];

const PRESET_COLORS = [
  "#FF1493",
  "#A78BFA",
  "#2DD4BF",
  "#3B82F6",
  "#FCD34D",
  "#FB923C",
  "#1E1220",
  "#FFFFFF",
];

export function DrawingToolbar() {
  const state = useCanvasState();

  if (state.activeTool !== "pen" && state.activeTool !== "eraser") return null;

  // Eyedropper Handler using Native EyeDropper API
  const handleEyeDropper = async () => {
    if ("EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          state.setBrushColor(result.sRGBHex);
        }
      } catch (err) {}
    }
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border/60 rounded-full px-4 py-2 shadow-rose-lg flex items-center gap-3 text-ink z-50 animate-fade-in select-none max-w-[90vw] overflow-x-auto no-scrollbar">
      {/* Brushes */}
      <div className="flex items-center gap-1 shrink-0">
        {BRUSHES.map((b) => (
          <button
            key={b.key}
            onClick={() => {
              state.setBrushStyle(b.key);
              state.setActiveTool("pen");
            }}
            title={b.label}
            className={cn(
              "p-1.5 rounded-full text-xs transition-all",
              state.activeTool === "pen" && state.brushStyle === b.key
                ? "bg-hotpink text-white shadow-rose-sm scale-110"
                : "bg-ghost hover:bg-surface text-ink"
            )}
          >
            {b.icon}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Eraser */}
      <button
        onClick={() => state.setActiveTool("eraser")}
        title="Eraser Tool"
        className={cn(
          "p-1.5 rounded-full text-xs transition-all shrink-0",
          state.activeTool === "eraser"
            ? "bg-hotpink text-white shadow-rose-sm scale-110"
            : "bg-ghost hover:bg-surface text-ink"
        )}
      >
        🧹
      </button>

      {/* Shape Assist Line Straightener */}
      <button
        onClick={() => state.toggleShapeAssist()}
        title="Shape Assist (Auto-straighten lines)"
        className={cn(
          "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border shrink-0",
          state.shapeAssist
            ? "bg-hotpink text-white border-hotpink shadow-rose-sm"
            : "bg-ghost border-transparent hover:bg-surface text-ink"
        )}
      >
        📐 Straighten
      </button>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Stroke Width */}
      <div className="flex items-center gap-2 text-xs font-bold shrink-0">
        <span className="text-ink-light">Size</span>
        <input
          type="range"
          min="1"
          max="32"
          value={state.brushWidth}
          onChange={(e) => state.setBrushWidth(parseInt(e.target.value))}
          className="w-20 accent-hotpink cursor-pointer"
        />
        <span className="font-mono text-[10px] min-w-[20px]">{state.brushWidth}px</span>
      </div>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Eyedropper & Color Swatches */}
      <div className="flex items-center gap-1.5 shrink-0">
        {"EyeDropper" in window && (
          <button
            onClick={handleEyeDropper}
            className="p-1 rounded-lg bg-ghost hover:bg-surface text-xs font-bold"
            title="Pick color from canvas"
          >
            🧪 Eyedropper
          </button>
        )}

        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => state.setBrushColor(c)}
            style={{ backgroundColor: c }}
            className={cn(
              "h-5 w-5 rounded-full border border-black/20 transition-transform",
              state.brushColor === c && "ring-2 ring-hotpink ring-offset-1 scale-110"
            )}
          />
        ))}
        <input
          type="color"
          value={state.brushColor}
          onChange={(e) => state.setBrushColor(e.target.value)}
          className="h-6 w-6 rounded-full border-0 p-0 cursor-pointer bg-transparent"
        />
      </div>
    </div>
  );
}
