import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Camera,
  Calendar,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  PAPER_COLORS,
  FLOWER_STYLES,
  type PaperColor,
  type FlowerStyle,
} from "@/lib/barakahJarEngine";
import { useApp, todayKey } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AddBlessingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  onSaved?: (entryId: string) => void;
}

const DRAFT_STORAGE_KEY = "ayxa_barakah_jar_draft";

export const AddBlessingSheet: React.FC<AddBlessingSheetProps> = ({
  isOpen,
  onClose,
  defaultDate,
  onSaved,
}) => {
  const { addJournal } = useApp();
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(defaultDate || todayKey());
  const [paperColor, setPaperColor] = useState<PaperColor>("blush");
  const [flowerStyle, setFlowerStyle] = useState<FlowerStyle>("sakura");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardWarn, setShowDiscardWarn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore draft when opened
  useEffect(() => {
    if (isOpen) {
      try {
        const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.body && !body) setBody(draft.body);
          if (draft.title && !title) setTitle(draft.title);
          if (draft.paperColor) setPaperColor(draft.paperColor);
          if (draft.flowerStyle) setFlowerStyle(draft.flowerStyle);
          if (draft.date) setDate(draft.date);
        }
      } catch {
        // Ignore session draft errors
      }
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Persist draft on edit
  useEffect(() => {
    if (body.trim() || title.trim()) {
      try {
        sessionStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ title, body, date, paperColor, flowerStyle })
        );
      } catch {
        // ignore
      }
    }
  }, [title, body, date, paperColor, flowerStyle]);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        isAr ? "حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)" : "Photo too large (max 5MB)"
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAttemptClose = () => {
    if (body.trim().length > 10) {
      setShowDiscardWarn(true);
    } else {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardWarn(false);
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    setTitle("");
    setBody("");
    setPhotoData(null);
    onClose();
  };

  const handleSave = () => {
    if (isSubmitting) return;
    if (!body.trim()) {
      setErrorMessage(
        isAr
          ? "يرجى كتابة جملة بسيطة عن النعمة 🌸"
          : "Please write a little note about your blessing 🌸"
      );
      return;
    }

    // Disallow future dates
    const today = todayKey();
    if (date > today) {
      setErrorMessage(
        isAr
          ? "جرّة النِّعم تحفظ اللحظات التي حدثت بالفعل، لا يمكن اختيار تاريخ مستقبلي."
          : "Barakah Jar holds moments that already touched your heart. Future dates are not allowed."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const attachments = photoData
        ? [
            {
              id: `att-${Date.now()}`,
              name: "blessing-photo.jpg",
              type: "image" as const,
              url: photoData,
              sizeBytes: photoData.length,
            },
          ]
        : [];

      const newId = addJournal({
        title: title.trim(),
        body: body.trim(),
        date,
        templateId: "gratitude",
        tags: ["barakah_jar", "gratitude"],
        mood: "🌸",
        isBarakahJar: true,
        paperColor,
        flowerStyle,
        attachments,
      });

      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      setTitle("");
      setBody("");
      setPhotoData(null);
      setIsSubmitting(false);

      if (onSaved) onSaved(newId);
      onClose();
    } catch {
      setErrorMessage(
        isAr
          ? "تعذر حفظ النعمة، تم الاحتفاظ بمسودتكِ للمحاولة مجدداً."
          : "Could not save your blessing. Your draft has been preserved."
      );
      setIsSubmitting(false);
    }
  };

  const activeColor = PAPER_COLORS[paperColor];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Discard Confirmation Modal */}
      {showDiscardWarn && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 border border-border shadow-xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-ink">
                {isAr ? "هل ترغبين بالتراجع عن حفظ النعمة؟" : "Discard this blessing draft?"}
              </h4>
              <p className="text-xs text-ink-light">
                {isAr
                  ? "كتبتِ كلمات لطيفة، هل تودين حذفها أم الاحتفاظ بها وإكمالها؟"
                  : "You've written a meaningful thought. Are you sure you want to discard it?"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDiscardWarn(false)}
                className="cursor-pointer flex-1 py-2.5 rounded-2xl border border-border text-xs font-black text-ink hover:bg-surface"
              >
                {isAr ? "مواصلة الكتابة" : "Keep Writing"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="cursor-pointer flex-1 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-black shadow-xs hover:bg-rose-700"
              >
                {isAr ? "نعم، حذف" : "Yes, Discard"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Sheet Container */}
      <div
        className={cn(
          "w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-transform duration-300",
          activeColor.bgClass
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-surface/80 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤍</span>
            <div>
              <h3 className="text-sm font-black text-ink">
                {t("addBlessing") || (isAr ? "أضيفي نعمة" : "Add a blessing")}
              </h3>
              <p className="text-[10px] text-ink-light">
                {isAr
                  ? "لحظة امتنان تودعينها في جرّتكِ الخاصة"
                  : "A private blessing placed into your jar"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Note Title (Optional) */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("blessingTitlePlaceholder") || (isAr ? "عنوان خفيف (اختياري)" : "Title (optional)")}
              maxLength={80}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-border/80 bg-white/90 dark:bg-card/90 text-xs font-bold text-ink placeholder:text-ink-lighter focus:outline-hidden focus:border-rose-400 shadow-2xs"
            />
          </div>

          {/* Note Body (The Blessing) */}
          <div>
            <textarea
              ref={textareaRef}
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                t("blessingNotePlaceholder") ||
                (isAr
                  ? "ما الذي بعث السكينة والنور والامتنان في قلبكِ اليوم؟"
                  : "What brought peace, light, or gratitude to your heart today?")
              }
              className="w-full p-3.5 rounded-2xl border border-border/80 bg-white/95 dark:bg-card/95 text-xs text-ink placeholder:text-ink-lighter focus:outline-hidden focus:border-rose-400 shadow-2xs leading-relaxed resize-none"
            />
          </div>

          {/* Date Selector (Default today, allows backdating, no future) */}
          <div className="flex items-center justify-between bg-white/80 dark:bg-card/80 p-2.5 rounded-2xl border border-border/70 text-xs shadow-2xs">
            <div className="flex items-center gap-2 text-ink-light font-bold">
              <Calendar size={14} className="text-rose-500" />
              <span>{isAr ? "تاريخ النعمة:" : "Date of blessing:"}</span>
            </div>
            <input
              type="date"
              value={date}
              max={todayKey()}
              onChange={(e) => setDate(e.target.value)}
              className="cursor-pointer bg-transparent text-xs font-black text-ink focus:outline-hidden"
            />
          </div>

          {/* Pastel Paper Color Picker */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-ink-light px-1">
              {t("paperColor") || (isAr ? "لون ورقة النعمة" : "Paper Note Color")}
            </span>
            <div className="flex items-center gap-2">
              {(Object.keys(PAPER_COLORS) as PaperColor[]).map((cKey) => {
                const cfg = PAPER_COLORS[cKey];
                const isSelected = paperColor === cKey;
                return (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() => setPaperColor(cKey)}
                    className={cn(
                      "cursor-pointer flex-1 py-1.5 px-1 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 shadow-2xs",
                      cfg.bgClass,
                      cfg.borderClass,
                      isSelected ? "ring-2 ring-rose-500 ring-offset-1 scale-105" : "opacity-80 hover:opacity-100"
                    )}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/60 shadow-xs"
                      style={{ backgroundColor: cfg.fillHex }}
                    />
                    <span className="text-[9.5px] font-bold text-ink">
                      {isAr ? cfg.labelAr.split(" ")[0] : cfg.labelEn.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flower Style Picker */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-ink-light px-1">
              {t("flowerStyle") || (isAr ? "زهرة مرافقة" : "Flower Accent")}
            </span>
            <div className="flex items-center gap-2">
              {(Object.keys(FLOWER_STYLES) as FlowerStyle[]).map((fKey) => {
                const cfg = FLOWER_STYLES[fKey];
                const isSelected = flowerStyle === fKey;
                return (
                  <button
                    key={fKey}
                    type="button"
                    onClick={() => setFlowerStyle(fKey)}
                    className={cn(
                      "cursor-pointer flex-1 py-1.5 px-1 rounded-2xl border bg-white/80 dark:bg-card/80 border-border/70 text-center transition-all flex flex-col items-center gap-0.5 shadow-2xs",
                      isSelected ? "ring-2 ring-rose-500 border-rose-300 scale-105 bg-rose-50/70" : "opacity-80 hover:opacity-100"
                    )}
                  >
                    <span className="text-base">{cfg.emoji}</span>
                    <span className="text-[9px] font-bold text-ink truncate max-w-full">
                      {isAr ? cfg.labelAr.split(" ")[0] : cfg.labelEn.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Attachment (Optional) */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            {photoData ? (
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-xs max-h-40">
                <img
                  src={photoData}
                  alt="Blessing memory"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoData(null)}
                  className="cursor-pointer absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer w-full py-2.5 px-3 rounded-2xl border border-dashed border-border/80 bg-white/60 dark:bg-card/60 flex items-center justify-center gap-2 text-xs font-bold text-ink-light hover:text-ink hover:bg-white/80"
              >
                <Camera size={14} className="text-rose-500" />
                <span>{isAr ? "إرفاق صورة للمناسبة أو اللحظة (اختياري)" : "Add photo of this lovely moment (optional)"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Action: Reachable above keyboard */}
        <div className="p-4 border-t border-border/60 bg-surface/90 backdrop-blur-xs flex items-center gap-3">
          <button
            type="button"
            onClick={handleAttemptClose}
            className="cursor-pointer px-4 py-2.5 rounded-2xl border border-border text-xs font-black text-ink-light hover:text-ink hover:bg-surface"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            disabled={isSubmitting || !body.trim()}
            onClick={handleSave}
            className={cn(
              "cursor-pointer flex-1 py-2.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-rose-sm text-white",
              isSubmitting || !body.trim()
                ? "bg-hotpink/60 cursor-not-allowed"
                : "bg-hotpink hover:bg-pink-600 active:scale-98"
            )}
          >
            <Sparkles size={14} />
            <span>
              {isSubmitting
                ? isAr
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isAr
                ? "إيداع في الجرّة 🤍"
                : "Place into Jar 🤍"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
