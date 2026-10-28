import React, { useRef, useState, useEffect } from "react";
import type { CanvasLayer, CanvasPoint, StrokePath } from "@/types/canvasTypes";
import { useCanvasState } from "@/lib/canvasStore";
import { cn } from "@/lib/utils";

interface CanvasEngineProps {
  onSelectLayer?: (id: string, multiSelect?: boolean) => void;
  onUpdateTextInline?: (id: string, newText: string) => void;
}

export function CanvasEngine({ onSelectLayer, onUpdateTextInline }: CanvasEngineProps) {
  const state = useCanvasState();
  const activePage = state.journal.pages[state.journal.activePageIndex];

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<CanvasPoint[]>([]);

  // Selected layer drag/transform state
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [layerStartPos, setLayerStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Magnetic Snapping Guides
  const [guideX, setGuideX] = useState<number | null>(null);
  const [guideY, setGuideY] = useState<number | null>(null);

  // Inline text editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState("");

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextId) return;

      const isMeta = e.ctrlKey || e.metaKey;

      if (isMeta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) state.redo();
        else state.undo();
      } else if (isMeta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        state.redo();
      } else if (isMeta && e.key.toLowerCase() === "c") {
        e.preventDefault();
        state.copySelectedLayers();
      } else if (isMeta && e.key.toLowerCase() === "v") {
        e.preventDefault();
        state.pasteLayers();
      } else if (isMeta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        state.duplicateLayers();
      } else if (isMeta && e.key.toLowerCase() === "a") {
        e.preventDefault();
        if (activePage) state.setSelectedLayerIds(activePage.layers.map((l) => l.id));
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedLayerIds.length) {
          e.preventDefault();
          state.deleteLayers();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingTextId, state.selectedLayerIds, activePage]);

  if (!activePage) return null;

  const { width: pageWidth, height: pageHeight } = activePage.size;

  // Zoom & Pan Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      state.setZoom((z) => Math.max(0.1, Math.min(4.0, z * zoomFactor)));
    } else {
      state.setPanOffset((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Touch Pinch & 2-finger Pan Gestures for Mobile / Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchDistanceRef.current = dist;
      isPanningRef.current = true;
      startPanRef.current = {
        x: (t1.clientX + t2.clientX) / 2 - state.panOffset.x,
        y: (t1.clientY + t2.clientY) / 2 - state.panOffset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scale = currentDist / touchDistanceRef.current;
      touchDistanceRef.current = currentDist;

      state.setZoom((z) => Math.max(0.2, Math.min(3.5, z * scale)));

      const currentMidX = (t1.clientX + t2.clientX) / 2;
      const currentMidY = (t1.clientY + t2.clientY) / 2;
      state.setPanOffset({
        x: currentMidX - startPanRef.current.x,
        y: currentMidY - startPanRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
    isPanningRef.current = false;
  };

  const handlePointerDownContainer = (e: React.PointerEvent) => {
    if (e.button === 1 || (state.activeTool === "select" && e.target === containerRef.current)) {
      isPanningRef.current = true;
      startPanRef.current = { x: e.clientX - state.panOffset.x, y: e.clientY - state.panOffset.y };
      containerRef.current?.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMoveContainer = (e: React.PointerEvent) => {
    if (isPanningRef.current) {
      state.setPanOffset({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handlePointerUpContainer = (e: React.PointerEvent) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      try {
        containerRef.current?.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  // Canvas Coordinates Helper
  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2 + state.panOffset.x;
    const centerY = rect.height / 2 + state.panOffset.y;
    const x = (clientX - rect.left - centerX) / state.zoom + pageWidth / 2;
    const y = (clientY - rect.top - centerY) / state.zoom + pageHeight / 2;
    return { x, y };
  };

  // Handle Freehand Pen Strokes
  const handlePagePointerDown = (e: React.PointerEvent) => {
    if (state.activeTool === "pen") {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      const pressure = e.pressure || 0.5;
      setIsDrawing(true);
      setCurrentStroke([{ x, y, pressure }]);
    }
  };

  const handlePagePointerMove = (e: React.PointerEvent) => {
    if (isDrawing && state.activeTool === "pen") {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      const pressure = e.pressure || 0.5;
      setCurrentStroke((prev) => [...prev, { x, y, pressure }]);
    }

    if (draggingLayerId) {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      let targetX = layerStartPos.x + (x - dragStartPos.x);
      let targetY = layerStartPos.y + (y - dragStartPos.y);

      // Magnetic center snapping
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      const snapThreshold = 14;

      if (Math.abs(targetX - centerX) < snapThreshold) {
        targetX = centerX;
        setGuideX(centerX);
      } else {
        setGuideX(null);
      }

      if (Math.abs(targetY - centerY) < snapThreshold) {
        targetY = centerY;
        setGuideY(centerY);
      } else {
        setGuideY(null);
      }

      state.updateLayer(draggingLayerId, { x: targetX, y: targetY });
    }
  };

  const handlePagePointerUp = () => {
    if (isDrawing && state.activeTool === "pen" && currentStroke.length > 1) {
      setIsDrawing(false);
      const stroke: StrokePath = {
        id: `stroke_${Date.now()}`,
        points: currentStroke,
        color: state.brushColor,
        width: state.brushWidth,
        opacity: state.brushOpacity,
        brushStyle: state.brushStyle,
      };

      const drawingLayer = activePage.layers.find((l) => l.type === "drawing" && !l.locked);
      if (drawingLayer) {
        const existing = drawingLayer.props.strokes || [];
        state.updateLayer(drawingLayer.id, {
          props: { ...drawingLayer.props, strokes: [...existing, stroke] },
        });
      } else {
        state.addLayer({
          name: "Freehand Vector",
          type: "drawing",
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          blendMode: "normal",
          props: { strokes: [stroke] },
        });
      }
      setCurrentStroke([]);
    }

    if (draggingLayerId) {
      setDraggingLayerId(null);
      setGuideX(null);
      setGuideY(null);
    }
  };

  // Layer Select & Drag
  const handleLayerPointerDown = (e: React.PointerEvent, layer: CanvasLayer) => {
    e.stopPropagation();
    if (state.activeTool !== "select") return;
    if (layer.locked) return;

    state.selectLayer(layer.id, e.shiftKey);
    setDraggingLayerId(layer.id);
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setDragStartPos(coords);
    setLayerStartPos({ x: layer.x, y: layer.y });
  };

  const sortedLayers = [...activePage.layers].sort((a, b) => a.zIndex - b.zIndex);
  const selectedLayer = activePage.layers.find((l) => state.selectedLayerIds.includes(l.id));

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDownContainer}
      onPointerMove={handlePointerMoveContainer}
      onPointerUp={handlePointerUpContainer}
      className="relative flex-1 w-full h-full overflow-hidden bg-[#16141c] select-none cursor-grab active:cursor-grabbing"
    >
      {/* Centered Zoom/Pan Workspace Transform */}
      <div
        className="absolute top-1/2 left-1/2 transition-transform duration-75 ease-out origin-center"
        style={{
          transform: `translate(-50%, -50%) translate(${state.panOffset.x}px, ${state.panOffset.y}px) scale(${state.zoom})`,
        }}
      >
        {/* Canvas Page Container */}
        <div
          onPointerDown={handlePagePointerDown}
          onPointerMove={handlePagePointerMove}
          onPointerUp={handlePagePointerUp}
          style={{
            width: pageWidth,
            height: pageHeight,
            backgroundColor: activePage.background.color || "#FFFBF7",
          }}
          className="relative shadow-2xl rounded-sm overflow-hidden border border-border/40"
        >
          {/* Background Grid Pattern Overlay */}
          {activePage.background.type === "dotted" && (
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: `radial-gradient(${activePage.background.gridColor || "#E2D9D0"} 1.5px, transparent 1.5px)`,
                backgroundSize: `${activePage.background.gridSize || 24}px ${activePage.background.gridSize || 24}px`,
              }}
            />
          )}

          {activePage.background.type === "grid" && (
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: `linear-gradient(to right, ${activePage.background.gridColor || "#E2D9D0"} 1px, transparent 1px), linear-gradient(to bottom, ${activePage.background.gridColor || "#E2D9D0"} 1px, transparent 1px)`,
                backgroundSize: `${activePage.background.gridSize || 24}px ${activePage.background.gridSize || 24}px`,
              }}
            />
          )}

          {activePage.background.type === "lined" && (
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: `linear-gradient(to bottom, ${activePage.background.gridColor || "#E2D9D0"} 1px, transparent 1px)`,
                backgroundSize: `100% ${activePage.background.gridSize || 28}px`,
              }}
            />
          )}

          {/* Magnetic Alignment Guides */}
          {guideX !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-hotpink z-[9999] pointer-events-none shadow-rose-sm"
              style={{ left: guideX }}
            />
          )}
          {guideY !== null && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-hotpink z-[9999] pointer-events-none shadow-rose-sm"
              style={{ top: guideY }}
            />
          )}

          {/* Render All Layers */}
          {sortedLayers.map((layer) => {
            if (!layer.visible) return null;
            const isSelected = state.selectedLayerIds.includes(layer.id);

            const filterStyle = layer.props.filterBrightness !== undefined
              ? `brightness(${layer.props.filterBrightness}%) contrast(${layer.props.filterContrast || 100}%) saturate(${layer.props.filterSaturation || 100}%)`
              : "none";

            const transformFlip = `${layer.props.flipX ? "scaleX(-1)" : ""} ${layer.props.flipY ? "scaleY(-1)" : ""}`.trim();

            return (
              <div
                key={layer.id}
                onPointerDown={(e) => handleLayerPointerDown(e, layer)}
                onDoubleClick={() => {
                  if (layer.type === "text") {
                    setEditingTextId(layer.id);
                    setEditingTextValue(layer.props.text || "");
                  }
                }}
                style={{
                  position: "absolute",
                  left: layer.x,
                  top: layer.y,
                  width: layer.width,
                  height: layer.height,
                  transform: `rotate(${layer.rotation}deg) ${transformFlip}`,
                  opacity: layer.opacity,
                  zIndex: layer.zIndex,
                  mixBlendMode: layer.blendMode,
                  filter: filterStyle,
                }}
                className={cn(
                  "group cursor-pointer transition-shadow",
                  isSelected && "ring-2 ring-hotpink ring-offset-2 ring-offset-card shadow-rose-lg",
                  layer.locked && "pointer-events-none opacity-80"
                )}
              >
                {/* Polaroid Frame Container Preset */}
                {layer.props.polaroidFrame ? (
                  <div className="w-full h-full bg-white p-3 shadow-md rounded border border-border/40 flex flex-col justify-between">
                    <div className="flex-1 w-full bg-gray-100 overflow-hidden rounded flex items-center justify-center">
                      {layer.props.src ? (
                        <img src={layer.props.src} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{layer.props.stampSymbol || "🖼️"}</span>
                      )}
                    </div>
                    <span className="text-center font-serif text-sm text-gray-800 pt-2 font-bold truncate">
                      {layer.props.polaroidCaption || "Memory ✨"}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Layer Content */}
                    {layer.type === "text" && (
                      <div
                        style={{
                          fontFamily: layer.props.fontFamily || "Hacen Tehran",
                          fontSize: `${layer.props.fontSize || 28}px`,
                          fontWeight: layer.props.fontWeight || "bold",
                          color: layer.props.color || "#1E1220",
                          textAlign: layer.props.textAlign || "right",
                          backgroundColor: layer.props.textHighlight || "transparent",
                          direction: "rtl",
                        }}
                        className="w-full h-full flex items-center justify-center p-1 leading-tight select-none font-arabic"
                      >
                        {editingTextId === layer.id ? (
                          <textarea
                            
                            value={editingTextValue}
                            onChange={(e) => setEditingTextValue(e.target.value)}
                            onBlur={() => {
                              state.updateLayer(layer.id, { props: { ...layer.props, text: editingTextValue } });
                              setEditingTextId(null);
                            }}
                            className="bg-surface text-ink p-2 rounded-xl border border-hotpink outline-none w-full h-full text-right font-arabic"
                          />
                        ) : (
                          layer.props.text || "انقري مرتين للتعديل..."
                        )}
                      </div>
                    )}

                    {layer.type === "shape" && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: layer.props.fillColor || "#FF1493",
                          borderColor: layer.props.borderColor || "#1E1220",
                          borderWidth: `${layer.props.borderWidth || 2}px`,
                          borderRadius: layer.props.shapeKind === "circle" ? "50%" : `${layer.props.borderRadius || 16}px`,
                        }}
                        className="shadow-sm"
                      />
                    )}

                    {(layer.type === "sticker" || layer.type === "stamp") && (
                      <div className="w-full h-full flex items-center justify-center text-4xl select-none">
                        {layer.props.src ? (
                          <img src={layer.props.src} className="w-full h-full object-contain" />
                        ) : (
                          layer.props.stampSymbol || "🌟"
                        )}
                      </div>
                    )}

                    {layer.type === "washiTape" && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: layer.props.tapeColor || "#FF69B4",
                        }}
                        className="w-full h-full shadow-md rounded opacity-90 border-t border-b border-white/40"
                      />
                    )}

                    {/* Vector Pen Drawing Overlay */}
                    {layer.type === "drawing" && layer.props.strokes && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {layer.props.strokes.map((stroke) => (
                          <path
                            key={stroke.id}
                            d={stroke.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`, "")}
                            stroke={stroke.color}
                            strokeWidth={stroke.width}
                            strokeOpacity={stroke.opacity}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ))}
                      </svg>
                    )}
                  </>
                )}

                {/* Selected Transform Handles */}
                {isSelected && !layer.locked && (
                  <>
                    <div className="absolute -top-3 -left-3 w-5 h-5 bg-hotpink border-2 border-white rounded-full shadow-md" />
                    <div className="absolute -top-3 -right-3 w-5 h-5 bg-hotpink border-2 border-white rounded-full shadow-md" />
                    <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-hotpink border-2 border-white rounded-full shadow-md" />
                    <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-hotpink border-2 border-white rounded-full shadow-md" />
                  </>
                )}
              </div>
            );
          })}

          {/* Active Freehand Pen Stroke Overlay */}
          {isDrawing && currentStroke.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-[9999]">
              <path
                d={currentStroke.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`, "")}
                stroke={state.brushColor}
                strokeWidth={state.brushWidth}
                strokeOpacity={state.brushOpacity}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Floating Selected Layer Mobile Action Bar */}
      {selectedLayer && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-hotpink/60 shadow-rose-lg text-ink animate-fade-in font-arabic text-xs font-extrabold">
          <button
            onClick={() => state.duplicateLayers()}
            className="px-2.5 py-1 rounded-full bg-surface hover:bg-hotpink hover:text-white transition-colors"
            title="تكرار"
          >
            👯 تكرار
          </button>
          <button
            onClick={() => {
              const id = state.selectedLayerIds[0];
              if (id) state.reorderLayer(id, "up");
            }}
            className="px-2.5 py-1 rounded-full bg-surface hover:bg-hotpink hover:text-white transition-colors"
            title="تقديم للأمام"
          >
            ⬆️ تقديم
          </button>
          <button
            onClick={() => {
              const id = state.selectedLayerIds[0];
              if (id) state.reorderLayer(id, "down");
            }}
            className="px-2.5 py-1 rounded-full bg-surface hover:bg-hotpink hover:text-white transition-colors"
            title="تأخير للخلف"
          >
            ⬇️ تأخير
          </button>
          <button
            onClick={() => state.updateLayer(selectedLayer.id, { locked: !selectedLayer.locked })}
            className="px-2.5 py-1 rounded-full bg-surface hover:bg-hotpink hover:text-white transition-colors"
            title="قفل"
          >
            {selectedLayer.locked ? "🔓 إغلاق" : "🔒 قفل"}
          </button>
          <button
            onClick={() => state.deleteLayers()}
            className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
            title="حذف"
          >
            🗑️ حذف
          </button>
        </div>
      )}

      {/* Floating Zoom & Canvas Reset Bar */}
      <div className="absolute bottom-20 right-4 flex items-center gap-2 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/40 shadow-rose-sm text-xs font-bold text-ink z-50">
        <button onClick={() => state.setZoom((z) => Math.max(0.2, z - 0.1))} className="hover:text-hotpink px-1 font-mono text-sm">
          -
        </button>
        <span className="font-mono min-w-[42px] text-center">{Math.round(state.zoom * 100)}%</span>
        <button onClick={() => state.setZoom((z) => Math.min(3.5, z + 0.1))} className="hover:text-hotpink px-1 font-mono text-sm">
          +
        </button>
        <button
          onClick={() => {
            state.setZoom(1.0);
            state.setPanOffset({ x: 0, y: 0 });
          }}
          className="ml-1 text-[10px] text-hotpink uppercase tracking-wider hover:underline font-bold"
        >
          إعادة
        </button>
      </div>
    </div>
  );
}
