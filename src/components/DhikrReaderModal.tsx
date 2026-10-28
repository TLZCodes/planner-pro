import { useState, useEffect } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Volume2, 
  Share2, 
  Copy, 
  BookOpen, 
  Moon, 
  Sun, 
  Shield, 
  Heart,
  Award,
  ArrowLeft
} from "lucide-react";
import { DhikrItem, FULL_ATHKAR_COLLECTION } from "@/lib/athkarData";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

interface DhikrReaderModalProps {
  initialDhikrId?: string;
  initialCategory?: "morning" | "evening" | "sleep" | "postPrayer" | "ruqyah";
  isOpen: boolean;
  onClose: () => void;
}

export function DhikrReaderModal({
  initialDhikrId,
  initialCategory = "morning",
  isOpen,
  onClose,
}: DhikrReaderModalProps) {
  const { lang } = useLang();
  const { addXP } = useApp();
  const isAr = lang === "ar";

  const [activeCategory, setActiveCategory] = useState<"morning" | "evening" | "sleep" | "postPrayer" | "ruqyah">(initialCategory);
  const items = FULL_ATHKAR_COLLECTION.filter((d) => d.category === activeCategory);

  const initialIndex = items.findIndex((d) => d.id === initialDhikrId);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex >= 0 ? initialIndex : 0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (isOpen) {
      (window as any).__onBackOverlayDismiss = () => {
        onClose();
        return true;
      };
    } else {
      (window as any).__onBackOverlayDismiss = null;
    }
    return () => {
      (window as any).__onBackOverlayDismiss = null;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDhikr = items[currentIndex] || items[0] || FULL_ATHKAR_COLLECTION[0];
  const currentCount = counts[currentDhikr.id] || 0;
  const isComplete = completedItems[currentDhikr.id] || currentCount >= currentDhikr.count;

  const handleIncrement = () => {
    if (isComplete) return;

    const nextCount = currentCount + 1;
    setCounts((prev) => ({ ...prev, [currentDhikr.id]: nextCount }));

    

    if (nextCount >= currentDhikr.count) {
      setCompletedItems((prev) => ({ ...prev, [currentDhikr.id]: true }));
      addXP(currentDhikr.rewardXp || 20);
      
    }
  };

  const handleResetCount = () => {
    setCounts((prev) => ({ ...prev, [currentDhikr.id]: 0 }));
    setCompletedItems((prev) => ({ ...prev, [currentDhikr.id]: false }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${currentDhikr.titleAr}\n\n${currentDhikr.textAr}\n\n${currentDhikr.virtueAr} - ${currentDhikr.source}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAudio = () => {
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(currentDhikr.textAr);
        utterance.lang = "ar-SA";
        utterance.rate = 0.85;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  const categories = [
    { id: "morning", labelAr: "🌅 أذكار الصباح", labelEn: "Morning", icon: Sun, color: "text-amber-500" },
    { id: "evening", labelAr: "🌇 أذكار المساء", labelEn: "Evening", icon: Moon, color: "text-purple-500" },
    { id: "sleep", labelAr: "🌙 أذكار النوم", labelEn: "Sleep", icon: Moon, color: "text-indigo-500" },
    { id: "postPrayer", labelAr: "🕌 بعد الصلاة", labelEn: "Post-Prayer", icon: Heart, color: "text-emerald-500" },
    { id: "ruqyah", labelAr: "🛡️ الرقية والتحصين", labelEn: "Ruqyah", icon: Shield, color: "text-teal-500" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
      <div 
        className="relative flex h-[90vh] sm:h-[88vh] max-h-[850px] w-full max-w-lg flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-canvas text-ink shadow-2xl border border-pink-200/50 dark:border-pink-900/50 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative flex items-center justify-between border-b border-border/60 bg-card/80 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ghost text-ink hover:bg-surface transition-transform active:scale-90 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="rtl:rotate-180" />
            </button>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                {isAr ? "قارئ الأذكار والورد الشريف" : "Full Athkar & Wird Reader"}
              </h2>
              <p className="text-[11px] font-semibold text-ink-light">
                {isAr ? `${items.length} أذكار مختارة وموثقة` : `${items.length} Authentic Supplications`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ghost text-ink hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories Tab Pill Strip */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border/40 bg-surface/50 px-4 py-2.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setCurrentIndex(0);
              }}
              className={cn(
                "flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm",
                activeCategory === cat.id
                  ? "grad-theme text-white shadow-rose-sm scale-105"
                  : "bg-card text-ink-light hover:text-ink hover:bg-card/80 border border-border/50"
              )}
            >
              <span>{isAr ? cat.labelAr : cat.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Main Dhikr Content Card Scroll Area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Index progress */}
          <div className="flex items-center justify-between text-xs font-bold text-ink-light">
            <span className="flex items-center gap-1">
              <Sparkles size={14} className="text-amber-500" />
              {isAr ? `الذكر ${currentIndex + 1} من ${items.length}` : `Supplication ${currentIndex + 1} of ${items.length}`}
            </span>
            <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-amber-700 dark:text-amber-300 border border-amber-300/40">
              +{currentDhikr.rewardXp} XP
            </span>
          </div>

          {/* Title Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-4 text-white shadow-lg border border-amber-300/30">
            <h3 className="font-uthmani text-2xl font-extrabold text-amber-200 leading-snug">
              {currentDhikr.titleAr}
            </h3>
            <p className="mt-1 font-champagne text-sm text-emerald-100/90 tracking-wide">
              {currentDhikr.titleEn}
            </p>
          </div>

          {/* Complete Arabic Text with Tashkeel in Large Clear Quranic Font */}
          <div className="relative rounded-3xl border-2 border-emerald-300/50 dark:border-emerald-700/50 bg-gradient-to-b from-card via-surface to-emerald-50/20 dark:to-emerald-950/20 p-5 shadow-card">
            <div className="absolute top-3 end-3 flex items-center gap-1.5">
              <button
                onClick={handlePlayAudio}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer",
                  isPlayingAudio ? "bg-amber-400 text-slate-950 animate-pulse" : "bg-ghost text-ink hover:text-emerald-600"
                )}
                title={isAr ? "استماع للذكر" : "Listen audio"}
              >
                <Volume2 size={16} />
              </button>
              <button
                onClick={handleCopy}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ghost text-ink hover:text-emerald-600 transition-colors cursor-pointer"
                title={isAr ? "نسخ النص الكامل" : "Copy text"}
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              </button>
            </div>

            <p className="font-uthmani text-[24px] sm:text-[26px] font-extrabold text-emerald-950 dark:text-emerald-100 leading-[2.2] text-center pt-6 pb-4 select-text">
              {currentDhikr.textAr}
            </p>

            {/* Transliteration & English Meaning */}
            {currentDhikr.transliteration && (
              <div className="mt-3 border-t border-emerald-100 dark:border-emerald-900/60 pt-3 text-xs leading-relaxed text-ink-light">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 italic">
                  {currentDhikr.transliteration}
                </p>
                <p className="mt-1.5 text-[12px] text-ink font-medium">
                  {currentDhikr.textEn}
                </p>
              </div>
            )}
          </div>

          {/* Virtue & Hadith Reference Box */}
          <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 p-4 border border-amber-300/60 dark:border-amber-700/50 shadow-sm">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
              <span>💡 {isAr ? "فضل وبركة هذا الذكر الشريف:" : "Virtue & Reward:"}</span>
            </p>
            <p className="mt-1 text-xs font-medium text-amber-900 dark:text-amber-100 leading-relaxed">
              {isAr ? currentDhikr.virtueAr : currentDhikr.virtueEn}
            </p>
            <p className="mt-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 text-end">
              📖 {currentDhikr.source}
            </p>
          </div>
        </div>

        {/* Bottom Interactive Tap-Counter & Navigation Controls */}
        <div className="border-t border-border/60 bg-card p-4 shadow-lg space-y-3">
          {/* Main Huge Tap Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleIncrement}
              className={cn(
                "flex-1 flex items-center justify-between px-6 py-4 rounded-2xl text-white font-extrabold shadow-lg transition-all duration-200 active:scale-95 cursor-pointer",
                isComplete
                  ? "bg-emerald-600 shadow-emerald-600/30"
                  : "grad-theme shadow-rose-md hover:brightness-105"
              )}
            >
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <Check className="h-6 w-6 stroke-[3]" />
                ) : (
                  <Sparkles className="h-6 w-6" />
                )}
                <span className="text-base font-bold">
                  {isComplete
                    ? (isAr ? "تم إكمال التكرار بنجاح 🤍" : "Completed! +XP Added")
                    : (isAr ? "اضغطي للتسبيح والتكرار" : "Tap to Count")}
                </span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-sm font-mono font-black">
                <span>{currentCount}</span>
                <span>/</span>
                <span>{currentDhikr.count}</span>
              </div>
            </button>

            <button
              onClick={handleResetCount}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ghost text-ink-light hover:text-ink hover:bg-surface transition-colors cursor-pointer"
              title={isAr ? "إعادة تصفير العداد" : "Reset counter"}
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Navigation Prev / Next Arrows */}
          <div className="flex items-center justify-between pt-1 pb-[calc(env(safe-area-inset-bottom,16px)+14px)] sm:pb-2">
            <button
              disabled={currentIndex <= 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1 text-xs font-bold text-ink-light hover:text-hotpink disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft size={18} /> {isAr ? "الذكر السابق" : "Previous"}
            </button>

            {/* Quick Indicators */}
            <div className="flex gap-1">
              {items.slice(0, 10).map((it, idx) => (
                <span
                  key={it.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all cursor-pointer",
                    currentIndex === idx
                      ? "w-6 bg-hotpink"
                      : completedItems[it.id]
                      ? "w-2 bg-emerald-500"
                      : "w-2 bg-ghost"
                  )}
                />
              ))}
              {items.length > 10 && <span className="text-[10px] text-ink-light self-center">+{items.length - 10}</span>}
            </div>

            <button
              disabled={currentIndex >= items.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1))}
              className="flex items-center gap-1 text-xs font-bold text-ink-light hover:text-hotpink disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              {isAr ? "الذكر التالي" : "Next"} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
