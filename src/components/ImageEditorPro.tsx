import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Crop,
  Maximize2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  PenTool,
  Type,
  Square,
  Circle,
  ArrowRight,
  Download,
  Undo2,
  Redo2,
  Trash2,
  FileText,
  Sparkles,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  Layers,
  Palette,
  Image as ImageIcon,
  Move,
  RefreshCw,
  Plus,
  Copy,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import jsPDF from "jspdf";

// Sample preset images for instant demo
const SAMPLE_IMAGES = [
  {
    name: "🌸 Aesthetic Planner",
    url: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&auto=format&fit=crop&q=80"
  },
  {
    name: "☕ Study Desk Vibe",
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=80"
  },
  {
    name: "🌷 Pink Floral Art",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&auto=format&fit=crop&q=80"
  },
  {
    name: "🌙 Barakah & Peaceful Night",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&auto=format&fit=crop&q=80"
  }
];

// Color palette
const EDITOR_COLORS = [
  "#2B1E1A", "#D95389", "#EC4899", "#8B5CF6", "#3B82F6",
  "#10B981", "#F59E0B", "#EF4444", "#FFFFFF", "#64748B"
];

// Filters preset definitions
const FILTER_PRESETS = [
  { id: "normal", name: "Normal", filter: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, invert: 0, hue: 0 } },
  { id: "vintage", name: "Vintage 📜", filter: { brightness: 105, contrast: 90, saturation: 80, blur: 0, grayscale: 0, sepia: 40, invert: 0, hue: 0 } },
  { id: "pastel", name: "Pastel Dream 🌸", filter: { brightness: 115, contrast: 105, saturation: 120, blur: 0, grayscale: 0, sepia: 15, invert: 0, hue: 340 } },
  { id: "noir", name: "B&W Noir 🖤", filter: { brightness: 100, contrast: 130, saturation: 0, blur: 0, grayscale: 100, sepia: 0, invert: 0, hue: 0 } },
  { id: "golden", name: "Golden Hour ☀️", filter: { brightness: 110, contrast: 110, saturation: 130, blur: 0, grayscale: 0, sepia: 25, invert: 0, hue: 20 } },
  { id: "emerald", name: "Barakah Emerald 🌿", filter: { brightness: 105, contrast: 110, saturation: 125, blur: 0, grayscale: 0, sepia: 0, invert: 0, hue: 90 } },
  { id: "cool", name: "Cool Breeze 🌊", filter: { brightness: 105, contrast: 105, saturation: 110, blur: 0, grayscale: 0, sepia: 0, invert: 0, hue: 180 } },
  { id: "cyber", name: "Cyber Pop 💜", filter: { brightness: 110, contrast: 140, saturation: 150, blur: 0, grayscale: 0, sepia: 0, invert: 0, hue: 280 } },
];

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bg?: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
}

export interface ShapeOverlay {
  id: string;
  type: "rect" | "circle" | "arrow" | "star";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  fill?: string;
  strokeWidth: number;
}

export interface DrawingStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  isHighlighter: boolean;
}

