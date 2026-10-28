import React, { useState } from "react";
import { X, Shield, Download, Bell, Droplets } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

interface SelfCareSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SelfCareSettingsModal: React.FC<SelfCareSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, lang } = useLang();
  const { state } = useApp();
  const isAr = lang === "ar";

  const [showWellnessSnapshot, setShowWellnessSnapshot] = useState(true);

  if (!isOpen) return null;

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      activities: state.selfCareActivities || [],
      planItems: state.selfCarePlanItems || [],
      checkIns: state.selfCareCheckIns || {},
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ayxa_selfcare_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border/80 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="text-base font-bold text-ink">
              {isAr ? "إعدادات العناية والخصوصية" : "Self-care Settings"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Setting: Wellness Snapshot */}
        <div className="p-3.5 rounded-2xl bg-surface border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Droplets size={16} className="text-sky-500" />
            <div>
              <p className="text-xs font-bold text-ink">
                {isAr ? "بطاقة لمحة العافية المدمجة" : "Compact Wellness Snapshot"}
              </p>
              <p className="text-[10px] text-ink-light">
                {isAr
                  ? "عرض بطاقة الماء المتزامنة مع العافية في تبويب اليوم"
                  : "Show synchronized hydration card on Today tab"}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={showWellnessSnapshot}
            onChange={(e) => setShowWellnessSnapshot(e.target.checked)}
            className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
          />
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 flex items-start gap-2.5">
          <Shield size={16} className="text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-pink-700 dark:text-pink-300">
              {isAr ? "خصوصيتكِ مقدسة" : "Your Privacy is Protected"}
            </h4>
            <p className="text-[11px] text-ink-light leading-relaxed">
              {isAr
                ? "جميع اختيارات العناية، والملاحظات، وتفقد الاحتياجات تُحفظ محليًا فقط على جهازكِ. الذكاء الاصطناعي لا يملك أي وصول إليها."
                : "All care choices, private notes, and check-in needs stay local on your device. AYXA AI has zero automatic access."}
            </p>
          </div>
        </div>

        {/* Export Data */}
        <button
          onClick={handleExportData}
          className="w-full py-2.5 px-3 rounded-2xl bg-surface border border-border/60 hover:bg-ghost text-ink text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Download size={14} className="text-pink-500" />
          <span>{isAr ? "تصدير بيانات العناية (JSON)" : "Export Self-care Data (JSON)"}</span>
        </button>

        {/* Close */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-rose-sm active:scale-95"
          >
            {isAr ? "تم" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
};
