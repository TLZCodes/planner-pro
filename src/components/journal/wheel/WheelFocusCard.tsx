import React, { useState } from "react";
import {
  type WheelAreaConfig,
  type WheelOfBecomingRecord,
} from "@/lib/wheelOfBecomingEngine";
import { type Goal } from "@/lib/store";
import { Heart, Sparkles, Target, Link as LinkIcon, Unlink, Plus, Check } from "lucide-react";

interface WheelFocusCardProps {
  record: WheelOfBecomingRecord;
  areas: WheelAreaConfig[];
  goals: Goal[];
  onSelectFocusArea: (areaId?: string) => void;
  onIntentionChange: (intention: string) => void;
  onGentleActionChange: (action: string) => void;
  onLinkGoal: (goalId: string) => void;
  onUnlinkGoal: () => void;
  onOpenCreateGoalModal?: () => void;
  isAr?: boolean;
}

export function WheelFocusCard({
  record,
  areas,
  goals,
  onSelectFocusArea,
  onIntentionChange,
  onGentleActionChange,
  onLinkGoal,
  onUnlinkGoal,
  onOpenCreateGoalModal,
  isAr = false,
}: WheelFocusCardProps) {
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const activeAreas = areas.filter((a) => !a.hidden);
  const linkedGoal = goals.find((g) => g.id === record.linkedGoalId);
  const selectedArea = activeAreas.find((a) => a.id === record.focusAreaId);

  return (
    <div className="rounded-3xl border border-rose-200/80 bg-gradient-to-br from-[#FFF9F6] via-white to-rose-50/30 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Question Header */}
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 shrink-0 shadow-2xs mt-0.5">
          <Heart size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#3D1E28] leading-snug">
            {isAr
              ? "أي جانب ترغبين في منحه بعض الاهتمام هذا الشهر؟ 🌸"
              : "What would you like to give a little care to this month? 🌸"}
          </h3>
          <p className="text-[11px] text-[#7A5B64] mt-0.5">
            {isAr
              ? "اختاري جانبًا واحدًا ترغبين في مرافقته برفق، دون أي ضغط أو شروط."
              : "Choose one area to gently accompany this month, free from pressure or rigid targets."}
          </p>
        </div>
      </div>

      {/* Area Selection Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {activeAreas.map((area) => {
          const isSelected = record.focusAreaId === area.id;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => onSelectFocusArea(isSelected ? undefined : area.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#9D174D] text-white shadow-rose-xs scale-102"
                  : "bg-white/80 border border-[#F2E5E3] text-[#3D1E28] hover:bg-rose-50/50"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: isSelected ? "#FFFFFF" : area.color }}
              />
              <span>{isAr ? area.nameAr : area.nameEn}</span>
              {isSelected && <Check size={12} />}
            </button>
          );
        })}
      </div>

      {/* Intention & Gentle Action Inputs */}
      <div className="space-y-3 pt-1">
        <div>
          <label className="block text-xs font-bold text-[#3D1E28] mb-1">
            {isAr ? "نيتكِ اللطيفة لهذا الشهر:" : "Your gentle intention:"}
          </label>
          <input
            type="text"
            value={record.focusIntention || ""}
            onChange={(e) => onIntentionChange(e.target.value)}
            placeholder={
              isAr
                ? "مثال: الاستمتاع بصباحات هادئة، أو النوم باكرًا..."
                : "e.g., Savoring quiet mornings, or resting when tired..."
            }
            dir="auto"
            className="w-full rounded-2xl bg-white border border-[#F2E5E3] px-3.5 py-2 text-xs text-[#3D1E28] placeholder-[#A89297] focus:outline-none focus:ring-2 focus:ring-rose-300/40"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#3D1E28] mb-1">
            {isAr ? "خطوة رقيقة واحدة (اختياري):" : "One gentle action (optional):"}
          </label>
          <input
            type="text"
            value={record.gentleAction || ""}
            onChange={(e) => onGentleActionChange(e.target.value)}
            placeholder={
              isAr
                ? "مثال: تحضير كوب شاي دافئ قبل النوم..."
                : "e.g., Brew a warm tea before bed without checking notifications..."
            }
            dir="auto"
            className="w-full rounded-2xl bg-white border border-[#F2E5E3] px-3.5 py-2 text-xs text-[#3D1E28] placeholder-[#A89297] focus:outline-none focus:ring-2 focus:ring-rose-300/40"
          />
        </div>
      </div>

      {/* Explicit Goal Linking Section */}
      <div className="pt-2 border-t border-[#F2E5E3]/70">
        {linkedGoal ? (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-rose-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-xl bg-rose-50 text-[#9D174D]">
                <Target size={14} />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-[#A89297] font-semibold block">
                  {isAr ? "هدف مرتبط بهذا الجانب:" : "Linked Goal:"}
                </span>
                <span className="text-xs font-bold text-[#3D1E28] truncate block">
                  {linkedGoal.title}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onUnlinkGoal}
              className="text-xs font-semibold text-[#A89297] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              title={isAr ? "إلغاء ربط الهدف" : "Unlink goal"}
              aria-label={isAr ? "إلغاء ربط الهدف" : "Unlink goal"}
            >
              <Unlink size={14} />
            </button>
          </div>
        ) : (
          <div>
            {!isLinkingOpen ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLinkingOpen(true)}
                  className="text-xs font-bold text-[#E87A90] hover:text-[#9D174D] flex items-center gap-1.5 py-1 transition-colors"
                >
                  <LinkIcon size={13} />
                  <span>{isAr ? "+ ربط هدف من أهدافي" : "+ Link an existing Goal"}</span>
                </button>

                {onOpenCreateGoalModal && (
                  <>
                    <span className="text-xs text-[#A89297]">•</span>
                    <button
                      type="button"
                      onClick={onOpenCreateGoalModal}
                      className="text-xs font-bold text-[#E87A90] hover:text-[#9D174D] flex items-center gap-1.5 py-1 transition-colors"
                    >
                      <Plus size={13} />
                      <span>{isAr ? "تحويل النية إلى هدف" : "Turn intention into a Goal"}</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2 p-3 rounded-2xl bg-white border border-[#F2E5E3]">
                <div className="flex items-center justify-between text-xs font-bold text-[#3D1E28]">
                  <span>{isAr ? "اختاري هدفًا للربط:" : "Choose a goal to link:"}</span>
                  <button
                    type="button"
                    onClick={() => setIsLinkingOpen(false)}
                    className="text-[#A89297] hover:text-[#3D1E28]"
                  >
                    ✕
                  </button>
                </div>

                {goals.length === 0 ? (
                  <p className="text-[11px] text-[#A89297] py-1">
                    {isAr ? "لا توجد أهداف نشطة حاليًا." : "No active goals found."}
                  </p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {goals.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          onLinkGoal(g.id);
                          setIsLinkingOpen(false);
                        }}
                        className="w-full text-start p-2 rounded-xl text-xs font-medium text-[#3D1E28] hover:bg-rose-50 flex items-center justify-between"
                      >
                        <span className="truncate">{g.title}</span>
                        <span className="text-[10px] text-[#A89297] ms-2">{g.category || "General"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
