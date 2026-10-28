import React from "react";
import {
  type WheelOfBecomingRecord,
  compareMonthRecords,
  formatMonthLabel,
} from "@/lib/wheelOfBecomingEngine";
import { ArrowLeftRight, AlertCircle, EyeOff } from "lucide-react";

interface WheelComparisonViewProps {
  currentRecord: WheelOfBecomingRecord;
  previousRecord?: WheelOfBecomingRecord | null;
  onClose: () => void;
  isAr?: boolean;
}

export function WheelComparisonView({
  currentRecord,
  previousRecord,
  onClose,
  isAr = false,
}: WheelComparisonViewProps) {
  const comparison = compareMonthRecords(currentRecord, previousRecord);
  const prevLabel = formatMonthLabel(comparison.previousYearMonth, isAr);
  const currLabel = formatMonthLabel(comparison.currentYearMonth, isAr);

  if (!previousRecord) {
    return (
      <div className="rounded-3xl border border-[#F2E5E3] bg-white p-5 shadow-xs text-center space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
            <ArrowLeftRight size={14} className="text-[#E87A90]" />
            <span>{isAr ? "مقارنة مع الشهر السابق" : "Month Comparison"}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#A89297] hover:text-[#3D1E28]"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>
        </div>
        <p className="text-xs text-[#7A5B64] py-2">
          {isAr
            ? `لا يوجد تأمل مسجل لشهر ${prevLabel}. ستظهر المقارنة حين يتوفر لديكِ تأملان متتاليان.`
            : `No reflection record found for ${prevLabel}. Comparisons appear when you have consecutive monthly check-ins.`}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#F2E5E3] bg-white/95 p-4 sm:p-5 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F2E5E3] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-purple-50 text-purple-700">
            <ArrowLeftRight size={14} />
          </span>
          <div>
            <h4 className="text-xs font-bold text-[#3D1E28]">
              {isAr ? "مقارنة هادئة بين الشهرين 🌸" : "Gentle Month Comparison 🌸"}
            </h4>
            <span className="text-[10px] text-[#A89297]">
              {prevLabel} ➔ {currLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-[#A89297] hover:text-[#3D1E28] flex items-center gap-1"
        >
          <EyeOff size={13} />
          <span>{isAr ? "إخفاء المقارنة" : "Hide"}</span>
        </button>
      </div>

      {/* Changed definitions warning */}
      {comparison.definitionChangedWarning && (
        <div className="flex items-start gap-2 p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-800 text-[11px]">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>
            {isAr
              ? comparison.definitionChangedWarning.ar
              : comparison.definitionChangedWarning.en}
          </span>
        </div>
      )}

      {/* Comparison Rows */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
        {comparison.areaComparisons.map((c) => {
          return (
            <div
              key={c.areaId}
              className="flex items-center justify-between p-2 rounded-xl bg-[#FFF9F6] border border-[#F2E5E3]/60 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="font-semibold text-[#3D1E28] truncate">
                  {isAr ? c.nameAr : c.nameEn}
                </span>
              </div>

              <div className="text-end shrink-0 ms-2">
                <span className="text-[11px] font-medium text-[#7A5B64]">
                  {isAr ? c.neutralTextAr : c.neutralTextEn}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
