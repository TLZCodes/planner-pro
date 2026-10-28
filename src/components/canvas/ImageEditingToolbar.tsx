import React from "react";
import { useCanvasState } from "@/lib/canvasStore";
import type { ShapeKind } from "@/types/canvasTypes";
import { cn } from "@/lib/utils";

export function ImageEditingToolbar() {
  const state = useCanvasState();
  const activePage = state.journal.pages[state.journal.activePageIndex];
  const activeSelectedId = state.selectedLayerIds[0];
  const selectedLayer = activePage?.layers.find((l) => l.id === activeSelectedId);

  if (!selectedLayer || (selectedLayer.type !== "image" && !(selectedLayer.type === "sticker" && selectedLayer.props.src))) {
    return null;
  }

  const {
    filterBrightness = 100,
    filterContrast = 100,
    filterSaturation = 100,
    filterWarmth = 0,
    flipX = false,
    flipY = false,
    cropShape = "rectangle",
    polaroidFrame = false,
    polaroidCaption = "",
  } = selectedLayer.props;

  const updateProp = (key: string, val: any) => {
    state.updateLayer(selectedLayer.id, {
      props: { ...selectedLayer.props, [key]: val },
    });
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border/60 rounded-full px-4 py-2 shadow-rose-lg flex items-center gap-3 text-ink z-50 animate-fade-in select-none max-w-[90vw] overflow-x-auto no-scrollbar">
      {/* Polaroid Preset Toggle */}
      <button
        onClick={() => updateProp("polaroidFrame", !polaroidFrame)}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-bold transition-all border shrink-0",
          polaroidFrame
            ? "bg-hotpink text-white border-hotpink shadow-rose-sm"
            : "bg-surface text-ink border-border/40 hover:border-hotpink"
        )}
      >
        🖼️ Polaroid Frame
      </button>

      {polaroidFrame && (
        <input
          type="text"
          placeholder="Polaroid caption..."
          value={polaroidCaption}
          onChange={(e) => updateProp("polaroidCaption", e.target.value)}
          className="rounded-xl bg-surface border border-border/40 px-3 py-1 text-xs font-bold text-ink outline-none w-36 shrink-0"
        />
      )}

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Shape Mask Dropdown */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-bold text-ink-light">Mask</span>
        <select
          value={cropShape}
          onChange={(e) => updateProp("cropShape", e.target.value as ShapeKind)}
          className="rounded-xl bg-surface border border-border/40 px-2.5 py-1 text-xs font-bold text-ink outline-none"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="rounded-rectangle">Rounded</option>
          <option value="star">Star</option>
          <option value="heart">Heart</option>
        </select>
      </div>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Flip Horizontal / Vertical */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => updateProp("flipX", !flipX)}
          className={cn(
            "p-1.5 rounded-lg text-xs font-bold transition-colors",
            flipX ? "bg-hotpink text-white" : "bg-ghost hover:bg-surface text-ink"
          )}
          title="Flip Horizontal"
        >
          ⇄ Flip H
        </button>
        <button
          onClick={() => updateProp("flipY", !flipY)}
          className={cn(
            "p-1.5 rounded-lg text-xs font-bold transition-colors",
            flipY ? "bg-hotpink text-white" : "bg-ghost hover:bg-surface text-ink"
          )}
          title="Flip Vertical"
        >
          ⇅ Flip V
        </button>
      </div>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Sliders: Brightness & Saturation */}
      <div className="flex items-center gap-2 text-xs font-bold shrink-0">
        <span className="text-ink-light">☀️</span>
        <input
          type="range"
          min="50"
          max="150"
          value={filterBrightness}
          onChange={(e) => updateProp("filterBrightness", parseInt(e.target.value))}
          className="w-16 accent-hotpink cursor-pointer"
          title="Brightness"
        />
        <span className="text-ink-light">🎨</span>
        <input
          type="range"
          min="0"
          max="200"
          value={filterSaturation}
          onChange={(e) => updateProp("filterSaturation", parseInt(e.target.value))}
          className="w-16 accent-hotpink cursor-pointer"
          title="Saturation"
        />
      </div>
    </div>
  );
}
