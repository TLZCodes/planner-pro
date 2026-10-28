import React, { useState } from "react";
import { X, Check, Sparkles, AlertCircle, Plus, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft } from "lucide-react";
import {
  type BingoBoardSize,
  type BingoTheme,
  type SelfCareBingoBoard,
  type SelfCareBingoTile,
  type StarterBingoIdea,
  BINGO_THEMES,
  STARTER_BINGO_IDEAS,
  createDefaultBingoBoard,
} from "@/lib/selfCareBingoEngine";
import { type SelfCareActivity } from "@/lib/selfCareEngine";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface BingoSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBoard: SelfCareBingoBoard | null;
  weekStartDate: string;
  weekEndDate: string;
  activities: SelfCareActivity[];
  onSaveBoard: (board: SelfCareBingoBoard) => void;
  onAddCustomActivity: (act: { title: string; icon: string; category: any; estimatedDurationMinutes?: number }) => string;
}

export const BingoSetupWizardModal: React.FC<BingoSetupWizardModalProps> = ({
  isOpen,
  onClose,
  existingBoard,
  weekStartDate,
  weekEndDate,
  activities,
  onSaveBoard,
  onAddCustomActivity,
}) => {
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  if (!isOpen) return null;

  const [size, setSize] = useState<BingoBoardSize>(existingBoard?.size || 3);
  const [theme, setTheme] = useState<BingoTheme>(existingBoard?.theme || "blush");
  const [celebrationsEnabled, setCelebrationsEnabled] = useState<boolean>(
    existingBoard?.celebrationsEnabled !== false
  );

  // Selected tiles
  const [tiles, setTiles] = useState<SelfCareBingoTile[]>(() => {
    if (existingBoard) {
      return [...existingBoard.tiles];
    }
    const def = createDefaultBingoBoard(weekStartDate, weekEndDate, 3, "blush");
    return def.tiles;
  });

  // Custom new activity input state
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customIcon, setCustomIcon] = useState("🌸");
  const [customDuration, setCustomDuration] = useState(15);

  // Target tile index for replacing
  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);

  // Shrink warning state (when going from 4 to 3)
  const [showShrinkWarning, setShowShrinkWarning] = useState(false);

  const totalSlots = size * size;

  // Handle size change with safety check
  const handleSizeChange = (newSize: BingoBoardSize) => {
    if (newSize === size) return;
    if (newSize < size) {
      // Shrinking from 16 to 9 tiles
      setShowShrinkWarning(true);
    } else {
      // Expanding from 9 to 16 tiles
      setSize(newSize);
      const expanded: SelfCareBingoTile[] = [...tiles];
      while (expanded.length < newSize * newSize) {
        const idx = expanded.length;
        expanded.push({
          id: `tile_${idx + 1}`,
          activityId: "",
          occurrenceIndex: 0,
          title: "",
          icon: "🌸",
          category: "joy",
          activityType: "simple",
          targetValue: 1,
          currentValue: 0,
          completed: false,
        });
      }
      setTiles(expanded);
    }
  };

  const confirmShrink = () => {
    setSize(3);
    setShowShrinkWarning(false);
    // Keep first 9 tiles
    setTiles(tiles.slice(0, 9));
  };

  // Assign activity to active slot
  const assignActivityToSlot = (act: SelfCareActivity, slotIdx: number) => {
    const updated = [...tiles];
    updated[slotIdx] = {
      ...updated[slotIdx],
      activityId: act.id,
      title: act.title,
      titleAr: act.titleAr,
      icon: act.icon || "🌸",
      category: act.category,
      activityType:
        act.sourceType === "wellness"
          ? "hydration"
          : act.estimatedDurationMinutes && act.estimatedDurationMinutes > 0
          ? "duration"
          : "simple",
      targetValue: act.estimatedDurationMinutes || 1,
      currentValue: 0,
      completed: false,
    };
    setTiles(updated);
    setActiveSlotIdx(null);
  };

  // Assign idea to active slot
  const assignIdeaToSlot = (idea: StarterBingoIdea, slotIdx: number) => {
    const updated = [...tiles];
    updated[slotIdx] = {
      ...updated[slotIdx],
      activityId: `idea_${idea.id}`,
      title: idea.titleEn,
      titleAr: idea.titleAr,
      icon: idea.icon,
      category: idea.category,
      activityType: idea.activityType,
      targetValue: idea.defaultTargetValue,
      currentValue: 0,
      completed: false,
    };
    setTiles(updated);
    setActiveSlotIdx(null);
  };

  // Create custom activity and assign
  const handleCreateAndAssignCustom = (slotIdx: number) => {
    if (!customTitle.trim()) return;
    const newActId = onAddCustomActivity({
      title: customTitle.trim(),
      icon: customIcon,
      category: "joy",
      estimatedDurationMinutes: customDuration > 0 ? customDuration : undefined,
    });

    const updated = [...tiles];
    updated[slotIdx] = {
      ...updated[slotIdx],
      activityId: newActId,
      title: customTitle.trim(),
      icon: customIcon,
      category: "joy",
      activityType: customDuration > 0 ? "duration" : "simple",
      targetValue: customDuration > 0 ? customDuration : 1,
      currentValue: 0,
      completed: false,
    };
    setTiles(updated);
    setIsAddingCustom(false);
    setCustomTitle("");
    setActiveSlotIdx(null);
  };

  // Auto-fill empty slots with curated ideas
  const handleAutoFillWithIdeas = () => {
    const updated = [...tiles];
    let ideaIdx = 0;
    for (let i = 0; i < totalSlots; i++) {
      if (!updated[i]?.title && ideaIdx < STARTER_BINGO_IDEAS.length) {
        const idea = STARTER_BINGO_IDEAS[ideaIdx++];
        updated[i] = {
          ...updated[i],
          activityId: `idea_${idea.id}`,
          title: idea.titleEn,
          titleAr: idea.titleAr,
          icon: idea.icon,
          category: idea.category,
          activityType: idea.activityType,
          targetValue: idea.defaultTargetValue,
          currentValue: 0,
          completed: false,
        };
      }
    }
    setTiles(updated);
  };

  const handleSave = () => {
    const boardToSave: SelfCareBingoBoard = {
      id: existingBoard?.id || `bingo_${weekStartDate}_${size}x${size}`,
      weekStartDate,
      weekEndDate,
      size,
      theme,
      tiles: tiles.slice(0, totalSlots),
      celebrationsEnabled,
      createdAt: existingBoard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveBoard(boardToSave);
    onClose();
  };

  const themeDef = BINGO_THEMES[theme];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-card border border-border/80 shadow-2xl text-ink animate-scale-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-surface/50">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span>{isAr ? "إعداد لوحة بينغو الأسبوع" : "Setup Weekly Bingo Board"}</span>
              <span className="text-pink-500">🌸</span>
            </h2>
            <p className="text-xs text-ink-light">
              {weekStartDate} — {weekEndDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-surface"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* 1. Size Selection */}
          <div>
            <label className="text-xs font-bold text-ink-light uppercase tracking-wider block mb-2">
              {isAr ? "حجم اللوحة" : "Board Size"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSizeChange(3)}
                className={cn(
                  "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                  size === 3
                    ? "border-hotpink bg-pink-50/60 dark:bg-pink-950/20 text-hotpink shadow-sm font-bold"
                    : "border-border bg-card text-ink hover:bg-surface"
                )}
              >
                <span className="text-lg">🌸 3×3</span>
                <span className="text-xs font-medium opacity-80">
                  {isAr ? "9 مربعات (مريح وموصى به)" : "9 tiles (gentle & cozy)"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSizeChange(4)}
                className={cn(
                  "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                  size === 4
                    ? "border-hotpink bg-pink-50/60 dark:bg-pink-950/20 text-hotpink shadow-sm font-bold"
                    : "border-border bg-card text-ink hover:bg-surface"
                )}
              >
                <span className="text-lg">🌿 4×4</span>
                <span className="text-xs font-medium opacity-80">
                  {isAr ? "16 مربعاً (أنشطة أكثر)" : "16 tiles (more moments)"}
                </span>
              </button>
            </div>
          </div>

          {/* Shrink Warning Modal / Banner */}
          {showShrinkWarning && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-xs text-amber-800 dark:text-amber-200 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={16} />
                <span>
                  {isAr ? "تأكيد تغيير الحجم إلى 3×3" : "Confirm reducing size to 3×3"}
                </span>
              </div>
              <p>
                {isAr
                  ? "سيتم الاحتفاظ بأول 9 مربعات فقط، وستتم إزالة المربعات الـ 7 الأخيرة من اللوحة. إزالة أي مربع لا يحذف نشاطه أو سجله التاريخي."
                  : "Only the first 9 tiles will be kept on the board. Removing tiles from the board does not erase their activities or historical records."}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={confirmShrink}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  {isAr ? "نعم، تقليص اللوحة" : "Yes, reduce size"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowShrinkWarning(false)}
                  className="px-3 py-1.5 rounded-xl border border-amber-400 font-medium"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {/* 2. Theme Selection */}
          <div>
            <label className="text-xs font-bold text-ink-light uppercase tracking-wider block mb-2">
              {isAr ? "سمة الألوان الهادئة" : "Pastel Theme"}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {Object.values(BINGO_THEMES).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap",
                    theme === th.id
                      ? "ring-2 ring-hotpink ring-offset-1 border-transparent shadow-sm"
                      : "border-border bg-card hover:bg-surface text-ink"
                  )}
                  style={{
                    backgroundColor: theme === th.id ? th.boardBgHex : undefined,
                    color: th.darkPlumText,
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 inline-block"
                    style={{ backgroundColor: th.tileBorderHex }}
                  />
                  <span>{isAr ? th.nameAr : th.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tiles Setup Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-ink-light uppercase tracking-wider">
                {isAr ? `مربعات اللوحة (${totalSlots})` : `Board Tiles (${totalSlots})`}
              </label>
              <button
                type="button"
                onClick={handleAutoFillWithIdeas}
                className="text-xs font-bold text-pink-600 hover:text-pink-700 underline flex items-center gap-1"
              >
                <Sparkles size={12} />
                <span>{isAr ? "ملء الفراغات بأفكار لطيفة" : "Fill empty slots with ideas"}</span>
              </button>
            </div>

            {/* Grid preview of slots */}
            <div
              className={cn(
                "grid gap-2 p-3 rounded-2xl border transition-all",
                size === 3 ? "grid-cols-3" : "grid-cols-4"
              )}
              style={{ backgroundColor: themeDef.boardBgHex }}
            >
              {tiles.slice(0, totalSlots).map((tile, idx) => {
                const title = (isAr && tile.titleAr) ? tile.titleAr : tile.title;
                const isSelected = activeSlotIdx === idx;
                return (
                  <button
                    key={tile.id || idx}
                    type="button"
                    onClick={() => setActiveSlotIdx(isSelected ? null : idx)}
                    className={cn(
                      "p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all min-h-[64px]",
                      isSelected
                        ? "ring-2 ring-pink-500 border-pink-500 bg-pink-50"
                        : "border-pink-200/80 bg-white hover:bg-pink-50/50"
                    )}
                  >
                    <span className="text-xl">{tile.icon || "🌸"}</span>
                    <span className="text-[10px] font-bold line-clamp-1 mt-0.5" style={{ color: themeDef.darkPlumText }}>
                      {title || (isAr ? `المربع ${idx + 1}` : `Slot ${idx + 1}`)}
                    </span>
                    {!title && (
                      <span className="text-[9px] text-pink-600 font-semibold">{isAr ? "+ اختر" : "+ Set"}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot Activity Picker Drawer if a slot is selected */}
          {activeSlotIdx !== null && (
            <div className="p-4 rounded-2xl bg-surface border border-pink-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-xs font-bold text-ink">
                  {isAr ? `اختيار نشاط للمربع رقم ${activeSlotIdx + 1}` : `Choose activity for Slot ${activeSlotIdx + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSlotIdx(null)}
                  className="text-xs text-ink-light hover:text-ink font-bold"
                >
                  {isAr ? "إغلاق" : "Done"}
                </button>
              </div>

              {/* Option A: Pick from Existing User Activities */}
              {activities.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-ink-light block mb-1">
                    {isAr ? "من أنشطتي الحالية:" : "From My Activities:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    {activities.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => assignActivityToSlot(act, activeSlotIdx)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-card border border-border text-xs text-ink hover:border-pink-400 active:scale-95 transition-all"
                      >
                        <span>{act.icon}</span>
                        <span className="font-medium">{act.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Option B: Pick from Curated Ideas */}
              <div>
                <span className="text-[11px] font-bold text-ink-light block mb-1">
                  {isAr ? "من الأفكار المقترحة:" : "From Curated Ideas:"}
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {STARTER_BINGO_IDEAS.map((idea) => (
                    <button
                      key={idea.id}
                      type="button"
                      onClick={() => assignIdeaToSlot(idea, activeSlotIdx)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-card border border-border text-xs text-ink hover:border-pink-400 active:scale-95 transition-all"
                    >
                      <span>{idea.icon}</span>
                      <span className="font-medium">{isAr ? idea.titleAr : idea.titleEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option C: Add custom activity */}
              <div className="pt-2 border-t border-border/40">
                {!isAddingCustom ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(true)}
                    className="text-xs font-bold text-hotpink hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>{isAr ? "كتابة نشاط مخصص جديد" : "Write a custom care activity"}</span>
                  </button>
                ) : (
                  <div className="space-y-2 bg-card p-3 rounded-xl border border-pink-200">
                    <span className="text-xs font-bold text-ink block">
                      {isAr ? "إضافة نشاط مخصص جديد" : "New Custom Care Activity"}
                    </span>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder={isAr ? "مثال: الاستماع إلى سورة مهدئة" : "e.g. Listen to calming recitation"}
                      className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-hotpink"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <span>{isAr ? "أيقونة:" : "Icon:"}</span>
                        {["🌸", "📖", "☕", "🌿", "🕊️", "🧘‍♀️", "🌙"].map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setCustomIcon(ic)}
                            className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center text-sm",
                              customIcon === ic ? "bg-pink-100 ring-1 ring-hotpink" : "hover:bg-surface"
                            )}
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingCustom(false)}
                        className="px-2.5 py-1 text-xs text-ink-light"
                      >
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateAndAssignCustom(activeSlotIdx)}
                        className="px-3 py-1 rounded-lg bg-hotpink text-white text-xs font-bold shadow-sm"
                      >
                        {isAr ? "حفظ وتعيين للمربع" : "Save & Assign"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Celebrations Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border/60">
            <div className="pr-2">
              <span className="text-xs font-bold text-ink block">
                {isAr ? "احتفالات خطوط البينغو 🌸" : "Bingo Line Celebrations 🌸"}
              </span>
              <span className="text-[11px] text-ink-light block">
                {isAr ? "إضاءة لطيفة للخطوط المكتملة" : "Subtle celebration when a line completes"}
              </span>
            </div>
            <input
              type="checkbox"
              checked={celebrationsEnabled}
              onChange={(e) => setCelebrationsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 cursor-pointer accent-hotpink"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/50 bg-surface/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-border text-ink hover:bg-surface transition-all"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-rose-sm hover:opacity-95 transition-all active:scale-95"
          >
            {isAr ? "حفظ لوحة البينغو ✨" : "Save Bingo Board ✨"}
          </button>
        </div>
      </div>
    </div>
  );
};
