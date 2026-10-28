import React, { useState } from "react";
import { useCanvasState } from "@/lib/canvasStore";
import type { BlendModeType } from "@/types/canvasTypes";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  onClose?: () => void;
}

export function LayersPanel({ onClose }: LayersPanelProps) {
  const state = useCanvasState();
  const activePage = state.journal.pages[state.journal.activePageIndex];
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  if (!activePage) return null;

  const layersTopFirst = [...activePage.layers].sort((a, b) => b.zIndex - a.zIndex);
  const activeSelectedId = state.selectedLayerIds[0];
  const selectedLayer = activePage.layers.find((l) => l.id === activeSelectedId);

  return (
    <div className="w-80 h-full bg-card border-l border-border/60 p-4 flex flex-col justify-between shadow-rose-lg z-50 animate-fade-in text-ink select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <h3 className="font-extrabold text-[15px] text-ink">Layers ({activePage.layers.length})</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-full bg-ghost flex items-center justify-center text-xs font-bold hover:bg-hotpink hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Group / Ungroup Toolbar */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => state.groupSelectedLayers()}
            disabled={state.selectedLayerIds.length < 2}
            className="flex-1 bg-surface border border-border/40 py-1 text-[11px] font-bold rounded-xl hover:border-hotpink disabled:opacity-30 transition-colors"
          >
            📦 Group ({state.selectedLayerIds.length})
          </button>
          <button
            onClick={() => state.ungroupSelectedLayers()}
            disabled={!state.selectedLayerIds.length}
            className="flex-1 bg-surface border border-border/40 py-1 text-[11px] font-bold rounded-xl hover:border-hotpink disabled:opacity-30 transition-colors"
          >
            📂 Ungroup
          </button>
        </div>

        {/* Selected Layer Properties Inspector */}
        {selectedLayer && (
          <div className="rounded-2xl bg-surface border border-border/40 p-3 mb-3 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              {renamingId === selectedLayer.id ? (
                <input
                  
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => {
                    if (renameValue.trim()) state.updateLayer(selectedLayer.id, { name: renameValue.trim() });
                    setRenamingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (renameValue.trim()) state.updateLayer(selectedLayer.id, { name: renameValue.trim() });
                      setRenamingId(null);
                    }
                  }}
                  className="bg-card text-ink px-2 py-0.5 rounded border border-hotpink outline-none text-xs font-bold w-36"
                />
              ) : (
                <span
                  onDoubleClick={() => {
                    setRenamingId(selectedLayer.id);
                    setRenameValue(selectedLayer.name);
                  }}
                  className="text-xs font-bold text-hotpink uppercase tracking-wider truncate max-w-[150px] cursor-pointer"
                  title="Double click to rename"
                >
                  ✏️ {selectedLayer.name}
                </span>
              )}

              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => state.reorderLayer(selectedLayer.id, "up")}
                  title="Move Layer Up"
                  className="p-1 rounded bg-ghost hover:bg-hotpink hover:text-white transition-colors"
                >
                  ▲
                </button>
                <button
                  onClick={() => state.reorderLayer(selectedLayer.id, "down")}
                  title="Move Layer Down"
                  className="p-1 rounded bg-ghost hover:bg-hotpink hover:text-white transition-colors"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-ink-light mb-1">
                <span>Opacity</span>
                <span>{Math.round((selectedLayer.opacity || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={selectedLayer.opacity || 1}
                onChange={(e) => state.updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                className="w-full accent-hotpink cursor-pointer"
              />
            </div>

            {/* Blend Mode Selector */}
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">Blend Mode</label>
              <select
                value={selectedLayer.blendMode || "normal"}
                onChange={(e) => state.setLayerBlendMode(selectedLayer.id, e.target.value as BlendModeType)}
                className="w-full rounded-xl bg-ghost border border-border/40 p-1.5 text-xs font-bold text-ink outline-none"
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
              </select>
            </div>
          </div>
        )}

        {/* Layers List */}
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {layersTopFirst.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-ink-light">
              No layers yet. Add text, stickers or drawings! ✨
            </div>
          ) : (
            layersTopFirst.map((layer) => {
              const isSelected = state.selectedLayerIds.includes(layer.id);

              return (
                <div
                  key={layer.id}
                  onClick={() => state.selectLayer(layer.id)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer",
                    isSelected
                      ? "bg-surface border-hotpink ring-2 ring-hotpink/30 shadow-sm"
                      : "bg-ghost border-transparent hover:border-border/60 opacity-90"
                  )}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-base shrink-0">
                      {layer.type === "text" && "🔤"}
                      {layer.type === "shape" && "📐"}
                      {layer.type === "sticker" && "🌸"}
                      {layer.type === "drawing" && "🎨"}
                      {layer.type === "washiTape" && "🏷️"}
                      {layer.type === "stamp" && "⭐"}
                    </span>
                    <span className="text-xs font-bold text-ink truncate max-w-[120px]">
                      {layer.groupId ? `[G] ${layer.name}` : layer.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => state.toggleVisibilityLayer(layer.id)}
                      className={cn(
                        "p-1 rounded-lg text-xs transition-colors",
                        layer.visible ? "text-ink hover:text-hotpink" : "text-ink-light/40"
                      )}
                      title={layer.visible ? "Hide Layer" : "Show Layer"}
                    >
                      {layer.visible ? "👁️" : "🙈"}
                    </button>

                    <button
                      onClick={() => state.toggleLockLayer(layer.id)}
                      className={cn(
                        "p-1 rounded-lg text-xs transition-colors",
                        layer.locked ? "text-hotpink font-bold" : "text-ink-light/40 hover:text-ink"
                      )}
                      title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                    >
                      {layer.locked ? "🔒" : "🔓"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Layer Actions Footer */}
      <div className="pt-3 border-t border-border/40 grid grid-cols-2 gap-2">
        <button
          onClick={() => state.duplicateLayers()}
          disabled={!state.selectedLayerIds.length}
          className="rounded-full bg-ghost py-2 text-xs font-bold text-ink hover:bg-surface disabled:opacity-40 transition-colors"
        >
          Duplicate
        </button>
        <button
          onClick={() => state.deleteLayers()}
          disabled={!state.selectedLayerIds.length}
          className="rounded-full bg-rose-500/10 text-rose-500 py-2 text-xs font-bold hover:bg-rose-500 hover:text-white disabled:opacity-40 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
