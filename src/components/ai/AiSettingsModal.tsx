import { useState, useEffect } from "react";
import { X, Sparkles, Shield, Zap, Sliders, Check, Coins, Heart, Cpu } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, type AiSettings, DEFAULT_AI_SETTINGS } from "@/lib/store";
import {
  COARENA_DEFAULT_MODEL,
  FALLBACK_COARENA_MODELS,
  fetchCoarenaModels,
} from "@/lib/coarenaClient";
import { cn } from "@/lib/utils";

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSettingsModal({ isOpen, onClose }: AiSettingsModalProps) {
  const { lang } = useLang();
  const { state, updateAiSettings } = useApp();
  const isAr = lang === "ar";

  const currentSettings: AiSettings = state.aiSettings || DEFAULT_AI_SETTINGS;

  const [level, setLevel] = useState<AiSettings["level"]>(currentSettings.level);
  const [tone, setTone] = useState<AiSettings["tone"]>(currentSettings.tone);
  const [selectedModel, setSelectedModel] = useState<string>(
    currentSettings.model || COARENA_DEFAULT_MODEL
  );
  const [availableModels, setAvailableModels] = useState<string[]>(FALLBACK_COARENA_MODELS);
  const [confirmBefore, setConfirmBefore] = useState<boolean>(
    Boolean(currentSettings.confirmBeforeGenerating)
  );
  const [lowCreditThreshold, setLowCreditThreshold] = useState<number>(
    currentSettings.lowCreditAlertThreshold ?? 5
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLevel(currentSettings.level);
      setTone(currentSettings.tone);
      setSelectedModel(currentSettings.model || COARENA_DEFAULT_MODEL);
      void fetchCoarenaModels().then((models) => {
        if (models && models.length > 0) {
          setAvailableModels(models);
        }
      });
    }
  }, [isOpen, currentSettings.level, currentSettings.tone, currentSettings.model]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateAiSettings({
      level,
      tone,
      model: selectedModel || COARENA_DEFAULT_MODEL,
      confirmBeforeGenerating: confirmBefore,
      lowCreditAlertThreshold: lowCreditThreshold,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-pink-300/60 dark:border-pink-800/50 bg-canvas text-ink p-5 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Luxury Header */}
        <div className="flex items-center justify-between border-b border-pink-200/50 dark:border-pink-900/40 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-rose text-lg">
              🌸
            </span>
            <div>
              <h3 className="font-display text-base font-extrabold text-ink flex items-center gap-1.5">
                <span>{isAr ? "استوديو AYXA Muse Pro ✨" : "AYXA Muse Pro Studio ✨"}</span>
              </h3>
              <p className="text-[11px] font-medium text-ink-light">
                {isAr
                  ? "خصّصي أسلوب رفيقتكِ الذكية، عمق الخطط، والمحرك"
                  : "Customize your feminine AI muse, plan depth & engine"}
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
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pe-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-pink-400/30">
          {/* Feminine Aesthetic Vibe Selector (3 Girl Vibes) */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-ink flex items-center gap-1.5">
              <Heart size={14} className="text-hotpink fill-hotpink/20" />
              <span>
                {isAr ? "طابع وشخصية AYXA Muse:" : "Choose Your AYXA Muse Vibe:"}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "gentle",
                  emoji: "🌸",
                  labelEn: "Soft Glow",
                  labelAr: "نعومة وهدوء",
                  subEn: "Gentle & soothing",
                  subAr: "لطيفة وحنونة",
                },
                {
                  id: "action",
                  emoji: "👑",
                  labelEn: "That Girl Pro",
                  labelAr: "طموح وإنجاز",
                  subEn: "Boss girl focus",
                  subAr: "قوة وتركيز عالٍ",
                },
                {
                  id: "barakah",
                  emoji: "🌙",
                  labelEn: "Barakah Soul",
                  labelAr: "بركة وسكينة",
                  subEn: "Prayer & peace",
                  subAr: "بين الصلوات",
                },
              ].map((v) => {
                const active = tone === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setTone(v.id as AiSettings["tone"])}
                    className={cn(
                      "p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative",
                      active
                        ? "border-hotpink bg-gradient-to-b from-pink-500/15 to-rose-500/5 dark:from-pink-500/25 dark:to-rose-900/20 text-ink shadow-rose-sm"
                        : "border-border/70 bg-surface/50 hover:bg-surface text-ink-light"
                    )}
                  >
                    <span className="text-xl">{v.emoji}</span>
                    <span className="text-xs font-extrabold text-ink">
                      {isAr ? v.labelAr : v.labelEn}
                    </span>
                    <span className="text-[10px] text-ink-light line-clamp-1">
                      {isAr ? v.subAr : v.subEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generation Depth Tiers */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-ink flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-hotpink" />
                <span>{isAr ? "عمق التخطيط والتفصيل:" : "Planning Depth & Style:"}</span>
              </span>
              <span className="text-[10px] text-hotpink font-bold">
                {level === "deep"
                  ? isAr
                    ? "2 نقطة / رسالة"
                    : "2 pts / reply"
                  : isAr
                    ? "1 نقطة / رسالة"
                    : "1 pt / reply"}
              </span>
            </label>

            <div className="space-y-2">
              {[
                {
                  id: "saver",
                  emoji: "✨",
                  titleEn: "Quick Spark",
                  titleAr: "إلهام سريع ومختصر (Quick Spark)",
                  badge: isAr ? "1 نقطة" : "1 pt",
                  descEn: "Chic, concise bullet points for instant clarity and daily checklists.",
                  descAr: "نقاط أنيقة، سريعة ومباشرة لترتيب مهامكِ اليومية في ثوانٍ.",
                },
                {
                  id: "balanced",
                  emoji: "🌷",
                  titleEn: "Balanced Glow (Default)",
                  titleAr: "تخطيط متوازن وشامل (Balanced Glow)",
                  badge: isAr ? "1 نقطة" : "1 pt",
                  descEn: "Warm sisterly coaching paired with structured daily routines and tasks.",
                  descAr: "توجيه دافئ ومتوازن يجمع بين النصيحة الملهمة والخطوات العملية.",
                },
                {
                  id: "deep",
                  emoji: "👑",
                  titleEn: "Royal Masterplan",
                  titleAr: "الخطة الملكية العميقة (Royal Masterplan)",
                  badge: isAr ? "2 نقاط" : "2 pts",
                  descEn: "Deep hourly schedules, goal milestones, and mindset breakthroughs.",
                  descAr: "خطة تفصيلية بالساعات، تقسيم عميق للأهداف الكبرى، وإرشاد متكامل.",
                },
              ].map((item) => {
                const active = level === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLevel(item.id as AiSettings["level"])}
                    className={cn(
                      "w-full text-start p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                      active
                        ? "border-hotpink bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-transparent dark:from-pink-500/20 dark:via-rose-900/15 dark:to-transparent shadow-rose-sm"
                        : "border-border/70 bg-surface/50 hover:bg-surface"
                    )}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/15 text-base shrink-0">
                      {item.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-extrabold text-ink truncate">
                          {isAr ? item.titleAr : item.titleEn}
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-hotpink shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-light mt-0.5 leading-relaxed">
                        {isAr ? item.descAr : item.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coarena AI Pro Engine Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-ink flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu size={14} className="text-hotpink" />
                <span>{isAr ? "محرك الذكاء الاصطناعي (Coarena Pro):" : "AI Model Engine:"}</span>
              </span>
              <span className="text-[10px] font-mono text-hotpink font-bold">
                {selectedModel}
              </span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-2xl border border-pink-300/60 dark:border-pink-800/50 bg-surface px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink transition-colors cursor-pointer"
            >
              {availableModels.map((modelId) => (
                <option key={modelId} value={modelId}>
                  {modelId === "gpt-6-luna"
                    ? `✨ ${modelId} (AYXA Muse Pro — Recommended)`
                    : modelId}
                </option>
              ))}
            </select>
          </div>

          {/* Credit Balance & Protection */}
          <div className="space-y-3 rounded-2xl border border-pink-200/50 dark:border-pink-900/40 bg-surface/40 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Coins size={14} className="text-amber-500" />
                <span>{isAr ? "رصيد نقاطكِ الحالي:" : "Your Glow Credits:"}</span>
              </span>
              <span className="text-xs font-extrabold text-amber-500">
                {state.aiCredits ?? 50} {isAr ? "نقطة" : "pts"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
              <span className="text-ink-light font-medium">
                {isAr ? "تنبيهي عند انخفاض الرصيد إلى:" : "Low credit alert at:"}
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
                        ? "bg-hotpink text-white shadow-2xs"
                        : "bg-surface border border-border text-ink-light"
                    )}
                  >
                    {threshold}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-pink-200/50 dark:border-pink-900/40 flex items-center justify-end gap-2 shrink-0">
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
            className="grad-theme px-6 py-2 rounded-full text-xs font-bold text-white shadow-rose hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check size={14} />
                <span>{isAr ? "تم الحفظ ♡" : "Saved ♡"}</span>
              </>
            ) : (
              <span>{isAr ? "حفظ الإعدادات ✨" : "Save Vibe ✨"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
