import { useState, useEffect } from "react";
import { X, Sparkles, Zap, Check, Coins, Heart, Volume2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, type AiSettings, DEFAULT_AI_SETTINGS } from "@/lib/store";
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
  const [fullAppAccess, setFullAppAccess] = useState<boolean>(
    currentSettings.fullAppAccess !== false
  );
  const [autoExecuteActions, setAutoExecuteActions] = useState<boolean>(
    currentSettings.autoExecuteActions !== false
  );
  const [autoVoiceReply, setAutoVoiceReply] = useState<boolean>(
    Boolean(currentSettings.autoVoiceReply)
  );
  const [lowCreditThreshold, setLowCreditThreshold] = useState<number>(
    currentSettings.lowCreditAlertThreshold ?? 5
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLevel(currentSettings.level);
      setTone(currentSettings.tone);
      setFullAppAccess(currentSettings.fullAppAccess !== false);
      setAutoExecuteActions(currentSettings.autoExecuteActions !== false);
      setAutoVoiceReply(Boolean(currentSettings.autoVoiceReply));
    }
  }, [
    isOpen,
    currentSettings.level,
    currentSettings.tone,
    currentSettings.fullAppAccess,
    currentSettings.autoExecuteActions,
    currentSettings.autoVoiceReply,
  ]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateAiSettings({
      level,
      tone,
      fullAppAccess,
      autoExecuteActions,
      autoVoiceReply,
      lowCreditAlertThreshold: lowCreditThreshold,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
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
                  ? "خصّصي أسلوب رفيقتكِ الذكية، الصلاحيات، والصوت"
                  : "Customize your feminine AI muse, omni-access & voice"}
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

          {/* Omni-App Pro Agent Powers (Full App Access, Auto-Pilot, AI Voice) */}
          <div className="space-y-2.5 rounded-2xl border border-pink-300/60 dark:border-pink-800/50 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-fuchsia-500/10 p-3.5">
            <p className="text-xs font-extrabold text-hotpink flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>
                {isAr
                  ? "قدرات الوكيل الذكي الشامل (Pro Agent Powers):"
                  : "Omni-App Pro Agent Capabilities:"}
              </span>
            </p>

            {/* 1. Full App Access */}
            <label className="flex items-center justify-between gap-3 py-1.5 cursor-pointer">
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink">
                  {isAr
                    ? "🌟 وصول شامل لجميع أقسام التطبيق"
                    : "🌟 Full Omni-App Access"}
                </p>
                <p className="text-[10px] text-ink-light leading-relaxed">
                  {isAr
                    ? "السماح لـ AYXA بقراءة وإدارة المهام، العادات، الأهداف، الماء، الصلوات، الكتب، والمالية"
                    : "Allow AYXA to read & manage Tasks, Habits, Goals, Water, Prayers, Books & Finance"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={fullAppAccess}
                onChange={(e) => setFullAppAccess(e.target.checked)}
                className="h-4 w-4 rounded accent-hotpink shrink-0 cursor-pointer"
              />
            </label>

            {/* 2. Auto-Pilot Execution */}
            <label className="flex items-center justify-between gap-3 py-1.5 border-t border-pink-200/40 dark:border-pink-900/40 cursor-pointer">
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink">
                  {isAr
                    ? "⚡ التنفيذ التلقائي الفوري (Auto-Pilot)"
                    : "⚡ Auto-Pilot Instant Execution"}
                </p>
                <p className="text-[10px] text-ink-light leading-relaxed">
                  {isAr
                    ? "إضافة المهام، العادات، والخطط المقترحة مباشرة إلى تطبيقكِ فور انتهاء الرد"
                    : "Automatically save proposed tasks, habits, and logs into your planner immediately"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoExecuteActions}
                onChange={(e) => setAutoExecuteActions(e.target.checked)}
                className="h-4 w-4 rounded accent-hotpink shrink-0 cursor-pointer"
              />
            </label>

            {/* 3. Feminine AI Voice Reply */}
            <label className="flex items-center justify-between gap-3 py-1.5 border-t border-pink-200/40 dark:border-pink-900/40 cursor-pointer">
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink flex items-center gap-1">
                  <Volume2 size={13} className="text-hotpink" />
                  <span>
                    {isAr
                      ? "الرد الصوتي الأنثوي التلقائي"
                      : "Auto-Speak Feminine AI Voice"}
                  </span>
                </p>
                <p className="text-[10px] text-ink-light leading-relaxed">
                  {isAr
                    ? "قراءة ردود AYXA Muse Pro بصوت أنثوي ناعم تلقائياً"
                    : "Automatically read AYXA Muse Pro replies aloud in a soft feminine voice"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoVoiceReply}
                onChange={(e) => setAutoVoiceReply(e.target.checked)}
                className="h-4 w-4 rounded accent-hotpink shrink-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Generation Depth Tiers */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-ink flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-hotpink" />
                <span>{isAr ? "عمق التخطيط والذكاء:" : "Intelligence Depth & Style:"}</span>
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
                  titleAr: "إلهام سريع ومباشر (Quick Spark)",
                  badge: isAr ? "1 نقطة" : "1 pt",
                  descEn: "Chic, concise bullet points for instant clarity and quick actions.",
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
                  descEn: "Deep hourly schedules, goal milestones, and genius mindset breakthroughs.",
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

          {/* Credit Balance & Low Credit Alert */}
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
              <span>{isAr ? "حفظ الإعدادات ✨" : "Save Studio ✨"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
