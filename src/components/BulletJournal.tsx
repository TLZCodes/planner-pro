import React, { useState, useEffect, useRef } from "react";
import {
  Upload, Crop, Maximize2, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Sliders, PenTool, Type, Square, Circle, ArrowRight, Download, Undo2, Redo2,
  Trash2, FileText, Sparkles, Check, X, ZoomIn, ZoomOut, Layers, Palette,
  Image as ImageIcon, Move, RefreshCw, Plus, Copy, FolderOpen, CheckSquare,
  Eraser, Calendar, Grid, Heart, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type ToolMode = "select" | "pen" | "brush" | "eraser";

export interface CanvasStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
}

export interface CanvasElement {
  id: string;
  type: "text" | "sticker" | "image" | "washi" | "todo" | "spiral" | "banner" | "card" | "shape";
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  emoji?: string;
  imageUrl?: string;
  color?: string;
  bg?: string;
  font?: string;
  fontSize?: number;
  shapeType?: "rect" | "circle" | "arrow" | "star";
  strokeWidth?: number;
  items?: { text: string; done: boolean }[];
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  filterPreset?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
}

const PALETTE_COLORS = [
  "#2B1E1A", "#D95389", "#EC4899", "#8B5CF6", "#3B82F6",
  "#10B981", "#F59E0B", "#EF4444", "#FFFFFF", "#64748B"
];

const FILTER_PRESETS = [
  { id: "normal", name: "Normal", filter: { brightness: 100, contrast: 100, saturation: 100, blur: 0 } },
  { id: "vintage", name: "Vintage 📜", filter: { brightness: 105, contrast: 90, saturation: 80, blur: 0 } },
  { id: "pastel", name: "Pastel Dream 🌸", filter: { brightness: 115, contrast: 105, saturation: 120, blur: 0 } },
  { id: "noir", name: "B&W Noir 🖤", filter: { brightness: 100, contrast: 130, saturation: 0, blur: 0 } },
  { id: "golden", name: "Golden Hour ☀️", filter: { brightness: 110, contrast: 110, saturation: 130, blur: 0 } },
  { id: "emerald", name: "Barakah Emerald 🌿", filter: { brightness: 105, contrast: 110, saturation: 125, blur: 0 } },
  { id: "cool", name: "Cool Breeze 🌊", filter: { brightness: 105, contrast: 105, saturation: 110, blur: 0 } },
  { id: "cyber", name: "Cyber Pop 💜", filter: { brightness: 110, contrast: 140, saturation: 150, blur: 0 } },
];

const STICKER_SHEET_PACKS = [
  {
    id: "pack1",
    name: "🌸 Scrapbook Notes",
    items: [
      { text: "dream believe achieve repeat ✨", emoji: "📜", bg: "#FCE8EC" },
      { text: "Collect beautiful moments 💖", emoji: "💌", bg: "#F7D6DE" },
      { text: "little by little 🌸", emoji: "🏷️", bg: "#FCE8EC" },
      { text: "one day at a time 🤍", emoji: "📄", bg: "#FDF2F4" },
      { text: "take care of your mind and soul 🌿", emoji: "🎀", bg: "#FCE8EC" },
      { text: "focus on the good ✨", emoji: "✨", bg: "#F7D6DE" },
      { text: "Keep learning, keep growing 🦋", emoji: "🕊️", bg: "#FDF2F4" },
    ]
  },
  {
    id: "pack2",
    name: "🎀 Romantic Quotes",
    items: [
      { text: "you are so so loved 💖", emoji: "🌹", bg: "#FCE8EC" },
      { text: "romanticize your life a little more ✨", emoji: "🪞", bg: "#F7D6DE" },
      { text: "soft heart, strong mind 🤍", emoji: "🌷", bg: "#FDF2F4" },
      { text: "take the time to make your soul happy 🌸", emoji: "💌", bg: "#FCE8EC" },
      { text: "it's okay to choose yourself 🎀", emoji: "🏷️", bg: "#F7D6DE" },
      { text: "you are enough exactly as you are 🕊️", emoji: "📜", bg: "#FCE8EC" },
    ]
  },
  {
    id: "pack3",
    name: "☕ Study & Chibi Vibe",
    items: [
      { text: "Be your own kind of beautiful 🌸", emoji: "👧", bg: "#FCE8EC" },
      { text: "Enjoy the little things ☕", emoji: "🧋", bg: "#F7D6DE" },
      { text: "Happy Day! ☀️", emoji: "🧸", bg: "#FDF2F4" },
      { text: "You can do this! 🌟", emoji: "📚", bg: "#FCE8EC" },
      { text: "Good Vibes Only ✨", emoji: "👜", bg: "#F7D6DE" },
    ]
  },
  {
    id: "pack4",
    name: "🌙 Barakah & Hijabi",
    items: [
      { text: "سلام و رحمة 🕊️", emoji: "🧕", bg: "#FCE8EC" },
      { text: "ورد اليوم والقرآن الكريم 📖", emoji: "🌙", bg: "#F7D6DE" },
      { text: "فانوس البركة والذكر ✨", emoji: "🏮", bg: "#FDF2F4" },
      { text: "قهوة الصباح ورضا الرحمن ☕", emoji: "🤍", bg: "#FCE8EC" },
      { text: "اللهم بارك في يومي 🌸", emoji: "💐", bg: "#F7D6DE" },
    ]
  },
  {
    id: "pack5",
    name: "📖 Study & Exam Sprint",
    items: [
      { text: "Exam mode: ON 📚", emoji: "🎯", bg: "#E0F2FE" },
      { text: "Consistency is key 🔑", emoji: "💡", bg: "#FEF08A" },
      { text: "50m Deep Work ⏱️", emoji: "⚡", bg: "#DCFCE7" },
      { text: "Active Recall & Flashcards 📑", emoji: "📝", bg: "#FCE7F3" },
      { text: "قومي الآن مستقبلك ينتظرك 💖", emoji: "🌟", bg: "#EDE9FE" },
    ]
  },
  {
    id: "pack6",
    name: "👑 Calligraphy & Girl Math",
    items: [
      { text: "Girl Math: If I plan it, it's already done 💅", emoji: "🛍️", bg: "#FCE7F3" },
      { text: "توكلت على الله وبدأت 🌿", emoji: "✨", bg: "#DCFCE7" },
      { text: "لا حول ولا قوة إلا بالله 🤍", emoji: "🕊️", bg: "#EDE9FE" },
      { text: "Self care is productive too 🛁", emoji: "🧴", bg: "#FCE8EC" },
      { text: "الحمد لله دائماً وأبداً 🌸", emoji: "💐", bg: "#FEF08A" },
    ]
  }
];

