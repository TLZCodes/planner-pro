import React from "react";
import { useCanvasState } from "@/lib/canvasStore";
import { cn } from "@/lib/utils";

const FONTS = [
  { label: "Modern Sans", value: "Outfit" },
  { label: "Aesthetic Script", value: "Great Vibes" },
  { label: "Handwritten", value: "Caveat" },
  { label: "Elegant Serif", value: "Playfair Display" },
  { label: "Clean Mono", value: "Roboto Mono" },
  { label: "Classic Roman", value: "Cinzel" },
];

export function TextFormattingToolbar() {
  const state = useCanvasState();
  const activePage = state.journal.pages[state.journal.activePageIndex];
  const activeSelectedId = state.selectedLayerIds[0];
  const selectedLayer = activePage?.layers.find((l) => l.id === activeSelectedId);

  if (!selectedLayer || selectedLayer.type !== "text") return null;

  const {
    fontFamily = "Outfit",
    fontSize = 28,
    color = "#1E1220",
    fontWeight = "bold",
    fontStyle = "normal",
    textAlign = "left",
    curvedText = false,
    textHighlight = "transparent",
    letterSpacing = 0,
    lineHeight = 1.2,
  } = selectedLayer.props;

  const updateProp = (key: string, val: any) => {
    state.updateLayer(selectedLayer.id, {
      props: { ...selectedLayer.props, [key]: val },
    });
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border/60 rounded-full px-4 py-2 shadow-rose-lg flex items-center gap-3 text-ink z-50 animate-fade-in select-none max-w-[90vw] overflow-x-auto no-scrollbar">
      {/* Font Family Picker */}
      <select
        value={fontFamily}
        onChange={(e) => updateProp("fontFamily", e.target.value)}
        className="rounded-xl bg-surface border border-border/40 px-2.5 py-1 text-xs font-bold text-ink outline-none shrink-0"
      >
        {FONTS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Font Size Controls */}
      <div className="flex items-center gap-1 text-xs font-bold shrink-0">
        <button
          onClick={() => updateProp("fontSize", Math.max(10, fontSize - 2))}
          className="h-6 w-6 rounded-full bg-ghost hover:bg-surface flex items-center justify-center"
        >
          -
        </button>
        <span className="font-mono text-xs min-w-[28px] text-center">{fontSize}px</span>
        <button
          onClick={() => updateProp("fontSize", Math.min(120, fontSize + 2))}
          className="h-6 w-6 rounded-full bg-ghost hover:bg-surface flex items-center justify-center"
        >
          +
        </button>
      </div>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Bold & Italic */}
      <div className="flex items-center gap-1 text-xs font-bold shrink-0">
        <button
          onClick={() => updateProp("fontWeight", fontWeight === "bold" ? "normal" : "bold")}
          className={cn(
            "h-7 w-7 rounded-lg transition-colors font-bold",
            fontWeight === "bold" ? "bg-hotpink text-white" : "bg-ghost hover:bg-surface"
          )}
        >
          B
        </button>
        <button
          onClick={() => updateProp("fontStyle", fontStyle === "italic" ? "normal" : "italic")}
          className={cn(
            "h-7 w-7 rounded-lg transition-colors italic font-serif",
            fontStyle === "italic" ? "bg-hotpink text-white" : "bg-ghost hover:bg-surface"
          )}
        >
          I
        </button>
      </div>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Text Highlight Swatch */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] font-bold text-ink-light">Highlight</span>
        {["transparent", "#FFD1DC", "#FFF5BA", "#B5EAD7", "#C7CEEA"].map((c) => (
          <button
            key={c}
            onClick={() => updateProp("textHighlight", c)}
            style={{ backgroundColor: c === "transparent" ? "#fff" : c }}
            className={cn(
              "h-5 w-5 rounded-full border transition-transform flex items-center justify-center text-[8px]",
              textHighlight === c && "ring-2 ring-hotpink ring-offset-1 scale-110"
            )}
          >
            {c === "transparent" && "✕"}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Align Left, Center, Right */}
      <div className="flex items-center gap-1 text-xs shrink-0">
        <button
          onClick={() => updateProp("textAlign", "left")}
          className={cn("p-1 rounded-lg", textAlign === "left" ? "bg-hotpink text-white" : "bg-ghost hover:bg-surface")}
        >
          ⬅
        </button>
        <button
          onClick={() => updateProp("textAlign", "center")}
          className={cn("p-1 rounded-lg", textAlign === "center" ? "bg-hotpink text-white" : "bg-ghost hover:bg-surface")}
        >
          ↔
        </button>
        <button
          onClick={() => updateProp("textAlign", "right")}
          className={cn("p-1 rounded-lg", textAlign === "right" ? "bg-hotpink text-white" : "bg-ghost hover:bg-surface")}
        >
          ➡
        </button>
      </div>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Curved Arc Text */}
      <button
        onClick={() => updateProp("curvedText", !curvedText)}
        className={cn(
          "px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors shrink-0",
          curvedText ? "bg-hotpink text-white shadow-rose-sm" : "bg-ghost hover:bg-surface text-ink"
        )}
      >
        🌈 Arc Text
      </button>

      <div className="h-4 w-px bg-border/60 shrink-0" />

      {/* Text Color Picker */}
      <input
        type="color"
        value={color}
        onChange={(e) => updateProp("color", e.target.value)}
        className="h-6 w-6 rounded-full border-0 p-0 cursor-pointer bg-transparent shrink-0"
        title="Text Color"
      />
    </div>
  );
}