export function ImageEditorPro() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  // Section Tab: Image Editor vs PDF Tools
  const [sectionTab, setSectionTab] = useState<"image" | "pdf">("image");

  // Primary image state
  const [imageSrc, setImageSrc] = useState<string | null>(SAMPLE_IMAGES[0].url);
  const [imageName, setImageName] = useState<string>("AYXA_Edited_Image");
  const [imageDim, setImageDim] = useState<{ w: number; h: number }>({ w: 800, h: 600 });

  // History stack for Undo/Redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<
    "none" | "crop" | "resize" | "rotate" | "filters" | "draw" | "text" | "shapes" | "export"
  >("none");

  // Canvas Zoom Level
  const [zoom, setZoom] = useState<number>(1);

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    hue: 0,
  });

  // --- RESIZE STATE ---
  const [resizeW, setResizeW] = useState<number>(800);
  const [resizeH, setResizeH] = useState<number>(600);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const originalAspect = useRef<number>(4 / 3);

  // --- ROTATE & FLIP STATE ---
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // --- CROP STATE ---
  const [cropAspect, setCropAspect] = useState<"free" | "1:1" | "4:5" | "16:9" | "9:16">("free");
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number }>({ x: 10, y: 10, w: 80, h: 80 });

  // --- DRAWING STATE ---
  const [drawTool, setDrawTool] = useState<"brush" | "highlighter" | "eraser">("brush");
  const [brushColor, setBrushColor] = useState<string>("#EC4899");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const isDrawing = useRef(false);

  // --- TEXT OVERLAYS ---
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // --- SHAPE OVERLAYS ---
  const [shapes, setShapes] = useState<ShapeOverlay[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  // --- PDF TOOLS STATE ---
  const [pdfImages, setPdfImages] = useState<{ id: string; src: string; name: string }[]>([]);
  const [pdfOrientation, setPdfOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pdfPageSize, setPdfPageSize] = useState<"a4" | "letter">("a4");

  // Canvas / Image Refs
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfFileInputRef = useRef<HTMLInputElement | null>(null);

  // Push Snapshot to History
  const pushHistory = (src: string) => {
    const updated = history.slice(0, historyIdx + 1);
    updated.push(src);
    if (updated.length > 20) updated.shift();
    setHistory(updated);
    setHistoryIdx(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setImageSrc(prev);
      setHistoryIdx(historyIdx - 1);
      showToast("Undone ↩");
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setImageSrc(next);
      setHistoryIdx(historyIdx + 1);
      showToast("Redone ↪");
    }
  };

  // Initialize image dimensions
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth || 800;
    const h = img.naturalHeight || 600;
    setImageDim({ w, h });
    setResizeW(w);
    setResizeH(h);
    originalAspect.current = w / h;
    if (history.length === 0 && imageSrc) {
      setHistory([imageSrc]);
      setHistoryIdx(0);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const result = event.target.result as string;
        setImageSrc(result);
        pushHistory(result);
        setStrokes([]);
        setTexts([]);
        setShapes([]);
        showToast("Image loaded successfully! 📤");
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop Handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageName(file.name.replace(/\.[^/.]+$/, ""));
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          setImageSrc(result);
          pushHistory(result);
          showToast("Image dropped & loaded! 📤");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- APPLY CROP ---
  const applyCrop = () => {
    if (!previewImgRef.current) return;
    const img = previewImgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const cropX = (cropRect.x / 100) * naturalW;
    const cropY = (cropRect.y / 100) * naturalH;
    const cropW = (cropRect.w / 100) * naturalW;
    const cropH = (cropRect.h / 100) * naturalH;

    canvas.width = cropW;
    canvas.height = cropH;

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const croppedData = canvas.toDataURL("image/png");
    setImageSrc(croppedData);
    pushHistory(croppedData);
    setActiveTool("none");
    showToast("Crop applied! ✂️");
  };

  // --- APPLY RESIZE ---
  const applyResize = () => {
    if (!previewImgRef.current) return;
    const img = previewImgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = resizeW;
    canvas.height = resizeH;

    ctx.drawImage(img, 0, 0, resizeW, resizeH);

    const resizedData = canvas.toDataURL("image/png");
    setImageSrc(resizedData);
    pushHistory(resizedData);
    setActiveTool("none");
    showToast(`Resized to ${resizeW}x${resizeH}px! 📏`);
  };

  // --- APPLY ROTATE & FLIP ---
  const applyRotateFlip = () => {
    if (!previewImgRef.current) return;
    const img = previewImgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rad = (rotation * Math.PI) / 180;
    const isSideways = rotation % 180 !== 0;

    const targetW = isSideways ? img.naturalHeight : img.naturalWidth;
    const targetH = isSideways ? img.naturalWidth : img.naturalHeight;

    canvas.width = targetW;
    canvas.height = targetH;

    ctx.translate(targetW / 2, targetH / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const rotatedData = canvas.toDataURL("image/png");
    setImageSrc(rotatedData);
    pushHistory(rotatedData);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setActiveTool("none");
    showToast("Rotation & Flip applied! 🔄");
  };

  // --- APPLY FILTERS PERMANENTLY ---
  const applyFiltersPermanently = () => {
    if (!previewImgRef.current) return;
    const img = previewImgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) hue-rotate(${filters.hue}deg)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const filteredData = canvas.toDataURL("image/png");
    setImageSrc(filteredData);
    pushHistory(filteredData);
    setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, invert: 0, hue: 0 });
    setActiveTool("none");
    showToast("Filter applied! 🎨");
  };

  // --- DRAWING LOGIC ---
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeTool !== "draw") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * imageDim.w;
    const y = ((e.clientY - rect.top) / rect.height) * imageDim.h;

    if (drawTool === "eraser") {
      setStrokes((prev) => prev.filter(s => !s.points.some(p => Math.hypot(p.x - x, p.y - y) < brushSize * 3)));
      return;
    }

    isDrawing.current = true;
    const newStroke: DrawingStroke = {
      id: Math.random().toString(36).slice(2),
      points: [{ x, y }],
      color: brushColor,
      width: drawTool === "highlighter" ? brushSize * 4 : brushSize * 2,
      isHighlighter: drawTool === "highlighter",
    };
    setCurrentStroke(newStroke);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing.current || !currentStroke) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * imageDim.w;
    const y = ((e.clientY - rect.top) / rect.height) * imageDim.h;

    setCurrentStroke(prev => prev ? {
      ...prev,
      points: [...prev.points, { x, y }]
    } : null);
  };

  const handlePointerUp = () => {
    if (isDrawing.current && currentStroke) {
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
    isDrawing.current = false;
  };

  const strokeToSvgPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  };

  // --- ADD TEXT OVERLAY ---
  const addTextOverlay = () => {
    const newText: TextOverlay = {
      id: Math.random().toString(36).slice(2),
      text: "Double-tap to edit ✨",
      x: 30,
      y: 40 + (texts.length * 40) % 200,
      fontSize: 24,
      color: "#FFFFFF",
      bg: "rgba(0, 0, 0, 0.6)",
      fontFamily: "var(--font-script, cursive)",
      bold: true,
      italic: false,
    };
    setTexts(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setActiveTool("text");
    showToast("Text added! ✍️");
  };

  // --- ADD SHAPE OVERLAY ---
  const addShapeOverlay = (type: ShapeOverlay["type"]) => {
    const newShape: ShapeOverlay = {
      id: Math.random().toString(36).slice(2),
      type,
      x: 50,
      y: 50,
      w: 120,
      h: 80,
      color: "#EC4899",
      fill: "transparent",
      strokeWidth: 4,
    };
    setShapes(prev => [...prev, newShape]);
    setSelectedShapeId(newShape.id);
    setActiveTool("shapes");
    showToast(`Shape ${type} added! ⬜`);
  };

  // --- COMPOSITE & EXPORT ---
  const handleExport = (format: "png" | "jpeg" | "webp", quality = 0.95) => {
    if (!previewImgRef.current) return;
    const img = previewImgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) hue-rotate(${filters.hue}deg)`;

    ctx.save();
    if (rotation !== 0 || flipH || flipV) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);
    } else {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    ctx.filter = "none";

    // Draw Strokes
    strokes.forEach(s => {
      ctx.save();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width * (canvas.width / imageDim.w);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = s.isHighlighter ? 0.4 : 1;
      if (s.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.points[0].x * (canvas.width / imageDim.w), s.points[0].y * (canvas.height / imageDim.h));
        for (let i = 1; i < s.points.length; i++) {
          ctx.lineTo(s.points[i].x * (canvas.width / imageDim.w), s.points[i].y * (canvas.height / imageDim.h));
        }
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw Shapes
    shapes.forEach(sh => {
      ctx.save();
      ctx.strokeStyle = sh.color;
      ctx.fillStyle = sh.fill || "transparent";
      ctx.lineWidth = sh.strokeWidth * (canvas.width / imageDim.w);

      const sx = (sh.x / 100) * canvas.width;
      const sy = (sh.y / 100) * canvas.height;
      const sw = (sh.w / 100) * canvas.width;
      const sh_h = (sh.h / 100) * canvas.height;

      if (sh.type === "rect") {
        ctx.strokeRect(sx, sy, sw, sh_h);
        if (sh.fill && sh.fill !== "transparent") ctx.fillRect(sx, sy, sw, sh_h);
      } else if (sh.type === "circle") {
        ctx.beginPath();
        ctx.ellipse(sx + sw / 2, sy + sh_h / 2, sw / 2, sh_h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (sh.fill && sh.fill !== "transparent") ctx.fill();
      } else if (sh.type === "arrow") {
        ctx.beginPath();
        ctx.moveTo(sx, sy + sh_h / 2);
        ctx.lineTo(sx + sw, sy + sh_h / 2);
        ctx.lineTo(sx + sw - 15, sy);
        ctx.moveTo(sx + sw, sy + sh_h / 2);
        ctx.lineTo(sx + sw - 15, sy + sh_h);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw Texts
    texts.forEach(txt => {
      ctx.save();
      const tx = (txt.x / 100) * canvas.width;
      const ty = (txt.y / 100) * canvas.height;
      const fSize = txt.fontSize * (canvas.width / imageDim.w);

      ctx.font = `${txt.italic ? "italic" : ""} ${txt.bold ? "bold" : ""} ${fSize}px sans-serif`;

      if (txt.bg && txt.bg !== "transparent") {
        const metrics = ctx.measureText(txt.text);
        ctx.fillStyle = txt.bg;
        ctx.fillRect(tx - 8, ty - fSize, metrics.width + 16, fSize + 12);
      }

      ctx.fillStyle = txt.color;
      ctx.fillText(txt.text, tx, ty);
      ctx.restore();
    });

    const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
    const dataUrl = canvas.toDataURL(mime, quality);

    const link = document.createElement("a");
    link.download = `${imageName}_edited.${format}`;
    link.href = dataUrl;
    link.click();
    showToast(`Exported as ${format.toUpperCase()}! 💾`);
  };

  // --- PDF EXPORT FUNCTION ---
  const handleExportPDF = () => {
    const imagesToProcess = pdfImages.length > 0 ? pdfImages : (imageSrc ? [{ id: "curr", src: imageSrc, name: imageName }] : []);
    if (imagesToProcess.length === 0) {
      showToast("No images selected for PDF.");
      return;
    }

    showToast("Generating PDF document... ⏳");
    const doc = new jsPDF({
      orientation: pdfOrientation,
      unit: "mm",
      format: pdfPageSize
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    imagesToProcess.forEach((item, index) => {
      if (index > 0) doc.addPage();
      const margin = 10;
      const availW = pageWidth - margin * 2;
      const availH = pageHeight - margin * 2;
      doc.addImage(item.src, "JPEG", margin, margin, availW, availH, undefined, "FAST");
    });

    doc.save(`${imageName || "AYXA_Document"}_Export.pdf`);
    showToast("PDF document downloaded! 📄");
  };

  return (
    <div className="w-full pb-32 select-none">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[150] bg-black/90 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl animate-fade-in pointer-events-none">
          {toastMsg}
        </div>
      )}

      {/* Hidden File Pickers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/bmp, image/gif"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={pdfFileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach(f => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (ev.target?.result) {
                setPdfImages(prev => [...prev, { id: Math.random().toString(36), src: ev.target!.result as string, name: f.name }]);
              }
            };
            reader.readAsDataURL(f);
          });
          showToast(`${files.length} images added to PDF queue! 📄`);
        }}
        className="hidden"
      />

      {/* Primary Section Tabs: Image Editor vs PDF Tools */}
      <div className="px-3 pt-2">
        <div className="rounded-3xl bg-card border border-border/60 p-1.5 shadow-sm">
          <div className="grid grid-cols-2 gap-1.5 text-center">
            <button
              data-testid="tab-image"
              onClick={() => setSectionTab("image")}
              className={cn(
                "cursor-pointer flex items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-xs font-bold transition-all",
                sectionTab === "image"
                  ? "grad-theme text-white shadow-rose-sm"
                  : "bg-surface text-ink-light hover:text-ink"
              )}
            >
              <ImageIcon size={16} />
              <span>{isAr ? "محرر الصور الاحترافي" : "Pro Image Editor"}</span>
            </button>

            <button
              data-testid="tab-pdf"
              onClick={() => setSectionTab("pdf")}
              className={cn(
                "cursor-pointer flex items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-xs font-bold transition-all",
                sectionTab === "pdf"
                  ? "grad-theme text-white shadow-rose-sm"
                  : "bg-surface text-ink-light hover:text-ink"
              )}
            >
              <FileText size={16} />
              <span>{isAr ? "استوديو ملفات PDF" : "PDF Studio & Tools"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 1: IMAGE EDITOR SUITE
         ======================================================== */}
      {sectionTab === "image" && (
        <div className="p-3 space-y-3 animate-fade-in">
          {/* Top Global Action Bar */}
          <div className="rounded-3xl bg-card border border-border/60 p-2.5 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold bg-hotpink text-white shadow-rose-xs active:scale-95 transition-all"
              >
                <Upload size={13} />
                <span>Upload</span>
              </button>

              <button
                onClick={handleUndo}
                disabled={historyIdx <= 0}
                className={cn(
                  "cursor-pointer h-8 w-8 rounded-2xl border flex items-center justify-center transition-all",
                  historyIdx > 0 ? "bg-surface text-ink border-border hover:text-hotpink" : "opacity-40 text-ink-light border-border/40 pointer-events-none"
                )}
                title="Undo"
              >
                <Undo2 size={14} />
              </button>

              <button
                onClick={handleRedo}
                disabled={historyIdx >= history.length - 1}
                className={cn(
                  "cursor-pointer h-8 w-8 rounded-2xl border flex items-center justify-center transition-all",
                  historyIdx < history.length - 1 ? "bg-surface text-ink border-border hover:text-hotpink" : "opacity-40 text-ink-light border-border/40 pointer-events-none"
                )}
                title="Redo"
              >
                <Redo2 size={14} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-surface border border-border rounded-2xl px-2 py-1">
              <button
                onClick={() => setZoom(prev => Math.max(0.4, prev - 0.15))}
                className="cursor-pointer text-ink-light hover:text-ink p-0.5"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] font-bold text-ink w-8 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
                className="cursor-pointer text-ink-light hover:text-ink p-0.5"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {/* Quick Export Button */}
            <button
              onClick={() => handleExport("png")}
              className="cursor-pointer flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold bg-purple-600 text-white shadow-sm active:scale-95 transition-all"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>

          {/* Preset Sample Images Row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-bold text-ink-light shrink-0">Sample:</span>
            {SAMPLE_IMAGES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setImageSrc(sample.url);
                  setImageName(sample.name);
                  pushHistory(sample.url);
                  setStrokes([]);
                  setTexts([]);
                  setShapes([]);
                  showToast(`Loaded ${sample.name}`);
                }}
                className={cn(
                  "cursor-pointer rounded-2xl px-3 py-1 text-[11px] font-bold whitespace-nowrap border transition-all shrink-0",
                  imageSrc === sample.url ? "grad-theme text-white border-transparent shadow-rose-xs" : "bg-surface border-border text-ink-light hover:text-ink"
                )}
              >
                {sample.name}
              </button>
            ))}
          </div>

          {/* MAIN EDITING TOOLS DOCK */}
          <div className="rounded-3xl bg-card border border-border/60 p-2 shadow-sm">
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: "crop", label: "Crop ✂️", icon: Crop },
                { id: "resize", label: "Resize 📏", icon: Maximize2 },
                { id: "rotate", label: "Rotate 🔄", icon: RotateCw },
                { id: "filters", label: "Filters 🎨", icon: Sliders },
                { id: "draw", label: "Draw ✏️", icon: PenTool },
                { id: "text", label: "Text ✍️", icon: Type },
                { id: "shapes", label: "Shapes ⬜", icon: Square },
                { id: "export", label: "Export 💾", icon: Download },
              ].map((tool) => (
                <button
                  key={tool.id}
                  data-testid={`tool-${tool.id}`}
                  onClick={() => setActiveTool(activeTool === tool.id ? "none" : (tool.id as any))}
                  className={cn(
                    "cursor-pointer flex flex-col items-center justify-center rounded-2xl py-2 px-2.5 text-[10.5px] font-bold transition-all shrink-0 active:scale-95",
                    activeTool === tool.id
                      ? "grad-theme text-white shadow-rose-xs"
                      : "bg-surface text-ink-light hover:text-ink border border-transparent"
                  )}
                >
                  <tool.icon size={15} className="mb-0.5" />
                  <span className="whitespace-nowrap">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TOOL SUB-PANELS */}
          {/* 1. CROP PANEL */}
          {activeTool === "crop" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Crop Aspect Ratio</span>
                <div className="flex gap-2">
                  <button onClick={applyCrop} className="cursor-pointer grad-theme text-white px-3 py-1 rounded-xl text-xs font-bold shadow-rose-xs">
                    Apply ✂️
                  </button>
                  <button onClick={() => setActiveTool("none")} className="cursor-pointer bg-surface text-ink-light px-2.5 py-1 rounded-xl text-xs font-bold border border-border">
                    Cancel
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: "free", label: "Free" },
                  { id: "1:1", label: "1:1 Square" },
                  { id: "4:5", label: "4:5 Portrait" },
                  { id: "16:9", label: "16:9 Landscape" },
                  { id: "9:16", label: "9:16 Story" },
                ].map((asp) => (
                  <button
                    key={asp.id}
                    onClick={() => {
                      setCropAspect(asp.id as any);
                      if (asp.id === "1:1") setCropRect({ x: 20, y: 10, w: 60, h: 60 });
                      else if (asp.id === "16:9") setCropRect({ x: 10, y: 25, w: 80, h: 45 });
                      else if (asp.id === "9:16") setCropRect({ x: 30, y: 5, w: 40, h: 70 });
                      else setCropRect({ x: 10, y: 10, w: 80, h: 80 });
                    }}
                    className={cn(
                      "cursor-pointer rounded-xl px-2.5 py-1 text-xs font-bold whitespace-nowrap border",
                      cropAspect === asp.id ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink-light"
                    )}
                  >
                    {asp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. RESIZE PANEL */}
          {activeTool === "resize" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Image Dimensions</span>
                <button onClick={applyResize} className="cursor-pointer grad-theme text-white px-3 py-1 rounded-xl text-xs font-bold shadow-rose-xs">
                  Apply Resize 📏
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-surface border border-border rounded-2xl p-2">
                  <span className="text-[10px] font-bold text-ink-light">W:</span>
                  <input
                    type="number"
                    value={resizeW}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 100;
                      setResizeW(val);
                      if (lockAspect) setResizeH(Math.round(val / originalAspect.current));
                    }}
                    className="w-full bg-transparent text-xs font-bold text-ink outline-none"
                  />
                  <span className="text-[10px] text-ink-light">px</span>
                </div>

                <div className="flex items-center gap-1.5 bg-surface border border-border rounded-2xl p-2">
                  <span className="text-[10px] font-bold text-ink-light">H:</span>
                  <input
                    type="number"
                    value={resizeH}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 100;
                      setResizeH(val);
                      if (lockAspect) setResizeW(Math.round(val * originalAspect.current));
                    }}
                    className="w-full bg-transparent text-xs font-bold text-ink outline-none"
                  />
                  <span className="text-[10px] text-ink-light">px</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className={cn(
                    "cursor-pointer flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border",
                    lockAspect ? "bg-pink-100 text-hotpink border-pink-300 dark:bg-pink-950/40" : "bg-surface text-ink-light border-border"
                  )}
                >
                  <span>{lockAspect ? "🔒 Aspect Ratio Locked" : "🔓 Aspect Ratio Free"}</span>
                </button>

                <div className="flex gap-1 text-[10px]">
                  {[50, 75, 100, 150].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        setResizeW(Math.round((imageDim.w * pct) / 100));
                        setResizeH(Math.round((imageDim.h * pct) / 100));
                      }}
                      className="cursor-pointer bg-surface border border-border px-2 py-0.5 rounded-lg text-ink font-bold hover:border-hotpink"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. ROTATE & FLIP PANEL */}
          {activeTool === "rotate" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Rotate & Flip</span>
                <button onClick={applyRotateFlip} className="cursor-pointer grad-theme text-white px-3 py-1 rounded-xl text-xs font-bold shadow-rose-xs">
                  Apply Changes 🔄
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                  className="cursor-pointer flex flex-col items-center gap-1 p-2 rounded-2xl bg-surface border border-border text-ink hover:text-hotpink active:scale-95"
                >
                  <RotateCcw size={16} />
                  <span className="text-[10px] font-bold">-90°</span>
                </button>

                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="cursor-pointer flex flex-col items-center gap-1 p-2 rounded-2xl bg-surface border border-border text-ink hover:text-hotpink active:scale-95"
                >
                  <RotateCw size={16} />
                  <span className="text-[10px] font-bold">+90°</span>
                </button>

                <button
                  onClick={() => setFlipH(!flipH)}
                  className={cn(
                    "cursor-pointer flex flex-col items-center gap-1 p-2 rounded-2xl border active:scale-95",
                    flipH ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink"
                  )}
                >
                  <FlipHorizontal size={16} />
                  <span className="text-[10px] font-bold">Flip H</span>
                </button>

                <button
                  onClick={() => setFlipV(!flipV)}
                  className={cn(
                    "cursor-pointer flex flex-col items-center gap-1 p-2 rounded-2xl border active:scale-95",
                    flipV ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink"
                  )}
                >
                  <FlipVertical size={16} />
                  <span className="text-[10px] font-bold">Flip V</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. FILTERS & ADJUSTMENTS PANEL */}
          {activeTool === "filters" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-3 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Filters & Aesthetics</span>
                <div className="flex gap-2">
                  <button onClick={applyFiltersPermanently} className="cursor-pointer grad-theme text-white px-3 py-1 rounded-xl text-xs font-bold shadow-rose-xs">
                    Apply Filter 🎨
                  </button>
                  <button
                    onClick={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, invert: 0, hue: 0 })}
                    className="cursor-pointer bg-surface text-ink-light px-2 py-1 rounded-xl text-xs font-bold border border-border"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* 1-Click Aesthetic Presets */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                {FILTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setFilters(preset.filter)}
                    className="cursor-pointer rounded-xl px-2.5 py-1 text-xs font-bold whitespace-nowrap bg-surface border border-border hover:border-hotpink text-ink shrink-0"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Sliders Grid */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-ink">
                  <span>☀️ Brightness ({filters.brightness}%)</span>
                  <input
                    type="range" min="0" max="200" value={filters.brightness}
                    onChange={(e) => setFilters(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                    className="w-36 accent-hotpink"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-ink">
                  <span>🌓 Contrast ({filters.contrast}%)</span>
                  <input
                    type="range" min="0" max="200" value={filters.contrast}
                    onChange={(e) => setFilters(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                    className="w-36 accent-hotpink"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-ink">
                  <span>🌈 Saturation ({filters.saturation}%)</span>
                  <input
                    type="range" min="0" max="200" value={filters.saturation}
                    onChange={(e) => setFilters(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                    className="w-36 accent-hotpink"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-ink">
                  <span>🌫️ Blur ({filters.blur}px)</span>
                  <input
                    type="range" min="0" max="20" value={filters.blur}
                    onChange={(e) => setFilters(prev => ({ ...prev, blur: Number(e.target.value) }))}
                    className="w-36 accent-hotpink"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. DRAWING PANEL */}
          {activeTool === "draw" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Freehand Brush</span>
                <button onClick={() => setStrokes([])} className="cursor-pointer text-xs font-bold text-danger hover:underline">
                  Clear Strokes
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  {(["brush", "highlighter", "eraser"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDrawTool(mode)}
                      className={cn(
                        "cursor-pointer rounded-xl px-2.5 py-1 text-xs font-bold border capitalize",
                        drawTool === mode ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink-light"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-ink-light">Size:</span>
                  <input
                    type="range" min="1" max="30" value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20 accent-hotpink"
                  />
                </div>
              </div>

              {/* Color swatches */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {EDITOR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    style={{ backgroundColor: c }}
                    className={cn(
                      "cursor-pointer h-6 w-6 rounded-full border-2 transition-transform shrink-0",
                      brushColor === c ? "border-hotpink scale-125 shadow-md" : "border-white/60"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 6. TEXT OVERLAY PANEL */}
          {activeTool === "text" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Text Overlays</span>
                <button onClick={addTextOverlay} className="cursor-pointer grad-theme text-white px-3 py-1 rounded-xl text-xs font-bold shadow-rose-xs flex items-center gap-1">
                  <Plus size={12} />
                  <span>Add New Text</span>
                </button>
              </div>

              <p className="text-[11px] text-ink-light">Tap any text on the image to select, drag to position, or type to edit.</p>
            </div>
          )}

          {/* 7. SHAPES PANEL */}
          {activeTool === "shapes" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Add Shapes</span>
                <span className="text-[10px] text-ink-light">Drag on canvas to position</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "rect", label: "Rectangle", icon: Square },
                  { id: "circle", label: "Circle", icon: Circle },
                  { id: "arrow", label: "Arrow", icon: ArrowRight },
                  { id: "star", label: "Star", icon: Sparkles },
                ].map((sh) => (
                  <button
                    key={sh.id}
                    onClick={() => addShapeOverlay(sh.id as any)}
                    className="cursor-pointer flex flex-col items-center gap-1 p-2 rounded-2xl bg-surface border border-border text-ink hover:text-hotpink active:scale-95"
                  >
                    <sh.icon size={16} />
                    <span className="text-[10px] font-bold">{sh.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 8. EXPORT PANEL */}
          {activeTool === "export" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-3 animate-scale-up">
              <span className="text-xs font-bold text-ink">Export Image</span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleExport("png")}
                  className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-2xl bg-pink-100 dark:bg-pink-950/40 border border-pink-300 text-hotpink active:scale-95"
                >
                  <span className="text-base font-bold">PNG</span>
                  <span className="text-[10px] text-ink-light">Lossless Quality</span>
                </button>

                <button
                  onClick={() => handleExport("jpeg", 0.92)}
                  className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/40 border border-blue-300 text-blue-600 active:scale-95"
                >
                  <span className="text-base font-bold">JPG</span>
                  <span className="text-[10px] text-ink-light">Compact Size</span>
                </button>

                <button
                  onClick={() => handleExport("webp", 0.9)}
                  className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-600 active:scale-95"
                >
                  <span className="text-base font-bold">WEBP</span>
                  <span className="text-[10px] text-ink-light">Modern Web</span>
                </button>
              </div>
            </div>
          )}

          {/* MAIN IMAGE CANVAS STAGE */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative w-full rounded-3xl border-2 border-dashed border-border/80 bg-card/60 overflow-hidden flex items-center justify-center p-2 min-h-[420px] shadow-inner"
          >
            {imageSrc ? (
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.15s ease-out"
                }}
                className="relative max-w-full inline-block select-none"
              >
                {/* Image Element with Active CSS Filters & Rotation */}
                <img
                  ref={previewImgRef}
                  src={imageSrc}
                  alt="Edit Target"
                  onLoad={handleImageLoaded}
                  style={{
                    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) hue-rotate(${filters.hue}deg)`,
                    transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                    maxHeight: "65vh"
                  }}
                  className="rounded-2xl shadow-xl pointer-events-none transition-all object-contain"
                />

                {/* SVG Annotation Layer for Drawing */}
                <svg
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className={cn(
                    "absolute inset-0 h-full w-full z-20 touch-none",
                    activeTool === "draw" ? "cursor-crosshair pointer-events-auto" : "pointer-events-none"
                  )}
                  viewBox={`0 0 ${imageDim.w} ${imageDim.h}`}
                >
                  {strokes.map((s) => (
                    <path
                      key={s.id}
                      d={strokeToSvgPath(s.points)}
                      stroke={s.color}
                      strokeWidth={s.width}
                      strokeOpacity={s.isHighlighter ? 0.4 : 1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  ))}

                  {currentStroke && (
                    <path
                      d={strokeToSvgPath(currentStroke.points)}
                      stroke={currentStroke.color}
                      strokeWidth={currentStroke.width}
                      strokeOpacity={currentStroke.isHighlighter ? 0.4 : 1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  )}
                </svg>

                {/* Crop Interactive Box Overlay */}
                {activeTool === "crop" && (
                  <div
                    style={{
                      left: `${cropRect.x}%`,
                      top: `${cropRect.y}%`,
                      width: `${cropRect.w}%`,
                      height: `${cropRect.h}%`,
                    }}
                    className="absolute z-30 border-2 border-hotpink bg-hotpink/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move pointer-events-auto rounded-lg"
                  >
                    <div className="absolute top-1 left-1 bg-hotpink text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Crop Area
                    </div>
                  </div>
                )}

                {/* Draggable Text Elements */}
                {texts.map((txt) => (
                  <div
                    key={txt.id}
                    onClick={() => setSelectedTextId(txt.id)}
                    style={{
                      left: `${txt.x}%`,
                      top: `${txt.y}%`,
                      fontSize: `${txt.fontSize}px`,
                      color: txt.color,
                      backgroundColor: txt.bg || "transparent",
                    }}
                    className={cn(
                      "absolute z-40 px-2 py-1 rounded-xl cursor-grab active:cursor-grabbing font-bold shadow-md select-none touch-none",
                      selectedTextId === txt.id && "ring-2 ring-hotpink ring-offset-2"
                    )}
                  >
                    <input
                      type="text"
                      value={txt.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTexts(prev => prev.map(t => t.id === txt.id ? { ...t, text: val } : t));
                      }}
                      className="bg-transparent border-none outline-none font-inherit text-inherit font-bold"
                    />
                  </div>
                ))}

                {/* Draggable Shape Elements */}
                {shapes.map((sh) => (
                  <div
                    key={sh.id}
                    onClick={() => setSelectedShapeId(sh.id)}
                    style={{
                      left: `${sh.x}%`,
                      top: `${sh.y}%`,
                      width: `${sh.w}px`,
                      height: `${sh.h}px`,
                      borderColor: sh.color,
                      borderWidth: `${sh.strokeWidth}px`,
                      backgroundColor: sh.fill || "transparent",
                    }}
                    className={cn(
                      "absolute z-40 cursor-grab active:cursor-grabbing shadow-sm border-solid",
                      sh.type === "circle" ? "rounded-full" : "rounded-2xl",
                      selectedShapeId === sh.id && "ring-2 ring-hotpink ring-offset-2"
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="h-16 w-16 rounded-3xl bg-pink-100 dark:bg-pink-950/40 border border-pink-200 flex items-center justify-center text-hotpink text-2xl shadow-inner">
                  <Upload size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink">Upload or Drop an Image</h4>
                  <p className="text-xs text-ink-light mt-1">Supports PNG, JPG, WEBP, BMP, and GIF files</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer grad-theme text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-rose-xs"
                >
                  Choose File
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 2: PDF STUDIO & CONVERTER
         ======================================================== */}
      {sectionTab === "pdf" && (
        <div className="p-3 space-y-3 animate-fade-in">
          <div className="rounded-3xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-ink">Convert Images to PDF 📄</h3>
                <p className="text-xs text-ink-light">Merge single or multiple pictures into a clean printable PDF document.</p>
              </div>

              <button
                onClick={() => pdfFileInputRef.current?.click()}
                className="cursor-pointer grad-theme text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-rose-xs flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Images</span>
              </button>
            </div>

            {/* Document Setup */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-ink-light">Orientation:</span>
                <div className="grid grid-cols-2 gap-1">
                  {(["portrait", "landscape"] as const).map((or) => (
                    <button
                      key={or}
                      onClick={() => setPdfOrientation(or)}
                      className={cn(
                        "cursor-pointer rounded-xl py-1 text-xs font-bold capitalize border",
                        pdfOrientation === or ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink-light"
                      )}
                    >
                      {or}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-ink-light">Page Size:</span>
                <div className="grid grid-cols-2 gap-1">
                  {(["a4", "letter"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setPdfPageSize(sz)}
                      className={cn(
                        "cursor-pointer rounded-xl py-1 text-xs font-bold uppercase border",
                        pdfPageSize === sz ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink-light"
                      )}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Images Queue */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-xs font-bold text-ink">Pages in PDF ({pdfImages.length > 0 ? pdfImages.length : 1}):</span>

              {pdfImages.length === 0 && imageSrc && (
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface border border-border">
                  <img src={imageSrc} alt="Preview" className="h-12 w-12 rounded-xl object-cover border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{imageName}</p>
                    <p className="text-[10px] text-ink-light">Current image in editor</p>
                  </div>
                  <span className="text-xs font-bold text-hotpink">Page 1</span>
                </div>
              )}

              {pdfImages.map((imgItem, idx) => (
                <div key={imgItem.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface border border-border">
                  <img src={imgItem.src} alt="Thumb" className="h-12 w-12 rounded-xl object-cover border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{imgItem.name}</p>
                    <p className="text-[10px] text-ink-light">Page {idx + 1}</p>
                  </div>
                  <button
                    onClick={() => setPdfImages(prev => prev.filter(x => x.id !== imgItem.id))}
                    className="cursor-pointer text-danger p-1 hover:bg-danger/10 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                onClick={handleExportPDF}
                className="cursor-pointer w-full grad-theme text-white py-3 rounded-2xl text-xs font-bold shadow-rose-sm flex items-center justify-center gap-2 active:scale-98"
              >
                <FileText size={15} />
                <span>Export & Download PDF Document 📄</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ImageEditorPro;