const BUJO_TEMPLATES = [
  {
    id: "weekly_aesthetic",
    title: "Weekly Aesthetic Spread 🌸",
    emoji: "🌸",
    desc: "Aesthetic pastel planner with weekly boxes, goals & gratitude.",
    elements: [
      { id: "w1", type: "banner", x: 14, y: 16, w: 325, h: 48, text: "🌸 WEEKLY AESTHETIC 🌸", bg: "bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300" },
      { id: "w2", type: "washi", x: 14, y: 76, w: 155, h: 36, text: "☕ MONDAY", color: "#FDE49C" },
      { id: "w3", type: "washi", x: 184, y: 76, w: 155, h: 36, text: "📚 TUESDAY", color: "#BAE6FD" },
      { id: "w4", type: "todo", x: 14, y: 122, w: 155, h: 145, text: "Monday Focus", items: [{ text: "Weekly planning", done: true }, { text: "Deep study 50m", done: false }, { text: "Hydration 2L", done: false }] },
      { id: "w5", type: "todo", x: 184, y: 122, w: 155, h: 145, text: "Tuesday Tasks", items: [{ text: "Flashcard review", done: false }, { text: "Pilates workout", done: false }, { text: "Reading 20p", done: false }] },
      { id: "w6", type: "spiral", x: 14, y: 280, w: 325, h: 140, text: "✨ Gratitude & Highlights:\n1. Completed core milestones\n2. Enjoyed peaceful morning coffee\n3. Consistent with daily Athkar 🤍" },
    ]
  },
  {
    id: "islamic_barakah",
    title: "Barakah & Quran Page 🌙",
    emoji: "🌙",
    desc: "Spiritual tracker for Wird, Tahajjud, and Dua of the day.",
    elements: [
      { id: "i1", type: "banner", x: 14, y: 16, w: 325, h: 48, text: "🌙 صفحة البركة والذكر 🌙", bg: "bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300" },
      { id: "i2", type: "card", x: 14, y: 76, w: 325, h: 75, text: "📖 ورد القرآن: سورة الكهف / جزء اليوم\n🕊️ أذكار الصباح والمساء والاستغفار 100x" },
      { id: "i3", type: "todo", x: 14, y: 162, w: 155, h: 155, text: "صلوات اليوم", items: [{ text: "الفجر في وقته", done: true }, { text: "الظهر", done: true }, { text: "العصر", done: false }, { text: "المغرب", done: false }, { text: "العشاء والوتر", done: false }] },
      { id: "i4", type: "spiral", x: 184, y: 162, w: 155, h: 155, text: "🤲 دعاء اليوم:\n\"اللهم إني أسألك علماً نافعاً ورزقاً طيباً وعملاً متقبلاً\" ✨" },
      { id: "i5", type: "washi", x: 14, y: 330, w: 325, h: 38, text: "🌸 فاذكروني أذكركم واشكروا لي ولا تكفرون 🌸", color: "#FDE49C" },
    ]
  },
  {
    id: "study_sprint",
    title: "Study & Exam Sprint 📚",
    emoji: "📚",
    desc: "Target chapters, checkpoints, formula notes & motivation.",
    elements: [
      { id: "s1", type: "banner", x: 14, y: 16, w: 325, h: 48, text: "📚 STUDY & EXAM SPRINT 📚", bg: "bg-gradient-to-r from-teal-300 via-emerald-200 to-teal-300" },
      { id: "s2", type: "washi", x: 14, y: 76, w: 155, h: 36, text: "📖 Chapter Goals", color: "#A8E0D8" },
      { id: "s3", type: "todo", x: 14, y: 122, w: 155, h: 150, text: "Checkpoints", items: [{ text: "Core theorem review", done: true }, { text: "Flashcard practice", done: true }, { text: "Mock exam test", done: false }] },
      { id: "s4", type: "spiral", x: 184, y: 76, w: 155, h: 196, text: "💡 Key Notes:\n- Review formulas every morning\n- Hydrate & sleep 8 hours ✨" },
      { id: "s5", type: "card", x: 14, y: 285, w: 325, h: 75, text: "📌 Reminder: \"قومي الآن مستقبلك ينتظرك 💖\"" },
    ]
  }
];

