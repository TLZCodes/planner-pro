import { useState, useEffect, memo } from "react";
import { type MonthlyReadingTarget, getCurrentYearMonth } from "@/lib/bookshelfEngine";
import { useLang } from "@/lib/i18n";
import { X, Target, BookOpen, Layers, Clock } from "lucide-react";

interface MonthlyTargetModalProps {
  open: boolean;
  currentTarget?: MonthlyReadingTarget;
  onClose: () => void;
  onSave: (target: MonthlyReadingTarget) => void;
}

export const MonthlyTargetModal = memo(function MonthlyTargetModal({
  open,
  currentTarget,
  onClose,
  onSave,
}: MonthlyTargetModalProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const curMonth = getCurrentYearMonth();

  const [type, setType] = useState<"books" | "pages" | "minutes">("books");
  const [val, setVal] = useState("2");

  useEffect(() => {
    if (currentTarget && currentTarget.yearMonth === curMonth) {
      setType(currentTarget.type);
      setVal(String(currentTarget.targetValue || 2));
    } else {
      setType("books");
      setVal("2");
    }
  }, [currentTarget, curMonth, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Math.max(1, parseInt(val || "1", 10));
    onSave({
      yearMonth: curMonth,
      type,
      targetValue: num,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm flex flex-col bg-[#FFF9F6] rounded-t-3xl sm:rounded-3xl border border-[#F2E5E3] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#F2E5E3] flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-100 text-rose-700">
              <Target size={16} />
            </span>
            <h2 className="font-serif font-bold text-sm text-[#3D1E28]">
              {isAr ? "نية القراءة لهذا الشهر 🌸" : "Monthly Reading Intention 🌸"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 active:scale-95 text-[#7A5B64] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#7A5B64]">
            {isAr
              ? "اختاري هدفاً لطيفاً وقابلاً للتحقيق يرافقكِ هذا الشهر دون ضغط."
              : "Choose a gentle, achievable intention to guide your month at your own pace."}
          </p>

          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "books" as const, labelEn: "Books", labelAr: "كتب", icon: BookOpen },
              { key: "pages" as const, labelEn: "Pages", labelAr: "صفحات", icon: Layers },
              { key: "minutes" as const, labelEn: "Minutes", labelAr: "دقائق", icon: Clock },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = type === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setType(item.key);
                    if (item.key === "books") setVal("2");
                    if (item.key === "pages") setVal("300");
                    if (item.key === "minutes") setVal("450");
                  }}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#FFF0F3] border-[#E87A90] text-[#9D174D] shadow-xs"
                      : "bg-white border-[#F2E5E3] text-[#7A5B64] hover:bg-rose-50/50"
                  }`}
                >
                  <Icon size={16} />
                  <span>{isAr ? item.labelAr : item.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Number Value Input */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E28] mb-1">
              {type === "books"
                ? isAr
                  ? "عدد الكتب المستهدفة:"
                  : "Target Books:"
                : type === "pages"
                ? isAr
                  ? "عدد الصفحات المستهدفة:"
                  : "Target Pages:"
                : isAr
                ? "إجمالي الدقائق المستهدفة:"
                : "Target Reading Minutes:"}
            </label>
            <input
              type="number"
              min="1"
              required
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#F2E5E3] text-[#7A5B64] text-xs font-semibold hover:bg-black/5 active:scale-95 transition-all"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 transition-all"
            >
              {isAr ? "حفظ النية 🌸" : "Save Intention 🌸"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
