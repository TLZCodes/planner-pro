import React from "react";
import type {
  JournalDocument,
  JournalPage,
  CanvasLayer,
  ActiveTool,
  PageBackground,
  BrushStyle,
  ShapeKind,
} from "@/types/canvasTypes";

const STORAGE_KEY = "ayxa_canvas_journal_v1";

export const DEFAULT_PAGE_SIZE = {
  name: "A5" as const,
  width: 1240,
  height: 1754,
};

export const DEFAULT_BACKGROUND: PageBackground = {
  type: "dotted",
  color: "#FFFBF7",
  gridColor: "#E2D9D0",
  gridSize: 24,
};

export function createNewPage(title = "Page 1"): JournalPage {
  return {
    pageId: `page_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    size: DEFAULT_PAGE_SIZE,
    background: { ...DEFAULT_BACKGROUND },
    layers: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createNewJournal(title = "My AYXA Bullet Journal"): JournalDocument {
  return {
    id: `j_${Date.now()}`,
    title,
    isLocked: false,
    pinCode: "",
    pages: [createNewPage("Weekly Spread 🌸")],
    activePageIndex: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export interface CanvasState {
  journal: JournalDocument;
  activeTool: ActiveTool;
  selectedLayerIds: string[];
  clipboardLayers: CanvasLayer[];
  zoom: number; // 0.1 to 4.0
  panOffset: { x: number; y: number };
  showGrid: boolean;
  snapToGrid: boolean;

  // Brush settings
  brushColor: string;
  brushWidth: number;
  brushOpacity: number;
  brushStyle: BrushStyle;
  eraserMode: "object" | "pixel";
  shapeAssist: boolean;

  // Text defaults
  activeFontFamily: string;
  activeFontSize: number;
  activeTextColor: string;

  // History stack
  history: JournalPage[];
  historyIndex: number;

  // Actions
  setActiveTool: (tool: ActiveTool) => void;
  setSelectedLayerIds: (ids: string[]) => void;
  selectLayer: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  toggleShapeAssist: () => void;

  // Brush settings actions
  setBrushColor: (color: string) => void;
  setBrushWidth: (width: number) => void;
  setBrushOpacity: (opacity: number) => void;
  setBrushStyle: (style: BrushStyle) => void;
  setEraserMode: (mode: "object" | "pixel") => void;

  // Layer CRUD & Grouping
  addLayer: (layer: Omit<CanvasLayer, "id" | "zIndex">) => string;
  updateLayer: (id: string, updates: Partial<CanvasLayer> | ((prev: CanvasLayer) => Partial<CanvasLayer>)) => void;
  deleteLayers: (ids?: string[]) => void;
  duplicateLayers: (ids?: string[]) => void;
  copySelectedLayers: () => void;
  pasteLayers: () => void;
  groupSelectedLayers: () => void;
  ungroupSelectedLayers: () => void;
  reorderLayer: (id: string, direction: "up" | "down" | "top" | "bottom") => void;
  toggleLockLayer: (id: string) => void;
  toggleVisibilityLayer: (id: string) => void;
  setLayerBlendMode: (id: string, blendMode: CanvasLayer["blendMode"]) => void;

  // Background
  setPageBackground: (background: Partial<PageBackground>) => void;

  // Multi-Page
  setActivePageIndex: (index: number) => void;
  addPage: (template?: JournalPage) => void;
  duplicateCurrentPage: () => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  deletePage: (index: number) => void;

  // Privacy Lock
  setJournalLockPin: (pin: string) => void;
  unlockJournalWithPin: (pin: string) => boolean;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  saveHistorySnapshot: () => void;

  // Storage
  loadJournalFromStorage: () => void;
  saveJournalToStorage: () => void;
  importJournalJSON: (jsonString: string) => boolean;
}

type Listener = () => void;

let currentState: CanvasState;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

function loadInitialJournal(): JournalDocument {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.pages && parsed.pages.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load saved journal:", e);
    }
  }
  return createNewJournal();
}

const initialJournal = loadInitialJournal();

currentState = {
  journal: initialJournal,
  activeTool: "select",
  selectedLayerIds: [],
  clipboardLayers: [],
  zoom: 1.0,
  panOffset: { x: 0, y: 0 },
  showGrid: true,
  snapToGrid: true,

  brushColor: "#FF1493",
  brushWidth: 6,
  brushOpacity: 1,
  brushStyle: "fineliner",
  eraserMode: "object",
  shapeAssist: false,

  activeFontFamily: "Outfit",
  activeFontSize: 28,
  activeTextColor: "#1E1220",

  history: [initialJournal.pages[initialJournal.activePageIndex || 0]],
  historyIndex: 0,

  setActiveTool: (tool) => {
    currentState.activeTool = tool;
    notify();
  },

  setSelectedLayerIds: (ids) => {
    currentState.selectedLayerIds = ids;
    notify();
  },

  selectLayer: (id, multiSelect = false) => {
    if (multiSelect) {
      if (currentState.selectedLayerIds.includes(id)) {
        currentState.selectedLayerIds = currentState.selectedLayerIds.filter((x) => x !== id);
      } else {
        currentState.selectedLayerIds = [...currentState.selectedLayerIds, id];
      }
    } else {
      currentState.selectedLayerIds = [id];
    }
    notify();
  },

  clearSelection: () => {
    currentState.selectedLayerIds = [];
    notify();
  },

  setZoom: (zoom) => {
    const nextZoom = typeof zoom === "function" ? zoom(currentState.zoom) : zoom;
    currentState.zoom = Math.max(0.1, Math.min(4.0, nextZoom));
    notify();
  },

  setPanOffset: (offset) => {
    currentState.panOffset = typeof offset === "function" ? offset(currentState.panOffset) : offset;
    notify();
  },

  toggleGrid: () => {
    currentState.showGrid = !currentState.showGrid;
    notify();
  },

  toggleSnapToGrid: () => {
    currentState.snapToGrid = !currentState.snapToGrid;
    notify();
  },

  toggleShapeAssist: () => {
    currentState.shapeAssist = !currentState.shapeAssist;
    notify();
  },

  setBrushColor: (color) => {
    currentState.brushColor = color;
    notify();
  },

  setBrushWidth: (width) => {
    currentState.brushWidth = width;
    notify();
  },

  setBrushOpacity: (opacity) => {
    currentState.brushOpacity = opacity;
    notify();
  },

  setBrushStyle: (style) => {
    currentState.brushStyle = style;
    notify();
  },

  setEraserMode: (mode) => {
    currentState.eraserMode = mode;
    notify();
  },

  saveHistorySnapshot: () => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;
    const pageCopy = JSON.parse(JSON.stringify(currentPage));
    const newHistory = currentState.history.slice(0, currentState.historyIndex + 1);
    newHistory.push(pageCopy);
    if (newHistory.length > 50) newHistory.shift();
    currentState.history = newHistory;
    currentState.historyIndex = newHistory.length - 1;
    currentState.saveJournalToStorage();
  },

  addLayer: (layerData) => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return "";
    const newId = `layer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const maxZ = currentPage.layers.reduce((max, l) => Math.max(max, l.zIndex), 0);

    const newLayer: CanvasLayer = {
      ...layerData,
      id: newId,
      zIndex: maxZ + 1,
      locked: layerData.locked ?? false,
      visible: layerData.visible ?? true,
      blendMode: layerData.blendMode ?? "normal",
    };

    currentPage.layers.push(newLayer);
    currentState.selectedLayerIds = [newId];
    currentState.saveHistorySnapshot();
    notify();
    return newId;
  },

  updateLayer: (id, updates) => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;
    const idx = currentPage.layers.findIndex((l) => l.id === id);
    if (idx === -1) return;

    const layer = currentPage.layers[idx];
    if (layer.locked && (updates as any).locked === undefined) return;

    const resolvedUpdates = typeof updates === "function" ? updates(layer) : updates;
    currentPage.layers[idx] = {
      ...layer,
      ...resolvedUpdates,
      props: {
        ...layer.props,
        ...(resolvedUpdates.props || {}),
      },
    };
    currentState.saveJournalToStorage();
    notify();
  },

  deleteLayers: (ids) => {
    const targetIds = ids || currentState.selectedLayerIds;
    if (!targetIds.length) return;
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;

    currentPage.layers = currentPage.layers.filter((l) => !targetIds.includes(l.id));
    currentState.selectedLayerIds = currentState.selectedLayerIds.filter((id) => !targetIds.includes(id));
    currentState.saveHistorySnapshot();
    notify();
  },

  duplicateLayers: (ids) => {
    const targetIds = ids || currentState.selectedLayerIds;
    if (!targetIds.length) return;
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;

    const newSelectedIds: string[] = [];
    const maxZ = currentPage.layers.reduce((max, l) => Math.max(max, l.zIndex), 0);

    targetIds.forEach((id, idx) => {
      const original = currentPage.layers.find((l) => l.id === id);
      if (!original) return;
      const dupId = `layer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const duplicate: CanvasLayer = JSON.parse(JSON.stringify(original));
      duplicate.id = dupId;
      duplicate.name = `${original.name} (Copy)`;
      duplicate.x += 20;
      duplicate.y += 20;
      duplicate.zIndex = maxZ + idx + 1;
      currentPage.layers.push(duplicate);
      newSelectedIds.push(dupId);
    });

    currentState.selectedLayerIds = newSelectedIds;
    currentState.saveHistorySnapshot();
    notify();
  },

  copySelectedLayers: () => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage || !currentState.selectedLayerIds.length) return;
    const selected = currentPage.layers.filter((l) => currentState.selectedLayerIds.includes(l.id));
    currentState.clipboardLayers = JSON.parse(JSON.stringify(selected));
    notify();
  },

  pasteLayers: () => {
    if (!currentState.clipboardLayers.length) return;
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;

    const maxZ = currentPage.layers.reduce((max, l) => Math.max(max, l.zIndex), 0);
    const pastedIds: string[] = [];

    currentState.clipboardLayers.forEach((item, idx) => {
      const newId = `layer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const pasted: CanvasLayer = JSON.parse(JSON.stringify(item));
      pasted.id = newId;
      pasted.x += 30;
      pasted.y += 30;
      pasted.zIndex = maxZ + idx + 1;
      currentPage.layers.push(pasted);
      pastedIds.push(newId);
    });

    currentState.selectedLayerIds = pastedIds;
    currentState.saveHistorySnapshot();
    notify();
  },

  groupSelectedLayers: () => {
    if (currentState.selectedLayerIds.length < 2) return;
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;

    const groupId = `group_${Date.now()}`;
    currentPage.layers.forEach((l) => {
      if (currentState.selectedLayerIds.includes(l.id)) {
        l.groupId = groupId;
      }
    });
    currentState.saveHistorySnapshot();
    notify();
  },

  ungroupSelectedLayers: () => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;

    currentPage.layers.forEach((l) => {
      if (currentState.selectedLayerIds.includes(l.id)) {
        l.groupId = undefined;
      }
    });
    currentState.saveHistorySnapshot();
    notify();
  },

  reorderLayer: (id, direction) => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;
    const layers = currentPage.layers.sort((a, b) => a.zIndex - b.zIndex);
    const idx = layers.findIndex((l) => l.id === id);
    if (idx === -1) return;

    if (direction === "up" && idx < layers.length - 1) {
      const temp = layers[idx].zIndex;
      layers[idx].zIndex = layers[idx + 1].zIndex;
      layers[idx + 1].zIndex = temp;
    } else if (direction === "down" && idx > 0) {
      const temp = layers[idx].zIndex;
      layers[idx].zIndex = layers[idx - 1].zIndex;
      layers[idx - 1].zIndex = temp;
    } else if (direction === "top") {
      const maxZ = layers.reduce((max, l) => Math.max(max, l.zIndex), 0);
      layers[idx].zIndex = maxZ + 1;
    } else if (direction === "bottom") {
      const minZ = layers.reduce((min, l) => Math.min(min, l.zIndex), 0);
      layers[idx].zIndex = Math.max(1, minZ - 1);
    }

    currentState.saveHistorySnapshot();
    notify();
  },

  toggleLockLayer: (id) => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;
    const layer = currentPage.layers.find((l) => l.id === id);
    if (layer) {
      layer.locked = !layer.locked;
      currentState.saveHistorySnapshot();
      notify();
    }
  },

  toggleVisibilityLayer: (id) => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;
    const layer = currentPage.layers.find((l) => l.id === id);
    if (layer) {
      layer.visible = !layer.visible;
      currentState.saveHistorySnapshot();
      notify();
    }
  },

  setLayerBlendMode: (id, blendMode) => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;
    const layer = currentPage.layers.find((l) => l.id === id);
    if (layer) {
      layer.blendMode = blendMode;
      currentState.saveHistorySnapshot();
      notify();
    }
  },

  setPageBackground: (backgroundUpdates) => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;
    currentPage.background = {
      ...currentPage.background,
      ...backgroundUpdates,
    };
    currentState.saveHistorySnapshot();
    notify();
  },

  setActivePageIndex: (index) => {
    if (index < 0 || index >= currentState.journal.pages.length) return;
    currentState.journal.activePageIndex = index;
    currentState.selectedLayerIds = [];
    const activePage = currentState.journal.pages[index];
    currentState.history = [JSON.parse(JSON.stringify(activePage))];
    currentState.historyIndex = 0;
    currentState.saveJournalToStorage();
    notify();
  },

  addPage: (template) => {
    const pageCount = currentState.journal.pages.length + 1;
    const newPage = template ? JSON.parse(JSON.stringify(template)) : createNewPage(`Page ${pageCount}`);
    newPage.pageId = `page_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    currentState.journal.pages.push(newPage);
    currentState.setActivePageIndex(currentState.journal.pages.length - 1);
  },

  duplicateCurrentPage: () => {
    const currentPage = currentState.journal.pages[currentState.journal.activePageIndex];
    if (!currentPage) return;
    const dupPage: JournalPage = JSON.parse(JSON.stringify(currentPage));
    dupPage.pageId = `page_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    dupPage.title = `${currentPage.title} (Copy)`;
    currentState.journal.pages.splice(currentState.journal.activePageIndex + 1, 0, dupPage);
    currentState.setActivePageIndex(currentState.journal.activePageIndex + 1);
  },

  reorderPages: (fromIndex, toIndex) => {
    if (
      fromIndex < 0 ||
      fromIndex >= currentState.journal.pages.length ||
      toIndex < 0 ||
      toIndex >= currentState.journal.pages.length
    ) {
      return;
    }
    const [moved] = currentState.journal.pages.splice(fromIndex, 1);
    currentState.journal.pages.splice(toIndex, 0, moved);
    currentState.journal.activePageIndex = toIndex;
    currentState.saveJournalToStorage();
    notify();
  },

  deletePage: (index) => {
    if (currentState.journal.pages.length <= 1) return;
    currentState.journal.pages.splice(index, 1);
    const nextIndex = Math.min(index, currentState.journal.pages.length - 1);
    currentState.setActivePageIndex(nextIndex);
  },

  setJournalLockPin: (pin) => {
    currentState.journal.pinCode = pin;
    currentState.journal.isLocked = !!pin;
    currentState.saveJournalToStorage();
    notify();
  },

  unlockJournalWithPin: (pin) => {
    if (!currentState.journal.isLocked || currentState.journal.pinCode === pin) {
      return true;
    }
    return false;
  },

  undo: () => {
    if (currentState.historyIndex > 0) {
      currentState.historyIndex--;
      const snapshot = currentState.history[currentState.historyIndex];
      currentState.journal.pages[currentState.journal.activePageIndex] = JSON.parse(JSON.stringify(snapshot));
      currentState.saveJournalToStorage();
      notify();
    }
  },

  redo: () => {
    if (currentState.historyIndex < currentState.history.length - 1) {
      currentState.historyIndex++;
      const snapshot = currentState.history[currentState.historyIndex];
      currentState.journal.pages[currentState.journal.activePageIndex] = JSON.parse(JSON.stringify(snapshot));
      currentState.saveJournalToStorage();
      notify();
    }
  },

  loadJournalFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.pages && parsed.pages.length > 0) {
          currentState.journal = parsed;
          notify();
        }
      }
    } catch (e) {
      console.error("Failed to load journal:", e);
    }
  },

  saveJournalToStorage: () => {
    if (typeof window === "undefined") return;
    try {
      currentState.journal.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState.journal));
    } catch (e) {
      console.error("Failed to save journal:", e);
    }
  },

  importJournalJSON: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.pages && Array.isArray(parsed.pages)) {
        currentState.journal = parsed;
        currentState.setActivePageIndex(0);
        return true;
      }
    } catch (e) {
      console.error("Failed to import JSON:", e);
    }
    return false;
  },
};

export function getCanvasState(): CanvasState {
  return currentState;
}

export function useCanvasState(): CanvasState {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const handler = () => setTick((t: number) => t + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return currentState;
}

