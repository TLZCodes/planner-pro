import React, { useState } from "react";
import {
  type WheelAreaConfig,
} from "@/lib/wheelOfBecomingEngine";
import {
  Moon,
  Apple,
  Smile,
  Sprout,
  BookOpen,
  Coins,
  Briefcase,
  Users,
  Coffee,
  Home,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  MessageSquare,
} from "lucide-react";

interface WheelAreaCardProps {
  area: WheelAreaConfig;
  rating?: number;
  note?: string;
  isFocused?: boolean;
  onRate: (areaId: string, rating?: number) => void;
  onNoteChange: (areaId: string, note: string) => void;
  isAr?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Moon,
  Apple,
  Smile,
  Sprout,
  BookOpen,
  Coins,
  Briefcase,
  Users,
  Coffee,
  Home,
  Sparkles,
};

export function WheelAreaCard({
  area,
  rating,
  note = "",
  isFocused = false,
  onRate,
  onNoteChange,
  isAr = false,
}: WheelAreaCardProps) {
  const [showNoteInput, setShowNoteInput] = useState(() => Boolean(note.trim()));
  const IconComp = ICON_MAP[area.icon] || Sparkles;

  const isRated = typeof rating === "number" && rating >= 1 && rating <= 10;
  const currentRatingValue = isRated ? rating : 5; // Slider visual default if dragging, but unrated indicator shown

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onRate(area.id, val);
  };

  return (
    <div
      id={`area-card-${area.id}`}
      className={`rounded-2xl border transition-all duration-300 p-4 bg-white/90 shadow-xs ${
        isFocused
          ? "border-rose-400 ring-2 ring-rose-300/40 bg-rose-50/20"
          : isRated
          ? "border-[#F2E5E3]"
          : "border-[#F2E5E3]/70 opacity-95"
      }`}
    >
      {/* Header: Icon, Area Name, and Current Rating Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0 shadow-2xs"
            style={{ backgroundColor: `${area.color}20`, color: area.color }}
          >
            <IconComp size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#3D1E28] truncate">
              {isAr ? area.nameAr : area.nameEn}
            </h4>
            <span className="text-[10px] text-[#A89297] font-medium block">
              {isRated ? `${rating} / 10` : isAr ? "غير مقيّم" : "Not rated"}
            </span>
          </div>
        </div>

        {/* Clear / Skip Action */}
        {isRated && (
          <button
            type="button"
            onClick={() => onRate(area.id, undefined)}
            className="text-[11px] font-semibold text-[#A89297] hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 active:scale-95"
            title={isAr ? "مسح التقييم" : "Clear rating"}
            aria-label={`${isAr ? "مسح تقييم" : "Clear rating for"} ${isAr ? area.nameAr : area.nameEn}`}
          >
            <X size={12} />
            <span>{isAr ? "مسح" : "Clear"}</span>
          </button>
        )}
      </div>

      {/* Accessible 1-10 Button Strip (>= 44x44 touch targets) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-medium text-[#7A5B64] px-0.5">
          <span>{isAr ? "1: يحتاج رعاية" : "1: Needs care"}</span>
          <span>{isAr ? "10: مُرضٍ وممتلئ" : "10: Deeply fulfilling"}</span>
        </div>

        <div className="grid grid-cols-10 gap-1 overflow-x-auto pb-0.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const isSelected = rating === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onRate(area.id, num)}
                className={`min-h-[44px] min-w-[32px] rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all active:scale-90 ${
                  isSelected
                    ? "bg-[#9D174D] text-white shadow-rose-xs scale-105"
                    : "bg-[#FFF9F6] border border-[#F2E5E3] text-[#3D1E28] hover:bg-rose-50/60"
                }`}
                aria-pressed={isSelected}
                aria-label={`${isAr ? area.nameAr : area.nameEn}: ${num}`}
              >
                <span>{num}</span>
              </button>
            );
          })}
        </div>

        {/* Range Slider as Direct Accessible Alternative */}
        <div className="pt-2 px-1">
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={currentRatingValue}
            onChange={handleSliderChange}
            className="w-full accent-[#E87A90] cursor-pointer"
            aria-label={`${isAr ? "شريط تقييم" : "Rating slider for"} ${isAr ? area.nameAr : area.nameEn}`}
          />
        </div>
      </div>

      {/* Optional Note Section */}
      <div className="mt-3 pt-2.5 border-t border-[#F2E5E3]/60">
        {!showNoteInput && !note.trim() ? (
          <button
            type="button"
            onClick={() => setShowNoteInput(true)}
            className="text-[11px] font-medium text-[#E87A90] hover:text-[#9D174D] flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare size={12} />
            <span>{isAr ? "+ كتابة ملاحظة أو فكرة" : "+ Add a reflection note"}</span>
          </button>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#7A5B64]">
              <span>{isAr ? "ملاحظة أو فكرة شخصية:" : "Personal reflection:"}</span>
              <button
                type="button"
                onClick={() => {
                  if (!note.trim()) setShowNoteInput(false);
                }}
                className="text-[10px] text-[#A89297] hover:text-[#3D1E28]"
              >
                {note.trim() ? "" : isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(area.id, e.target.value)}
              placeholder={
                isAr
                  ? "ما الذي تشعرين به تجاه هذا الجانب حاليًا؟..."
                  : "How does this area feel right now? Any small thought..."
              }
              rows={2}
              dir="auto"
              className="w-full rounded-xl bg-[#FFF9F6] border border-[#F2E5E3] p-2 text-xs text-[#3D1E28] placeholder-[#A89297] focus:outline-none focus:ring-1 focus:ring-rose-300 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