export function BulletJournal() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [sectionTab, setSectionTab] = useState<"canvas" | "image_studio" | "templates" | "pdf_export">(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab");
      if (p === "photo" || p === "image_studio") return "image_studio";
      if (p === "templates") return "templates";
      if (p === "pdf" || p === "pdf_export") return "pdf_export";
    }
    return "canvas";
  });
  const [tool, setTool] = useState<"select" | "draw" | "text" | "shapes" | "stickers" | "washi" | "todo" | "paper">(() => {
    if (typeof window !== "undefined") {
      const tParam = new URLSearchParams(window.location.search).get("tool");
      if (tParam && ["select", "draw", "text", "shapes", "stickers", "washi", "todo", "paper"].includes(tParam)) {
        return tParam as any;
      }
    }
    return "select";
  });
  const [drawMode, setDrawMode] = useState<"brush" | "highlighter" | "eraser">("brush");
  const [color, setColor] = useState("#EC4899");
  const [brushSize, setBrushSize] = useState(4);
  const [paper, setPaper] = useState<"dotted" | "grid" | "lined" | "pink" | "cream" | "night">("dotted");
  const [zoom, setZoom] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const [elements, setElements] = useState<CanvasElement[]>([
    { id: "init_1", type: "banner", x: 14, y: 16, w: 325, h: 48, text: "🌸 AYXA PRO BULLET JOURNAL 🌸", bg: "bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300" },
    { id: "init_2", type: "washi", x: 14, y: 76, w: 155, h: 36, text: "☕ MONDAY FOCUS", color: "#FDE49C" },
    { id: "init_3", type: "washi", x: 184, y: 76, w: 155, h: 36, text: "📚 STUDY SPRINT", color: "#BAE6FD" },
    { id: "init_4", type: "todo", x: 14, y: 122, w: 155, h: 145, text: "Priority Tasks", items: [{ text: "Weekly goals planning", done: true }, { text: "Deep work 50m", done: false }, { text: "Hydration 2L", done: false }] },
    { id: "init_5", type: "todo", x: 184, y: 122, w: 155, h: 145, text: "Self Care & Athkar", items: [{ text: "Morning & Evening Athkar", done: true }, { text: "Pilates session", done: false }, { text: "Reading 20 mins", done: false }] },
    { id: "init_6", type: "spiral", x: 14, y: 280, w: 325, h: 140, text: "✨ Gratitude & Highlights:\n1. Completed core milestones\n2. Clean digital bullet journal setup\n3. Enjoyed peaceful morning coffee 🤍" },
  ]);

  const [strokes, setStrokes] = useState<CanvasStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<CanvasStroke | null>(null);
  const isDrawing = useRef(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedElement = elements.find(el => el.id === selectedId);
  const [selectedStickerPack, setSelectedStickerPack] = useState(0);

  const canvasSvgRef = useRef<SVGSVGElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfFileInputRef = useRef<HTMLInputElement | null>(null);

  const [studioImgSrc, setStudioImgSrc] = useState<string | null>("https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&auto=format&fit=crop&q=80");
  const [studioFilters, setStudioFilters] = useState({ brightness: 100, contrast: 100, saturation: 100, blur: 0 });
  const [studioRotation, setStudioRotation] = useState(0);
  const [studioFlipH, setStudioFlipH] = useState(false);
  const [studioFlipV, setStudioFlipV] = useState(false);

  const [pdfImages, setPdfImages] = useState<{ id: string; src: string; name: string }[]>([]);
  const [pdfOrientation, setPdfOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pdfPageSize, setPdfPageSize] = useState<"a4" | "letter">("a4");

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("tab");
      if (p === "photo" || p === "image_studio") setSectionTab("image_studio");
      else if (p === "templates") setSectionTab("templates");
      else if (p === "pdf" || p === "pdf_export") setSectionTab("pdf_export");

      const tParam = new URLSearchParams(window.location.search).get("tool");
      if (tParam && ["select", "draw", "text", "shapes", "stickers", "washi", "todo", "paper"].includes(tParam)) {
        setTool(tParam as any);
      }
    } catch (e) {}
  }, []);

  const saveToLocal = (els: CanvasElement[], stks: CanvasStroke[], p: string) => {
    try {
      localStorage.setItem("proplanner_bujo_native_v4", JSON.stringify({
        elements: els,
        strokes: stks,
        paper: p
      }));
    } catch (e) {}
  };

  const pushHistory = (newEls: CanvasElement[]) => {
    const updated = history.slice(0, historyIdx + 1);
    updated.push(newEls);
    if (updated.length > 20) updated.shift();
    setHistory(updated);
    setHistoryIdx(updated.length - 1);
    saveToLocal(newEls, strokes, paper);
  };

  const undo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setElements(prev);
      setHistoryIdx(historyIdx - 1);
      saveToLocal(prev, strokes, paper);
      showToast("Undone ↩");
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setElements(next);
      setHistoryIdx(historyIdx + 1);
      saveToLocal(next, strokes, paper);
      showToast("Redone ↪");
    }
  };

  const draggingId = useRef<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleElementPointerDown = (e: React.PointerEvent, elId: string) => {
    if (tool === "draw") return;
    const tagName = (e.target as HTMLElement).tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA") {
      setSelectedId(elId);
      return;
    }
    e.stopPropagation();
    setSelectedId(elId);
    draggingId.current = elId;
    const targetEl = elements.find(x => x.id === elId);
    if (targetEl && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const clickX = (e.clientX - boardRect.left) / zoom;
      const clickY = (e.clientY - boardRect.top) / zoom;
      dragOffset.current = {
        x: clickX - targetEl.x,
        y: clickY - targetEl.y
      };
      try {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  const handleBoardPointerMove = (e: React.PointerEvent) => {
    if (draggingId.current && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - boardRect.left) / zoom;
      const mouseY = (e.clientY - boardRect.top) / zoom;
      const newX = Math.round(mouseX - dragOffset.current.x);
      const newY = Math.round(mouseY - dragOffset.current.y);

      setElements(prev => prev.map(el => el.id === draggingId.current ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) } : el));
    }
  };

  const handleBoardPointerUp = () => {
    if (draggingId.current) {
      draggingId.current = null;
      pushHistory(elements);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool !== "draw") return;
    const rect = canvasSvgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (drawMode === "eraser") {
      setStrokes((prev) => {
        const next = prev.filter(s => !s.points.some(p => Math.hypot(p.x - x, y - p.y) < brushSize * 4));
        saveToLocal(elements, next, paper);
        return next;
      });
      return;
    }

    isDrawing.current = true;
    const newStroke: CanvasStroke = {
      id: Math.random().toString(36).slice(2),
      points: [{ x, y }],
      color: color,
      width: drawMode === "highlighter" ? brushSize * 4 : brushSize * 2,
      opacity: drawMode === "highlighter" ? 0.35 : 1,
    };
    setCurrentStroke(newStroke);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !currentStroke) return;
    const rect = canvasSvgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setCurrentStroke((prev) => prev ? {
      ...prev,
      points: [...prev.points, { x, y }]
    } : null);
  };

  const handlePointerUp = () => {
    if (isDrawing.current && currentStroke) {
      setStrokes((prev) => {
        const next = [...prev, currentStroke];
        saveToLocal(elements, next, paper);
        return next;
      });
      setCurrentStroke(null);
    }
    isDrawing.current = false;
  };

  const strokeToSvgPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    return "M " + pts[0].x + " " + pts[0].y + " " + pts.slice(1).map(p => "L " + p.x + " " + p.y).join(" ");
  };

  const addUploadedImageToCanvas = (imgUrl: string) => {
    const newEl: CanvasElement = {
      id: Math.random().toString(36).slice(2),
      type: "image",
      x: 30,
      y: 80 + (elements.length * 30) % 200,
      w: 220,
      h: 160,
      imageUrl: imgUrl,
      rotation: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0
    };
    const next = [...elements, newEl];
    setElements(next);
    pushHistory(next);
    setSelectedId(newEl.id);
    setTool("select");
    showToast("Photo added to Journal page! 🖼️");
  };

  const addTextElement = () => {
    const newEl: CanvasElement = {
      id: Math.random().toString(36).slice(2),
      type: "text",
      x: 40,
      y: 60 + (elements.length * 30) % 250,
      w: 200,
      h: 50,
      text: "Double tap to write ✨",
      fontSize: 18,
      color: "#2B1E1A",
      bg: "transparent"
    };
    const next = [...elements, newEl];
    setElements(next);
    pushHistory(next);
    setSelectedId(newEl.id);
    showToast("Text added! ✍️");
  };

  const addShapeElement = (shapeType: "rect" | "circle" | "arrow" | "star") => {
    const newEl: CanvasElement = {
      id: Math.random().toString(36).slice(2),
      type: "shape",
      shapeType,
      x: 50,
      y: 80 + (elements.length * 25) % 250,
      w: 120,
      h: 90,
      color: color,
      bg: "transparent",
      strokeWidth: 3
    };
    const next = [...elements, newEl];
    setElements(next);
    pushHistory(next);
    setSelectedId(newEl.id);
    showToast("Shape " + shapeType + " added! ⬜");
  };

  const addStickerElement = (item: { text: string; emoji: string; bg: string }) => {
    const newEl: CanvasElement = {
      id: Math.random().toString(36).slice(2),
      type: "sticker",
      x: 30,
      y: 70 + (elements.length * 35) % 250,
      w: 180,
      h: 55,
      text: item.text,
      emoji: item.emoji,
      bg: item.bg
    };
    const next = [...elements, newEl];
    setElements(next);
    pushHistory(next);
    setSelectedId(newEl.id);
    showToast("Added " + item.emoji + " sticker!");
  };

  const addWashiTape = () => {
    const colors = ["#FDE49C", "#BAE6FD", "#FBCFE8", "#A7F3D0", "#DDD6FE"];
    const chosen = colors[elements.length % colors.length];
    const newEl: CanvasElement = {
      id: Math.random().toString(36).slice(2),
      type: "washi",
      x: 40,
      y: 60 + (elements.length * 30) % 250,
      w: 160,
      h: 36,
      text: "🌸 DAILY HIGHLIGHT",
      color: chosen
    };
    const next = [...elements, newEl];
    setElements(next);
    pushHistory(next);
    setSelectedId(newEl.id);
    showToast("Washi tape placed! 🏷️");
  };

  const addTodoBox = () => {
    const newEl: CanvasElement = {
      id: Math.random().toString(36).slice(2),
      type: "todo",
      x: 30,
      y: 80 + (elements.length * 30) % 250,
      w: 170,
      h: 140,
      text: "Action List",
      items: [{ text: "New priority item", done: false }, { text: "Review notes", done: false }]
    };
    const next = [...elements, newEl];
    setElements(next);
    pushHistory(next);
    setSelectedId(newEl.id);
    showToast("To-Do checklist added! 📋");
  };

  const updateSelected = (updater: (prev: CanvasElement) => CanvasElement) => {
    if (!selectedId) return;
    const next = elements.map(el => el.id === selectedId ? updater(el) : el);
    setElements(next);
    pushHistory(next);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const next = elements.filter(el => el.id !== selectedId);
    setElements(next);
    pushHistory(next);
    setSelectedId(null);
    showToast("Element removed 🗑️");
  };

  const duplicateSelected = () => {
    if (!selectedId || !selectedElement) return;
    const dup: CanvasElement = {
      ...selectedElement,
      id: Math.random().toString(36).slice(2),
      x: selectedElement.x + 20,
      y: selectedElement.y + 20
    };
    const next = [...elements, dup];
    setElements(next);
    pushHistory(next);
    setSelectedId(dup.id);
    showToast("Duplicated! ✨");
  };

  const exportJournalAsPNG = async () => {
    if (!boardRef.current) return;
    showToast("Rendering high-res PNG image... ⏳");
    setSelectedId(null);
    try {
      const canvas = await html2canvas(boardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      const link = document.createElement("a");
      link.download = "AYXA_Bullet_Journal.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("PNG Downloaded! 🖼️");
    } catch (e) {
      showToast("Export error. Please try again.");
    }
  };

  const exportJournalAsPDF = async () => {
    if (!boardRef.current) return;
    showToast("Generating PDF document... ⏳");
    setSelectedId(null);
    try {
      const canvas = await html2canvas(boardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF"
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: pdfOrientation,
        unit: "mm",
        format: pdfPageSize
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const renderW = pdfW - margin * 2;
      const renderH = (canvas.height * renderW) / canvas.width;

      pdf.addImage(imgData, "JPEG", margin, margin, renderW, Math.min(renderH, pdfH - margin * 2));
      pdf.save("AYXA_Bullet_Journal.pdf");
      showToast("PDF Document Downloaded! 📄");
    } catch (e) {
      showToast("PDF generation failed.");
    }
  };

  const exportMultiImagePDF = () => {
    const queue = pdfImages.length > 0 ? pdfImages : [];
    if (queue.length === 0) {
      showToast("Please add images to the PDF queue first.");
      return;
    }
    showToast("Compiling multi-page PDF book... ⏳");
    const pdf = new jsPDF({
      orientation: pdfOrientation,
      unit: "mm",
      format: pdfPageSize
    });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    queue.forEach((item, idx) => {
      if (idx > 0) pdf.addPage();
      const margin = 10;
      pdf.addImage(item.src, "JPEG", margin, margin, pdfW - margin * 2, pdfH - margin * 2, undefined, "FAST");
    });
    pdf.save("AYXA_Merged_Images_Album.pdf");
    showToast("Multi-Page PDF Downloaded! 📄");
  };

  const getPaperBgClass = () => {
    switch (paper) {
      case "grid": return "bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 dark:bg-slate-900";
      case "lined": return "bg-[linear-gradient(to_bottom,transparent_23px,#E2E8F0_24px)] [background-size:100%_24px] bg-stone-50 dark:bg-stone-900";
      case "pink": return "bg-pink-50/70 dark:bg-pink-950/20";
      case "cream": return "bg-amber-50/80 dark:bg-amber-950/20";
      case "night": return "bg-slate-900 text-white";
      case "dotted":
      default:
        return "bg-[radial-gradient(#F472B6_1px,transparent_1px)] [background-size:18px_18px] bg-[#FFF9FA] dark:bg-[#1E161B]";
    }
  };

  return (
    <div className="w-full pb-32 select-none">
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[150] bg-black/90 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl animate-fade-in pointer-events-none">
          {toastMsg}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/bmp, image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (ev.target?.result) {
                addUploadedImageToCanvas(ev.target.result as string);
              }
            };
            reader.readAsDataURL(file);
          }
        }}
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
          showToast(files.length + " images added to PDF queue! 📄");
        }}
        className="hidden"
      />

      {/* TOP NAVIGATION TABS */}
      <div className="px-3 pt-2">
        <div className="rounded-3xl bg-card border border-border/60 p-1.5 shadow-sm">
          <div className="grid grid-cols-4 gap-1 text-center">
            <button
              data-testid="bujo-tab-canvas"
              onClick={() => setSectionTab("canvas")}
              className={cn(
                "cursor-pointer flex flex-col items-center justify-center rounded-2xl py-2 px-1 text-[11px] font-bold transition-all",
                sectionTab === "canvas" ? "grad-theme text-white shadow-rose-xs" : "bg-surface text-ink-light hover:text-ink"
              )}
            >
              <PenTool size={14} className="mb-0.5" />
              <span>{isAr ? "اللوحة والاستوديو" : "Canvas"}</span>
            </button>

            <button
              data-testid="bujo-tab-photo"
              onClick={() => setSectionTab("image_studio")}
              className={cn(
                "cursor-pointer flex flex-col items-center justify-center rounded-2xl py-2 px-1 text-[11px] font-bold transition-all",
                sectionTab === "image_studio" ? "grad-theme text-white shadow-rose-xs" : "bg-surface text-ink-light hover:text-ink"
              )}
            >
              <ImageIcon size={14} className="mb-0.5" />
              <span>{isAr ? "محرر الصور" : "Photo Studio"}</span>
            </button>

            <button
              data-testid="bujo-tab-templates"
              onClick={() => setSectionTab("templates")}
              className={cn(
                "cursor-pointer flex flex-col items-center justify-center rounded-2xl py-2 px-1 text-[11px] font-bold transition-all",
                sectionTab === "templates" ? "grad-theme text-white shadow-rose-xs" : "bg-surface text-ink-light hover:text-ink"
              )}
            >
              <Layers size={14} className="mb-0.5" />
              <span>{isAr ? "القوالب الجاهزة" : "Templates"}</span>
            </button>

            <button
              data-testid="bujo-tab-pdf"
              onClick={() => setSectionTab("pdf_export")}
              className={cn(
                "cursor-pointer flex flex-col items-center justify-center rounded-2xl py-2 px-1 text-[11px] font-bold transition-all",
                sectionTab === "pdf_export" ? "grad-theme text-white shadow-rose-xs" : "bg-surface text-ink-light hover:text-ink"
              )}
            >
              <FileText size={14} className="mb-0.5" />
              <span>{isAr ? "تصدير PDF" : "PDF Export"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CANVAS */}
      {sectionTab === "canvas" && (
        <div className="p-3 space-y-3 animate-fade-in">
          <div className="rounded-3xl bg-card border border-border/60 p-2 shadow-sm flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex items-center gap-1 rounded-2xl px-2.5 py-1.5 text-[11px] font-bold bg-hotpink text-white shadow-rose-xs active:scale-95 transition-all"
              >
                <Upload size={13} />
                <span>Upload</span>
              </button>

              <button
                onClick={undo}
                disabled={historyIdx <= 0}
                className={cn(
                  "cursor-pointer h-7 w-7 rounded-2xl border flex items-center justify-center transition-all",
                  historyIdx > 0 ? "bg-surface text-ink border-border hover:text-hotpink" : "opacity-40 text-ink-light border-border/40 pointer-events-none"
                )}
                title="Undo"
              >
                <Undo2 size={13} />
              </button>

              <button
                onClick={redo}
                disabled={historyIdx >= history.length - 1}
                className={cn(
                  "cursor-pointer h-7 w-7 rounded-2xl border flex items-center justify-center transition-all",
                  historyIdx < history.length - 1 ? "bg-surface text-ink border-border hover:text-hotpink" : "opacity-40 text-ink-light border-border/40 pointer-events-none"
                )}
                title="Redo"
              >
                <Redo2 size={13} />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-surface border border-border rounded-2xl px-2 py-0.5">
              <button onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))} className="cursor-pointer text-ink-light p-0.5">
                <ZoomOut size={12} />
              </button>
              <span className="text-[10px] font-bold text-ink w-7 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))} className="cursor-pointer text-ink-light p-0.5">
                <ZoomIn size={12} />
              </button>
            </div>

            <div className="flex gap-1">
              <button
                onClick={exportJournalAsPNG}
                className="cursor-pointer flex items-center gap-1 rounded-2xl px-2.5 py-1.5 text-[11px] font-bold bg-purple-600 text-white shadow-sm active:scale-95"
              >
                <ImageIcon size={12} />
                <span>PNG</span>
              </button>
              <button
                onClick={exportJournalAsPDF}
                className="cursor-pointer flex items-center gap-1 rounded-2xl px-2.5 py-1.5 text-[11px] font-bold bg-rose-600 text-white shadow-sm active:scale-95"
              >
                <FileText size={12} />
                <span>PDF</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border/60 p-2 shadow-sm">
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: "select", label: "Select 👆", icon: Move },
                { id: "draw", label: "Draw ✏️", icon: PenTool },
                { id: "text", label: "Text ✍️", icon: Type },
                { id: "shapes", label: "Shapes ⬜", icon: Square },
                { id: "stickers", label: "Stickers 🌸", icon: Sparkles },
                { id: "washi", label: "Washi 🏷️", icon: Palette },
                { id: "todo", label: "Checklist 📋", icon: CheckSquare },
                { id: "paper", label: "Paper 📜", icon: BookOpen },
              ].map((tItem) => (
                <button
                  key={tItem.id}
                  data-testid={"bujo-tool-" + tItem.id}
                  onClick={() => setTool(tItem.id as any)}
                  className={cn(
                    "cursor-pointer flex flex-col items-center justify-center rounded-2xl py-1.5 px-2 text-[10px] font-bold transition-all shrink-0 active:scale-95",
                    tool === tItem.id ? "grad-theme text-white shadow-rose-xs" : "bg-surface text-ink-light hover:text-ink border border-transparent"
                  )}
                >
                  <tItem.icon size={14} className="mb-0.5" />
                  <span className="whitespace-nowrap">{tItem.label}</span>
                </button>
              ))}
            </div>
          </div>

          {tool === "draw" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Freehand Brush & Inking</span>
                <button onClick={() => setStrokes([])} className="cursor-pointer text-xs font-bold text-danger hover:underline">
                  Clear Ink 🗑️
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  {(["brush", "highlighter", "eraser"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDrawMode(mode)}
                      className={cn(
                        "cursor-pointer rounded-xl px-2.5 py-1 text-xs font-bold border capitalize",
                        drawMode === mode ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink-light"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-ink-light">Size:</span>
                  <input
                    type="range" min="1" max="25" value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20 accent-hotpink"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {PALETTE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={cn(
                      "cursor-pointer h-6 w-6 rounded-full border-2 transition-transform shrink-0",
                      color === c ? "border-hotpink scale-125 shadow-md" : "border-white/60"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {tool === "text" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Text Options</span>
                <button onClick={addTextElement} className="cursor-pointer grad-theme text-white px-3 py-1 rounded-xl text-xs font-bold shadow-rose-xs flex items-center gap-1">
                  <Plus size={12} />
                  <span>Add New Text</span>
                </button>
              </div>
              <p className="text-[11px] text-ink-light">Tap any text box on the canvas to edit, drag to position, or change colors.</p>
            </div>
          )}

          {tool === "shapes" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Vector Shapes</span>
                <span className="text-[10px] text-ink-light">Tap to place on journal</span>
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
                    onClick={() => addShapeElement(sh.id as any)}
                    className="cursor-pointer flex flex-col items-center gap-1 p-2 rounded-2xl bg-surface border border-border text-ink hover:text-hotpink active:scale-95"
                  >
                    <sh.icon size={16} />
                    <span className="text-[10px] font-bold">{sh.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool === "stickers" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Aesthetic Sticker Packs</span>
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {STICKER_SHEET_PACKS.map((pack, pIdx) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedStickerPack(pIdx)}
                    className={cn(
                      "cursor-pointer rounded-xl px-2.5 py-1 text-[11px] font-bold whitespace-nowrap border transition-all shrink-0",
                      selectedStickerPack === pIdx ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink-light"
                    )}
                  >
                    {pack.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {STICKER_SHEET_PACKS[selectedStickerPack].items.map((item, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => addStickerElement(item)}
                    style={{ backgroundColor: item.bg }}
                    className="cursor-pointer flex items-center gap-2 p-2 rounded-2xl border border-border/60 text-left active:scale-95 transition-all shadow-xs"
                  >
                    <span className="text-lg shrink-0">{item.emoji}</span>
                    <span className="text-[10.5px] font-bold text-ink truncate">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool === "washi" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Washi Tape Ribbon</span>
                <button onClick={addWashiTape} className="cursor-pointer grad-theme text-white px-3 py-1 rounded-xl text-xs font-bold shadow-rose-xs">
                  Place Ribbon 🏷️
                </button>
              </div>
            </div>
          )}

          {tool === "todo" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Interactive Checklist Card</span>
                <button onClick={addTodoBox} className="cursor-pointer grad-theme text-white px-3 py-1 rounded-xl text-xs font-bold shadow-rose-xs">
                  Add Checklist 📋
                </button>
              </div>
            </div>
          )}

          {tool === "paper" && (
            <div className="rounded-3xl bg-card border border-border/60 p-3 shadow-sm space-y-2 animate-scale-up">
              <span className="text-xs font-bold text-ink">Journal Page Paper Style</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "dotted", label: "Dotted Grid 🌸" },
                  { id: "grid", label: "Square Grid 📐" },
                  { id: "lined", label: "Ruled Lined 📜" },
                  { id: "pink", label: "Pastel Pink 🎀" },
                  { id: "cream", label: "Vintage Cream 📜" },
                  { id: "night", label: "Midnight Dark 🌙" },
                ].map((pItem) => (
                  <button
                    key={pItem.id}
                    onClick={() => {
                      setPaper(pItem.id as any);
                      saveToLocal(elements, strokes, pItem.id);
                    }}
                    className={cn(
                      "cursor-pointer rounded-xl p-2 text-[11px] font-bold border text-center",
                      paper === pItem.id ? "grad-theme text-white border-transparent shadow-rose-xs" : "bg-surface border-border text-ink-light hover:text-ink"
                    )}
                  >
                    {pItem.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedElement && (
            <div className="rounded-3xl bg-pink-100/80 dark:bg-pink-950/40 border border-pink-300 p-2.5 shadow-sm space-y-2 animate-scale-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-hotpink capitalize">Selected: {selectedElement.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={duplicateSelected} className="cursor-pointer bg-white dark:bg-card text-ink p-1 rounded-xl border border-border" title="Duplicate">
                    <Copy size={13} />
                  </button>
                  <button onClick={deleteSelected} className="cursor-pointer bg-red-100 text-danger p-1 rounded-xl border border-red-200" title="Delete">
                    <Trash2 size={13} />
                  </button>
                  <button onClick={() => setSelectedId(null)} className="cursor-pointer bg-white dark:bg-card text-ink p-1 rounded-xl border border-border" title="Deselect">
                    <X size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                <div className="flex items-center gap-1 bg-white dark:bg-card border border-border rounded-xl px-2 py-1">
                  <span className="text-[10px] font-bold text-ink-light">W:</span>
                  <button
                    onClick={() => updateSelected(el => ({ ...el, w: Math.max(40, el.w - 15) }))}
                    className="cursor-pointer px-1 font-bold text-ink hover:text-hotpink"
                  >-</button>
                  <span className="text-[10px] font-bold text-ink">{selectedElement.w}px</span>
                  <button
                    onClick={() => updateSelected(el => ({ ...el, w: el.w + 15 }))}
                    className="cursor-pointer px-1 font-bold text-ink hover:text-hotpink"
                  >+</button>
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-card border border-border rounded-xl px-2 py-1">
                  <RotateCw size={12} className="text-ink-light" />
                  <button
                    onClick={() => updateSelected(el => ({ ...el, rotation: ((el.rotation || 0) + 15) % 360 }))}
                    className="cursor-pointer font-bold text-ink hover:text-hotpink"
                  >
                    +15°
                  </button>
                </div>

                {selectedElement.type === "image" && (
                  <div className="flex items-center gap-1">
                    {FILTER_PRESETS.slice(0, 4).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => updateSelected(el => ({
                          ...el,
                          brightness: f.filter.brightness,
                          contrast: f.filter.contrast,
                          saturation: f.filter.saturation,
                          blur: f.filter.blur
                        }))}
                        className="cursor-pointer bg-white dark:bg-card border border-border px-2 py-1 rounded-xl text-[10px] font-bold text-ink hover:border-hotpink"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MAIN JOURNAL CANVAS */}
          <div className="relative w-full overflow-hidden flex justify-center py-1">
            <div
              ref={boardRef}
              onPointerMove={handleBoardPointerMove}
              onPointerUp={handleBoardPointerUp}
              style={{
                width: "355px",
                minHeight: "520px",
                transform: "scale(" + zoom + ")",
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out"
              }}
              className={cn(
                "relative rounded-3xl border-2 border-border/80 p-3 shadow-xl overflow-hidden select-none transition-colors",
                getPaperBgClass()
              )}
            >
              <svg
                ref={canvasSvgRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={cn(
                  "absolute inset-0 h-full w-full z-20 touch-none",
                  tool === "draw" ? "cursor-crosshair pointer-events-auto" : "pointer-events-none"
                )}
              >
                {strokes.map((s) => (
                  <path
                    key={s.id}
                    d={strokeToSvgPath(s.points)}
                    stroke={s.color}
                    strokeWidth={s.width}
                    strokeOpacity={s.opacity}
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
                    strokeOpacity={currentStroke.opacity}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
              </svg>

              {elements.map((el) => {
                const isSel = selectedId === el.id;

                if (el.type === "banner") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      style={{ left: el.x + "px", top: el.y + "px", width: el.w + "px" }}
                      className={cn(
                        "absolute z-10 p-2.5 rounded-2xl text-center font-bold text-xs text-ink shadow-sm cursor-grab active:cursor-grabbing border border-border/40 touch-none",
                        el.bg || "bg-pink-200",
                        isSel && "ring-2 ring-hotpink ring-offset-2"
                      )}
                    >
                      <input
                        type="text"
                        value={el.text || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElements(prev => prev.map(x => x.id === el.id ? { ...x, text: val } : x));
                        }}
                        className="bg-transparent border-none outline-none text-center font-inherit text-inherit w-full font-bold"
                      />
                    </div>
                  );
                }

                if (el.type === "image") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      style={{
                        left: el.x + "px",
                        top: el.y + "px",
                        width: el.w + "px",
                        height: el.h + "px",
                        transform: "rotate(" + (el.rotation || 0) + "deg)",
                      }}
                      className={cn(
                        "absolute z-10 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-md border border-border/60 touch-none",
                        isSel && "ring-2 ring-hotpink ring-offset-2"
                      )}
                    >
                      <img
                        src={el.imageUrl}
                        alt="Journal Photo"
                        style={{
                          filter: "brightness(" + (el.brightness || 100) + "%) contrast(" + (el.contrast || 100) + "%) saturate(" + (el.saturation || 100) + "%) blur(" + (el.blur || 0) + "px)",
                        }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                  );
                }

                if (el.type === "washi") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      style={{
                        left: el.x + "px",
                        top: el.y + "px",
                        width: el.w + "px",
                        backgroundColor: el.color || "#FDE49C",
                      }}
                      className={cn(
                        "absolute z-10 py-1.5 px-3 rounded-md text-center font-bold text-[11px] text-ink shadow-xs cursor-grab active:cursor-grabbing opacity-90 border-dashed border-y border-white/60 touch-none",
                        isSel && "ring-2 ring-hotpink ring-offset-2"
                      )}
                    >
                      <input
                        type="text"
                        value={el.text || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElements(prev => prev.map(x => x.id === el.id ? { ...x, text: val } : x));
                        }}
                        className="bg-transparent border-none outline-none text-center font-inherit text-inherit w-full font-bold"
                      />
                    </div>
                  );
                }

                if (el.type === "todo") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      style={{ left: el.x + "px", top: el.y + "px", width: el.w + "px" }}
                      className={cn(
                        "absolute z-10 p-2.5 rounded-2xl bg-card border border-border/80 shadow-sm cursor-grab active:cursor-grabbing space-y-1.5 touch-none",
                        isSel && "ring-2 ring-hotpink ring-offset-2"
                      )}
                    >
                      <p className="text-[11px] font-bold text-hotpink border-b border-border/40 pb-1">{el.text}</p>
                      <div className="space-y-1">
                        {(el.items || []).map((it, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setElements(prev => prev.map(x => {
                                if (x.id === el.id) {
                                  const updated = [...(x.items || [])];
                                  updated[idx] = { ...updated[idx], done: !updated[idx].done };
                                  return { ...x, items: updated };
                                }
                                return x;
                              }));
                            }}
                            className="cursor-pointer flex items-center gap-1.5 text-[10.5px] font-medium text-ink"
                          >
                            <span className={cn(
                              "h-3.5 w-3.5 rounded border flex items-center justify-center text-[9px]",
                              it.done ? "bg-hotpink text-white border-hotpink" : "border-border bg-surface"
                            )}>
                              {it.done && "✓"}
                            </span>
                            <span className={cn(it.done && "line-through opacity-50")}>{it.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (el.type === "spiral") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      style={{ left: el.x + "px", top: el.y + "px", width: el.w + "px" }}
                      className={cn(
                        "absolute z-10 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-400 shadow-sm cursor-grab active:cursor-grabbing touch-none",
                        isSel && "ring-2 ring-hotpink ring-offset-2"
                      )}
                    >
                      <textarea
                        value={el.text || ""}
                        rows={4}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElements(prev => prev.map(x => x.id === el.id ? { ...x, text: val } : x));
                        }}
                        className="bg-transparent border-none outline-none font-inherit text-inherit w-full text-[11px] font-medium text-ink resize-none leading-relaxed"
                      />
                    </div>
                  );
                }

                if (el.type === "card") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      style={{ left: el.x + "px", top: el.y + "px", width: el.w + "px" }}
                      className={cn(
                        "absolute z-10 p-2.5 rounded-2xl bg-surface border border-border/80 shadow-xs cursor-grab active:cursor-grabbing text-[11px] font-medium text-ink touch-none",
                        isSel && "ring-2 ring-hotpink ring-offset-2"
                      )}
                    >
                      <textarea
                        value={el.text || ""}
                        rows={2}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElements(prev => prev.map(x => x.id === el.id ? { ...x, text: val } : x));
                        }}
                        className="bg-transparent border-none outline-none font-inherit text-inherit w-full resize-none font-bold text-center"
                      />
                    </div>
                  );
                }

                if (el.type === "sticker") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      style={{
                        left: el.x + "px",
                        top: el.y + "px",
                        width: el.w + "px",
                        backgroundColor: el.bg || "#FCE8EC",
                      }}
                      className={cn(
                        "absolute z-10 p-2 rounded-2xl border border-border/60 shadow-xs flex items-center gap-2 cursor-grab active:cursor-grabbing touch-none",
                        isSel && "ring-2 ring-hotpink ring-offset-2"
                      )}
                    >
                      <span className="text-xl shrink-0">{el.emoji}</span>
                      <span className="text-[10px] font-bold text-ink truncate">{el.text}</span>
                    </div>
                  );
                }

                if (el.type === "shape") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      style={{
                        left: el.x + "px",
                        top: el.y + "px",
                        width: el.w + "px",
                        height: el.h + "px",
                        borderColor: el.color || "#EC4899",
                        borderWidth: (el.strokeWidth || 3) + "px",
                        backgroundColor: el.bg || "transparent",
                      }}
                      className={cn(
                        "absolute z-10 cursor-grab active:cursor-grabbing border-solid shadow-xs touch-none",
                        el.shapeType === "circle" ? "rounded-full" : "rounded-2xl",
                        isSel && "ring-2 ring-hotpink ring-offset-2"
                      )}
                    />
                  );
                }

                if (el.type === "text") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      style={{
                        left: el.x + "px",
                        top: el.y + "px",
                        width: el.w + "px",
                        fontSize: (el.fontSize || 16) + "px",
                        color: el.color || "#2B1E1A",
                      }}
                      className={cn(
                        "absolute z-10 p-1.5 rounded-xl cursor-grab active:cursor-grabbing font-bold touch-none",
                        isSel && "ring-2 ring-hotpink ring-offset-2"
                      )}
                    >
                      <input
                        type="text"
                        value={el.text || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElements(prev => prev.map(x => x.id === el.id ? { ...x, text: val } : x));
                        }}
                        className="bg-transparent border-none outline-none font-inherit text-inherit w-full font-bold"
                      />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHOTO STUDIO */}
      {sectionTab === "image_studio" && (
        <div className="p-3 space-y-3 animate-fade-in">
          <div className="rounded-3xl bg-card border border-border/60 p-3.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-ink">Photo & Image Studio Pro 🖼️</h3>
                <p className="text-xs text-ink-light">Crop, resize, filter & add directly to your Bullet Journal</p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer grad-theme text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-rose-xs flex items-center gap-1"
              >
                <Upload size={13} />
                <span>Upload</span>
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10.5px] font-bold text-ink-light">Aesthetic Filters:</span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {FILTER_PRESETS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStudioFilters(f.filter)}
                    className="cursor-pointer rounded-xl px-2.5 py-1 text-xs font-bold whitespace-nowrap bg-surface border border-border hover:border-hotpink text-ink shrink-0"
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setStudioRotation(prev => (prev + 90) % 360)}
                className="cursor-pointer flex items-center justify-center gap-1 p-2 rounded-2xl bg-surface border border-border text-ink text-xs font-bold"
              >
                <RotateCw size={14} />
                <span>+90°</span>
              </button>

              <button
                onClick={() => setStudioFlipH(prev => !prev)}
                className={cn(
                  "cursor-pointer flex items-center justify-center gap-1 p-2 rounded-2xl border text-xs font-bold",
                  studioFlipH ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink"
                )}
              >
                <FlipHorizontal size={14} />
                <span>Flip H</span>
              </button>

              <button
                onClick={() => {
                  if (studioImgSrc) addUploadedImageToCanvas(studioImgSrc);
                  setSectionTab("canvas");
                }}
                className="cursor-pointer grad-theme text-white p-2 rounded-2xl text-xs font-bold shadow-rose-xs flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                <span>To Canvas 🌸</span>
              </button>
            </div>

            {studioImgSrc && (
              <div className="rounded-2xl border border-border/80 overflow-hidden bg-card/60 p-2 flex items-center justify-center max-h-64 shadow-inner">
                <img
                  src={studioImgSrc}
                  alt="Studio Target"
                  style={{
                    filter: "brightness(" + studioFilters.brightness + "%) contrast(" + studioFilters.contrast + "%) saturate(" + studioFilters.saturation + "%) blur(" + studioFilters.blur + "px)",
                    transform: "rotate(" + studioRotation + "deg) scale(" + (studioFlipH ? -1 : 1) + ", " + (studioFlipV ? -1 : 1) + ")",
                  }}
                  className="rounded-xl max-h-56 object-contain shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATES */}
      {sectionTab === "templates" && (
        <div className="p-3 space-y-3 animate-fade-in">
          <div className="rounded-3xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
            <div>
              <h3 className="font-bold text-base text-ink">Aesthetic Spread Templates 📑</h3>
              <p className="text-xs text-ink-light">Choose a pre-styled aesthetic spread to replace or start your journal.</p>
            </div>

            <div className="space-y-2.5">
              {BUJO_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} className="p-3 rounded-2xl bg-surface border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tmpl.emoji}</span>
                      <div>
                        <h4 className="font-bold text-xs text-ink">{tmpl.title}</h4>
                        <p className="text-[10.5px] text-ink-light">{tmpl.desc}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setElements(tmpl.elements as any);
                      pushHistory(tmpl.elements as any);
                      setSectionTab("canvas");
                      showToast("Applied " + tmpl.title + "! ✨");
                    }}
                    className="cursor-pointer w-full grad-theme text-white py-2 rounded-xl text-xs font-bold shadow-rose-xs"
                  >
                    Apply This Template 🌸
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PDF EXPORT */}
      {sectionTab === "pdf_export" && (
        <div className="p-3 space-y-3 animate-fade-in">
          <div className="rounded-3xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
            <div>
              <h3 className="font-bold text-base text-ink">Export & PDF Studio 📄</h3>
              <p className="text-xs text-ink-light">Download your journal spread or merge multiple photo pages into a PDF book.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={exportJournalAsPNG}
                className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-2xl bg-pink-100 dark:bg-pink-950/40 border border-pink-300 text-hotpink active:scale-95"
              >
                <ImageIcon size={20} className="mb-1" />
                <span className="text-xs font-bold">Export Canvas PNG</span>
                <span className="text-[9px] text-ink-light">High Resolution</span>
              </button>

              <button
                onClick={exportJournalAsPDF}
                className="cursor-pointer flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/40 border border-blue-300 text-blue-600 active:scale-95"
              >
                <FileText size={20} className="mb-1" />
                <span className="text-xs font-bold">Export Canvas PDF</span>
                <span className="text-[9px] text-ink-light">Clean Printable</span>
              </button>
            </div>

            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Merge Multi-Page PDF Album ({pdfImages.length})</span>
                <button
                  onClick={() => pdfFileInputRef.current?.click()}
                  className="cursor-pointer grad-theme text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-rose-xs flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Add Photos</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-ink-light">Orientation:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {(["portrait", "landscape"] as const).map((or) => (
                      <button
                        key={or}
                        onClick={() => setPdfOrientation(or)}
                        className={cn(
                          "cursor-pointer rounded-xl py-1 text-[11px] font-bold capitalize border",
                          pdfOrientation === or ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink-light"
                        )}
                      >
                        {or}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-ink-light">Paper Size:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {(["a4", "letter"] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setPdfPageSize(sz)}
                        className={cn(
                          "cursor-pointer rounded-xl py-1 text-[11px] font-bold uppercase border",
                          pdfPageSize === sz ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink-light"
                        )}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {pdfImages.map((pImg, idx) => (
                <div key={pImg.id} className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border">
                  <img src={pImg.src} alt="Thumb" className="h-10 w-10 rounded-lg object-cover border" />
                  <span className="text-xs font-bold text-ink flex-1 truncate">{pImg.name}</span>
                  <span className="text-[10px] text-ink-light">Page {idx + 1}</span>
                  <button onClick={() => setPdfImages(prev => prev.filter(x => x.id !== pImg.id))} className="text-danger p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {pdfImages.length > 0 && (
                <button
                  onClick={exportMultiImagePDF}
                  className="cursor-pointer w-full grad-theme text-white py-2.5 rounded-2xl text-xs font-bold shadow-rose-sm mt-2"
                >
                  Compile & Download Album PDF ({pdfImages.length} Pages) 📄
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default BulletJournal;