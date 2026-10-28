import React, { useState } from "react";
import {
  type WheelReflectionNotes,
  WHEEL_REFLECTION_PROMPTS,
} from "@/lib/wheelOfBecomingEngine";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface WheelReflectionNotesProps {
  notes?: WheelReflectionNotes;
  onChange: (key: keyof WheelReflectionNotes, value: string) => void;
  isAr?: boolean;
}

export function WheelReflectionNotesView({
  notes = {},
  onChange,
  isAr = false,
}: WheelReflectionNotesProps) {
  const [isOpen, setIsOpen] = useState(false);

  const answeredCount = Object.values(notes).filter((v) => Boolean(v?.trim())).length;

  return (
    <div className="rounded-3xl border border-[#F2E5E3] bg-white/90 shadow-xs overflow-hidden">
      {/* Header Button to Toggle Accordion */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-start hover:bg-rose-50/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
            <Sparkles size={16} />
          </span>
          <div>
            <h4 className="text-xs font-bold text-[#3D1E28]">
              {isAr ? "تأملات الشهر الإضافية (اختياري) 🌿" : "Monthly Guided Reflections (Optional) 🌿"}
            </h4>
            <span className="text-[10px] text-[#A89297] font-medium">
              {answeredCount > 0
                ? isAr
                  ? `أجبتِ على ${answeredCount} من 4 أسئلة`
                  : `${answeredCount} of 4 prompts reflected on`
                : isAr
                ? "أسئلة لطيفة تمنح أفكاركِ متسعًا"
                : "Gentle prompts to give your thoughts space"}
            </span>
          </div>
        </div>

        <div className="p-1 rounded-lg text-[#7A5B64]">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 pt-1 border-t border-[#F2E5E3]/70 space-y-3.5 bg-rose-50/10">
          {WHEEL_REFLECTION_PROMPTS.map((prompt) => {
            const val = notes[prompt.key] || "";
            return (
              <div key={prompt.key} className="space-y-1">
                <label className="block text-xs font-semibold text-[#3D1E28]">
                  {isAr ? prompt.promptAr : prompt.promptEn}
                </label>
                <textarea
                  value={val}
                  onChange={(e) => onChange(prompt.key, e.target.value)}
                  placeholder={
                    isAr ? "اكتبي ما يخطر ببالكِ بكل حرية..." : "Write freely whatever comes to mind..."
                  }
                  rows={2}
                  dir="auto"
                  className="w-full rounded-2xl bg-white border border-[#F2E5E3] p-2.5 text-xs text-[#3D1E28] placeholder-[#A89297] focus:outline-none focus:ring-1 focus:ring-rose-300 resize-none shadow-2xs"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
