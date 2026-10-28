import { useState } from "react";
import { X, Sparkles, Shield, Zap, Sliders, Check, Coins, AlertCircle, Heart } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, type AiSettings, DEFAULT_AI_SETTINGS } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSettingsModal({ isOpen, onClose }: AiSettingsModalProps) {
  const { lang } = useLang();
  const { state, updateAiSettings, setAiPersona } = useApp();
  const isAr = lang === "ar";

  const currentSettings: AiSettings = state.aiSettings || DEFAULT_AI_SETTINGS;

  const [level, setLevel] = useState<AiSettings["level"]>(currentSettings.level);
  const [tone, setTone] = useState<AiSettings["tone"]>(currentSettings.tone);
  const [confirmBefore, setConfirmBefore] = useState<boolean>(
    Boolean(currentSettings.confirmBeforeGenerating)
  );
  const [lowCreditThreshold, setLowCreditThreshold] = useState<number>(
    currentSettings.lowCreditAlertThreshold ?? 5
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateAiSettings({
      level,
      tone,
      confirmBeforeGenerating: confirmBefore,
      lowCreditAlertThreshold: lowCreditThreshold,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-pink-200/80 dark:border-pink-900/60 bg-canvas text-ink p-5 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl grad-theme text-white shadow-rose text-base">
              <Sliders size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-ink">
                {isAr ? "إعدادات المساعد الذكي وحماية الرصيد ✨" : "AI Agent & Credit Settings ✨"}
              </h3>
              <p className="text-[11px] font-semibold text-ink-light">
                {isAr ? "تحكم في مستوى الاستهلاك وأسلوب المساعد" : "Control response depth & credit safety"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-light hover:text-ink active:scale-95 transition-transform cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pe-1">
          {/* Current Credit Indicator */}
          <div className="rounded-2xl border border-amber-300/70 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-amber-500" />
              <div>
                <p className="text-xs font-bold text-ink">
                  {isAr ? "رصيدك الحالي المتاح" : "Available Credits"}
                </p>
                <p className="text-[11px] text-ink-light">
                  {isAr ? "يتم خصم النقاط بحسب مستوى التوليد" : "Credits deducted per generation level"}
                </p>
              </div>
            </div>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {state.aiCredits ?? 50} {isAr ? "نقطة" : "pts"}
            </span>
          </div>

          {/* Persona Switch in Settings */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Heart size={14} className="text-hotpink" />
              <span>{isAr ? "شخصية وهوية المساعد:" : "Agent Identity:"}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAiPersona("feminine")}
                className={cn(
                  "p-3 rounded-2xl border text-start transition-all cursor-pointer",
                  (state.aiPersona || "feminine") === "feminine"
                    ? "border-hotpink bg-pink-50/70 dark:bg-pink-950/40 shadow-xs"
                    : "border-border/80 bg-surface/60 hover:bg-surface"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">🌸</span>
                  {(state.aiPersona || "feminine") === "feminine" && (
                    <Check size={14} className="text-hotpink" />
                  )}
                </div>
                <p className="text-xs font-bold text-ink mt-1">
                  {isAr ? "مساعدة (أيكسا)" : "Sister (Ayxa)"}
                </p>
                <p className="text-[10px] text-ink-light mt-0.5">
                  {isAr ? "صيغة تأنيث أخوية وهادئة" : "Sisterly & calm tone"}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAiPersona("masculine")}
                className={cn(
                  "p-3 rounded-2xl border text-start transition-all cursor-pointer",
                  state.aiPersona === "masculine"
                    ? "border-slate-600 bg-slate-100 dark:bg-slate-900/60 shadow-xs"
                    : "border-border/80 bg-surface/60 hover:bg-surface"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">🌿</span>
                  {state.aiPersona === "masculine" && (
                    <Check size={14} className="text-slate-700 dark:text-slate-300" />
                  )}
                </div>
                <p className="text-xs font-bold text-ink mt-1">
                  {isAr ? "مساعد (أنيس)" : "Brother (Anees)"}
                </p>
                <p className="text-[10px] text-ink-light mt-0.5">
                  {isAr ? "صيغة عملية ومنضبطة" : "Practical & focused tone"}
                </p>
              </button>
            </div>
          </div>

          {/* Generation Level & Credit Consumption (Level 1 / 2 / 3) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" />
                <span>{isAr ? "مستوى الاستهلاك والتفصيل:" : "Response Level & Consumption:"}</span>
              </span>
              <span className="text-[10px] text-hotpink font-semibold">
                {level === "saver"
                  ? isAr ? "1 نقطة (اقتصادي)" : "1 pt (Saver)"
                  : level === "balanced"
                    ? isAr ? "1 نقطة (متوازن)" : "1 pt (Balanced)"
                    : isAr ? "2 نقطة (مفصّل)" : "2 pts (Pro)"}
              </span>
            </label>

            <div className="space-y-2">
              {/* Saver Mode */}
              <button
                type="button"
                onClick={() => setLevel("saver")}
                className={cn(
                  "w-full text-start p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                  level === "saver"
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs"
                    : "border-border/80 bg-surface/60 hover:bg-surface"
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0 text-sm">
                  💡
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-ink">
                      {isAr ? "المستوى الاقتصادي الذكي (Smart Saver)" : "Smart Saver Level"}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      1 {isAr ? "نقطة" : "pt"}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-light mt-0.5 leading-relaxed">
                    {isAr
                      ? "إجابات موجزة، مباشرة، ومركّزة في نقاط واضحة لحفظ الرصيد وتوفير النقاط للمهام المتكررة."
                      : "Concise, direct, bulleted answers to conserve your credits for daily planning."}
                  </p>
                </div>
              </button>

              {/* Balanced Mode */}
              <button
                type="button"
                onClick={() => setLevel("balanced")}
                className={cn(
                  "w-full text-start p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                  level === "balanced"
                    ? "border-hotpink bg-pink-50/60 dark:bg-pink-950/30 shadow-xs"
                    : "border-border/80 bg-surface/60 hover:bg-surface"
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/50 text-hotpink shrink-0 text-sm">
                  ⚖️
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-ink">
                      {isAr ? "المستوى المتوازن (Balanced - الافتراضي)" : "Balanced Level (Default)"}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-200/60 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                      1 {isAr ? "نقطة" : "pt"}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-light mt-0.5 leading-relaxed">
                    {isAr
                      ? "خطة متوازنة وجميلة تجمع بين الإرشاد العملي والروح الهادئة دون إطالة مفرطة."
                      : "A well-rounded plan balancing thoughtful guidance with practical actions."}
                  </p>
                </div>
              </button>

              {/* Pro Deep Plan Mode */}
              <button
                type="button"
                onClick={() => setLevel("deep")}
                className={cn(
                  "w-full text-start p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                  level === "deep"
                    ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 shadow-xs"
                    : "border-border/80 bg-surface/60 hover:bg-surface"
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shrink-0 text-sm">
                  🚀
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-ink">
                      {isAr ? "المستوى الاحترافي الشامل (Pro Deep Plan)" : "Pro Deep Master Plan"}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/60 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      2 {isAr ? "نقاط" : "pts"}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-light mt-0.5 leading-relaxed">
                    {isAr
                      ? "تحليل عميق، تفكيك متقدم للأهداف بالساعات، جداول أسبوعية كاملة، وتوصيات ذهنية للمشاريع الكبيرة."
                      : "Comprehensive hourly breakdowns, advanced milestone maps, and deep coaching."}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Tone Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Sparkles size={14} className="text-hotpink" />
              <span>{isAr ? "الأسلوب المفضل في الحوار:" : "Preferred Tone:"}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "barakah", labelAr: "عقلية البركة 🕌", labelEn: "Barakah 🕌", descAr: "ربط بالصلوات والأذكار" },
                { id: "gentle", labelAr: "هادئ وداعم 🌸", labelEn: "Gentle 🌸", descAr: "رفق بالذات وتقليل التوتر" },
                { id: "action", labelAr: "عملي وتنفيذي ⚡", labelEn: "Action ⚡", descAr: "تركيز عالي وإنجاز مباشر" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as any)}
                  className={cn(
                    "p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center",
                    tone === t.id
                      ? "border-hotpink bg-pink-50/70 dark:bg-pink-950/40 font-bold text-ink shadow-2xs"
                      : "border-border/80 bg-surface/60 hover:bg-surface text-ink-light"
                  )}
                >
                  <span className="text-xs font-bold">{isAr ? t.labelAr : t.labelEn}</span>
                  <span className="text-[9px] text-ink-light mt-0.5 line-clamp-1">{t.descAr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Credit Protection Guards */}
          <div className="space-y-3 rounded-2xl border border-border/80 bg-surface/40 p-3.5">
            <p className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-600" />
              <span>{isAr ? "حماية الرصيد ومنع الاستهلاك العشوائي:" : "Credit Protection Guards:"}</span>
            </p>

            {/* Confirm before generating */}
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span className="text-ink-light font-medium pe-2">
                {isAr
                  ? "تأكيد يدوي قبل تنفيذ الخطط الكبيرة (2+ نقاط)"
                  : "Confirm before running high-token generations"}
              </span>
              <input
                type="checkbox"
                checked={confirmBefore}
                onChange={(e) => setConfirmBefore(e.target.checked)}
                className="h-4 w-4 rounded accent-hotpink cursor-pointer"
              />
            </label>

            {/* Low credit warning threshold */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
              <span className="text-ink-light font-medium">
                {isAr ? "تنبيهي عند انخفاض الرصيد إلى:" : "Alert when credits drop below:"}
              </span>
              <div className="flex items-center gap-1">
                {[5, 10, 15].map((threshold) => (
                  <button
                    key={threshold}
                    type="button"
                    onClick={() => setLowCreditThreshold(threshold)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                      lowCreditThreshold === threshold
                        ? "bg-amber-500 text-white shadow-2xs"
                        : "bg-surface border border-border text-ink-light"
                    )}
                  >
                    {threshold} {isAr ? "نقاط" : "pts"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-border text-xs font-bold text-ink-light hover:text-ink cursor-pointer"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className="grad-theme px-5 py-2 rounded-full text-xs font-bold text-white shadow-rose hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check size={14} />
                <span>{isAr ? "تم الحفظ بنجاح!" : "Saved!"}</span>
              </>
            ) : (
              <span>{isAr ? "حفظ الإعدادات" : "Save Settings"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
