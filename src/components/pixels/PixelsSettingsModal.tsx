import React from "react";
import { X, Palette, Calendar, Flame, Bell, Shield } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  MOOD_PALETTES,
  CANONICAL_MOODS,
  type MoodPaletteId,
  type YearInPixelsSettings,
} from "@/lib/pixelsEngine";
import { cn } from "@/lib/utils";

interface PixelsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PixelsSettingsModal: React.FC<PixelsSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, lang } = useLang();
  const { state, updateYearInPixelsSettings } = useApp();
  const isAr = lang === "ar";

  if (!isOpen) return null;

  const settings: YearInPixelsSettings = state.yearInPixelsSettings || {
    userId: state.user.id,
    selectedPaletteId: "default",
    weekStartPreference: "mon",
    showStreak: true,
    reminderEnabled: false,
    reminderTime: "21:00",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleSelectPalette = (paletteId: MoodPaletteId) => {
    updateYearInPixelsSettings({ selectedPaletteId: paletteId });
  };

  const handleSelectWeekStart = (weekStart: "mon" | "sun") => {
    updateYearInPixelsSettings({ weekStartPreference: weekStart });
  };

  const handleToggleStreak = (showStreak: boolean) => {
    updateYearInPixelsSettings({ showStreak });
  };

  const handleToggleReminder = (reminderEnabled: boolean) => {
    updateYearInPixelsSettings({ reminderEnabled });
  };

  const handleReminderTime = (reminderTime: string) => {
    updateYearInPixelsSettings({ reminderTime });
  };

  const paletteList = Object.values(MOOD_PALETTES);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="text-base font-bold text-ink">
              {isAr ? "إعدادات سنتي بالألوان" : "Year in Pixels Settings"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Palette Switcher */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Palette size={14} className="text-pink-500" />
            <span>{t("selectPalette") || (isAr ? "لوحة الألوان" : "Color Palette")}</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {paletteList.map((p) => {
              const isSelected = settings.selectedPaletteId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPalette(p.id)}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all active:scale-95 space-y-2",
                    isSelected
                      ? "ring-2 ring-hotpink border-hotpink bg-pink-50/40 dark:bg-pink-950/30 shadow-sm"
                      : "bg-surface border-border/50 hover:bg-ghost"
                  )}
                >
                  <span className="text-xs font-bold text-ink block truncate">
                    {isAr ? p.nameAr : p.nameEn}
                  </span>

                  {/* Swatches */}
                  <div className="flex items-center gap-1">
                    {CANONICAL_MOODS.map((m) => (
                      <span
                        key={m.id}
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                        style={{ backgroundColor: p.moodColors[m.id] }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Start of Week Preference */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-purple-500" />
            <span>{t("weekStartPreference") || (isAr ? "بداية الأسبوع" : "Start week on")}</span>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSelectWeekStart("mon")}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all text-center",
                settings.weekStartPreference === "mon"
                  ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-400 font-bold"
                  : "bg-surface border-border/50 text-ink"
              )}
            >
              {isAr ? "الإثنين (افتراضي)" : "Monday (Default)"}
            </button>
            <button
              type="button"
              onClick={() => handleSelectWeekStart("sun")}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all text-center",
                settings.weekStartPreference === "sun"
                  ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-400 font-bold"
                  : "bg-surface border-border/50 text-ink"
              )}
            >
              {isAr ? "الأحد" : "Sunday"}
            </button>
          </div>
        </div>

        {/* 3. Streak Visibility Toggle */}
        <div className="p-3.5 rounded-2xl bg-surface border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame size={16} className="text-rose-500" />
            <div>
              <p className="text-xs font-bold text-ink">
                {t("showStreakToggle") || (isAr ? "عرض استمرارية التسجيل" : "Show gentle streak")}
              </p>
              <p className="text-[10px] text-ink-light">
                {isAr
                  ? "إظهار شريحة الأيام المتتابعة دون ضغط"
                  : "Gentle consecutive days indicator"}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.showStreak}
            onChange={(e) => handleToggleStreak(e.target.checked)}
            className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
          />
        </div>

        {/* 4. Daily Reminder Toggle & Time */}
        <div className="p-3.5 rounded-2xl bg-surface border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell size={16} className="text-pink-500" />
              <div>
                <p className="text-xs font-bold text-ink">
                  {isAr ? "تذكير يومي لطيف" : "Daily check-in reminder"}
                </p>
                <p className="text-[10px] text-ink-light">
                  {isAr ? "لحظة لطيفة لتطمئني على شعوركِ 🌈" : "A gentle moment to check in with yourself 🌈"}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reminderEnabled}
              onChange={(e) => handleToggleReminder(e.target.checked)}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
            />
          </div>

          {settings.reminderEnabled && (
            <div className="pt-2 border-t border-border/30 flex items-center justify-between">
              <span className="text-[11px] font-bold text-ink">
                {isAr ? "وقت التذكير:" : "Reminder time:"}
              </span>
              <input
                type="time"
                value={settings.reminderTime || "21:00"}
                onChange={(e) => handleReminderTime(e.target.value)}
                className="rounded-xl bg-card border border-border/60 px-2 py-1 text-xs text-ink outline-none"
              />
            </div>
          )}
        </div>

        {/* 5. Privacy Guarantee Notice */}
        <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 flex items-start gap-2.5">
          <Shield size={16} className="text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-pink-700 dark:text-pink-300">
              {isAr ? "مشاعركِ محفوظة محليًا بأمان" : "Your Emotional Privacy"}
            </h4>
            <p className="text-[11px] text-ink-light leading-relaxed">
              {isAr
                ? "سجل المشاعر يبقى على جهازكِ فقط. الذكاء الاصطناعي لا يملك أي وصول تلقائي لتحليل أو قراءة مشاعركِ."
                : "All mood and energy data stays strictly on your device. AYXA AI has zero automatic access."}
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="pt-1 text-center">
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
