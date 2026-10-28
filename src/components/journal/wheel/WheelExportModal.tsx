import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import {
  type WheelOfBecomingRecord,
  formatMonthLabel,
} from "@/lib/wheelOfBecomingEngine";
import { WheelSvg } from "./WheelSvg";
import { X, Download, Sparkles, Check, Info } from "lucide-react";

interface WheelExportModalProps {
  open: boolean;
  onClose: () => void;
  record: WheelOfBecomingRecord;
  isAr?: boolean;
}

export function WheelExportModal({
  open,
  onClose,
  record,
  isAr = false,
}: WheelExportModalProps) {
  const [includeValues, setIncludeValues] = useState(true);
  const [includeFocus, setIncludeFocus] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false); // default off
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const previewCardRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const monthLabel = formatMonthLabel(record.yearMonth, isAr);
  const activeAreas = record.areas.filter((a) => !a.hidden);
  const focusArea = activeAreas.find((a) => a.id === record.focusAreaId);

  const handleDownload = async () => {
    if (!previewCardRef.current) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const canvas = await html2canvas(previewCardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#FFF9F6",
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const filename = `AYXA_Wheel_of_Becoming_${record.yearMonth}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#FFF9F6] rounded-t-3xl sm:rounded-3xl border border-[#F2E5E3] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F2E5E3] flex items-center justify-between bg-white/80">
          <div>
            <h3 className="text-sm font-bold text-[#3D1E28]">
              {isAr ? "تصدير دائرة التوازن 🌸" : "Export Wheel of Becoming 🌸"}
            </h3>
            <span className="text-[11px] text-[#7A5B64]">{monthLabel}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-black/5 text-[#7A5B64] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Export Toggles */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#F2E5E3] shadow-2xs space-y-2 text-xs">
            <span className="font-bold text-[#3D1E28] block mb-1">
              {isAr ? "خيارات المحتوى المصدر:" : "Included Content Options:"}
            </span>

            <label className="flex items-center gap-2 cursor-pointer text-[#3D1E28]">
              <input
                type="checkbox"
                checked={includeValues}
                onChange={(e) => setIncludeValues(e.target.checked)}
                className="accent-[#E87A90] rounded"
              />
              <span>{isAr ? "تضمين قيم التقييم ومسميات الجوانب" : "Include area labels and satisfaction ratings"}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-[#3D1E28]">
              <input
                type="checkbox"
                checked={includeFocus}
                onChange={(e) => setIncludeFocus(e.target.checked)}
                className="accent-[#E87A90] rounded"
              />
              <span>{isAr ? "تضمين مجال الاهتمام والنية المختارة" : "Include selected gentle focus and intention"}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-[#3D1E28]">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="accent-[#E87A90] rounded"
              />
              <span>{isAr ? "تضمين الملاحظات الشخصية والتأملات (افتراضيًا معطل)" : "Include reflection notes (default off for privacy)"}</span>
            </label>
          </div>

          {/* Privacy Notice Banner */}
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-800">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              {isAr
                ? "تنبيه الخصوصية: الصور المصدرة تُحفظ في ألبوم جهازكِ خارج قفل PIN الخاص باليوميات."
                : "Privacy Note: Exported images are saved to your device outside Journal's in-app PIN lock."}
            </span>
          </div>

          {/* Live Preview Card (Target of html2canvas) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#7A5B64] px-1">
              {isAr ? "معاينة الصورة قبل التحميل:" : "Live Export Preview:"}
            </span>

            <div
              ref={previewCardRef}
              className="p-5 rounded-3xl bg-[#FFF9F6] border border-[#F2E5E3] shadow-md space-y-4 max-w-sm mx-auto"
            >
              {/* Header inside export */}
              <div className="text-center space-y-0.5 border-b border-[#F2E5E3]/80 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E87A90]">
                  AYXA Planner Pro
                </span>
                <h2 className="text-base font-serif font-black text-[#3D1E28]">
                  {isAr ? "دائرة التوازن 🌸" : "Wheel of Becoming 🌸"}
                </h2>
                <span className="text-xs text-[#7A5B64] font-medium block">
                  {monthLabel}
                </span>
              </div>

              {/* Wheel SVG */}
              <div className="py-2 flex justify-center">
                <WheelSvg record={record} isAr={isAr} />
              </div>

              {/* Focus Intention Section */}
              {includeFocus && (record.focusAreaId || record.focusIntention) && (
                <div className="p-3 rounded-2xl bg-white border border-[#F2E5E3] text-center space-y-1">
                  <span className="text-[10px] font-bold text-[#E87A90] uppercase tracking-wide">
                    {isAr ? "مجال الاهتمام والنية 🌸" : "Gentle Monthly Focus 🌸"}
                  </span>
                  {focusArea && (
                    <span className="block text-xs font-bold text-[#3D1E28]">
                      {isAr ? focusArea.nameAr : focusArea.nameEn}
                    </span>
                  )}
                  {record.focusIntention && (
                    <p className="text-xs text-[#7A5B64] italic">
                      "{record.focusIntention}"
                    </p>
                  )}
                </div>
              )}

              {/* Area Ratings Grid */}
              {includeValues && (
                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                  {activeAreas.map((a) => {
                    const r = record.ratings[a.id];
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/70 border border-[#F2E5E3]/60"
                      >
                        <span className="text-[#3D1E28] font-medium truncate">
                          {isAr ? a.nameAr : a.nameEn}
                        </span>
                        <span className="font-bold text-[#9D174D]">
                          {typeof r === "number" ? `${r}/10` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Notes excerpt if enabled */}
              {includeNotes && Object.keys(record.notes || {}).length > 0 && (
                <div className="p-3 rounded-2xl bg-white/80 border border-[#F2E5E3] space-y-1.5 text-xs text-start">
                  <span className="font-bold text-[#3D1E28] block text-[10px] uppercase">
                    {isAr ? "خواطر وتأملات الجوانب:" : "Area Notes:"}
                  </span>
                  {Object.entries(record.notes).map(([aId, txt]) => {
                    const a = activeAreas.find((item) => item.id === aId);
                    if (!a || !txt.trim()) return null;
                    return (
                      <div key={aId} className="text-[11px] text-[#7A5B64]">
                        <span className="font-bold text-[#3D1E28]">{isAr ? a.nameAr : a.nameEn}: </span>
                        <span>{txt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="text-center pt-2 border-t border-[#F2E5E3]/60">
                <span className="text-[9px] text-[#A89297]">
                  {isAr
                    ? "تأمل شخصي خاص — لا يمثل تقييمًا لجدارتكِ، بل مساحة لرعاية ما تحبين 🌸"
                    : "A subjective monthly reflection — not a test of worth, but space to tend what matters 🌸"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F2E5E3] bg-white/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A5B64] hover:bg-black/5 transition-colors"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {exportSuccess ? <Check size={14} /> : <Download size={14} />}
            <span>
              {isExporting
                ? isAr
                  ? "جاري الحفظ..."
                  : "Exporting..."
                : exportSuccess
                ? isAr
                  ? "تم التصدير بنجاح!"
                  : "Saved Successfully!"
                : isAr
                ? "تأكيد وتحميل الصورة"
                : "Confirm & Download Image"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
