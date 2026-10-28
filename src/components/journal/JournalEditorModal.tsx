import React, { useState, useRef, memo } from "react";
import {
  X,
  Lock,
  Unlock,
  Sparkles,
  Image as ImageIcon,
  Mic,
} from "lucide-react";
import {
  type JournalEntry,
  type JournalAttachment,
  type JournalTemplateId,
  type MoodKey,
  type EnergyLevel,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const STICKERS = ["✨", "🌸", "💖", "☕", "🌿", "🦋", "🌙", "⭐", "🥑", "💌", "🕯️", "🎀"];

const MOOD_OPTIONS: { id: MoodKey; emoji: string; labelEn: string; labelAr: string }[] = [
  { id: "happy", emoji: "🌸", labelEn: "Happy", labelAr: "سعيدة" },
  { id: "grateful", emoji: "💖", labelEn: "Grateful", labelAr: "ممتنة" },
  { id: "calm", emoji: "🌿", labelEn: "Calm", labelAr: "مطمئنة" },
  { id: "energetic", emoji: "🔥", labelEn: "Productive", labelAr: "منجزة" },
  { id: "tired", emoji: "😴", labelEn: "Tired", labelAr: "مرهقة" },
  { id: "anxious", emoji: "🌧️", labelEn: "Overwhelmed", labelAr: "قلقة" },
];

export interface JournalEditorModalProps {
  entry: JournalEntry | null;
  defaultTemplate: JournalTemplateId;
  defaultPrompt: string;
  todayStr: string;
  todayMoodRecord: any;
  isAr: boolean;
  onSave: (payload: Partial<JournalEntry>) => void;
  onCancel: () => void;
  setDailyMood: (date: string, moodKey: MoodKey, emoji: string, energy: EnergyLevel) => void;
}

export const JournalEditorModal = memo(function JournalEditorModal({
  entry,
  defaultTemplate,
  defaultPrompt,
  todayStr,
  todayMoodRecord,
  isAr,
  onSave,
  onCancel,
  setDailyMood,
}: JournalEditorModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formTitle, setFormTitle] = useState(entry?.title || "");
  const [formBody, setFormBody] = useState(entry?.body || "");
  const [formDate, setFormDate] = useState(entry?.date || todayStr);
  const [formTemplateId, setFormTemplateId] = useState<JournalTemplateId>(entry?.templateId || defaultTemplate || "free");
  const [formPromptText, setFormPromptText] = useState(entry?.promptText || defaultPrompt || "");
  const [formMood, setFormMood] = useState(entry?.mood || todayMoodRecord?.emoji || "🌸");
  const [formEnergy, setFormEnergy] = useState<EnergyLevel>(entry?.energy || todayMoodRecord?.energy || "medium");
  const [formTags, setFormTags] = useState<string[]>(entry?.tags || (defaultTemplate && defaultTemplate !== "free" ? [defaultTemplate] : []));
  const [formSticker, setFormSticker] = useState(entry?.sticker || "✨");
  const [formLocked, setFormLocked] = useState(Boolean(entry?.locked));
  const [formAttachments, setFormAttachments] = useState<JournalAttachment[]>(entry?.attachments || []);

  // Audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);

  const handleSave = () => {
    const rawTitle = formTitle.trim();
    const rawBody = formBody.trim();
    if (!rawBody && !rawTitle) return;

    onSave({
      date: formDate,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: rawTitle,
      body: rawBody,
      templateId: formTemplateId,
      promptText: formPromptText || undefined,
      mood: formMood,
      energy: formEnergy,
      tags: formTags,
      sticker: formSticker,
      locked: formLocked,
      attachments: formAttachments,
      wordCount: rawBody ? rawBody.split(/s+/).length : 0,
    });
  };

  const handleInsertFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formBody.substring(start, end);
    const replacement = prefix + (selectedText || (isAr ? "نص هنا" : "text here")) + suffix;
    const nextBody = formBody.substring(0, start) + replacement + formBody.substring(end);
    setFormBody(nextBody);
    setTimeout(() => {
      // textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setFormAttachments((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2, 9),
          type: "photo",
          url,
          name: file.name,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleVoiceRecord = async () => {
    if (isRecording) {
      try {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    } else {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          alert(isAr ? "التسجيل الصوتي غير مدعوم في هذا المتصفح" : "Voice recording not supported on this device.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);
          setFormAttachments((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).slice(2, 9),
              type: "audio",
              url: audioUrl,
              name: isAr ? "تسجيل صوتي" : "Voice Note",
            },
          ]);
          stream.getTracks().forEach((t) => t.stop());
        };

        recorder.start();
        setIsRecording(true);
        setRecordingDuration(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      } catch {
        alert(isAr ? "يرجى السماح بصلاحية الميكروفون للتسجيل" : "Microphone permission is needed to record audio.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xl bg-card rounded-t-3xl sm:rounded-3xl border-t sm:border border-border/80 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📖</span>
            <div>
              <h2 className="text-base font-extrabold text-ink">
                {entry ? (isAr ? "تعديل التدوينة ✨" : "Edit Entry ✨") : (isAr ? "تدوينة جديدة 📖" : "New Entry 📖")}
              </h2>
              <div className="flex items-center gap-2 text-[10.5px] font-semibold text-ink-light">
                <span>{formDate}</span>
                <span>•</span>
                <span className="font-bold text-emerald-500">
                  {isAr ? "محفوظ محلياً ✓" : "Offline safe ✓"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFormLocked(!formLocked)}
              className={cn(
                "cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-90",
                formLocked ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-xs" : "bg-surface border-border text-ink-light hover:text-ink"
              )}
              title={isAr ? "قفل التدوينة بكلمة مرور" : "Lock this entry"}
            >
              {formLocked ? <Lock size={15} /> : <Unlock size={15} />}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-light hover:text-ink transition-colors"
              title={isAr ? "إغلاق" : "Close"}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Prompt Banner */}
          {formPromptText && (
            <div className="rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-500/20 p-3.5 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-2.5 shadow-xs">
              <Sparkles size={18} className="text-hotpink shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block text-[11px] text-hotpink uppercase tracking-wider">{isAr ? "تأمل اليوم الملهم ✨" : "Today's Inspired Reflection ✨"}</span>
                <p className="font-bold text-sm leading-relaxed mt-0.5">{formPromptText}</p>
              </div>
            </div>
          )}

          {/* Diary Card Header: Title, Date & Mood */}
          <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-sm space-y-3.5">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={isAr ? "عنوان التدوينة اليومية..." : "Daily Entry Title..."}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              dir="auto"
              className="w-full text-lg font-black text-ink placeholder:text-ink-light/40 bg-transparent outline-none tracking-tight"
            />

            {/* Mood & Energy Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-border/60">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setFormMood(m.emoji);
                      setDailyMood(formDate, m.id, m.emoji, formEnergy);
                    }}
                    className={cn(
                      "cursor-pointer flex h-9 w-9 items-center justify-center rounded-2xl text-lg border transition-all active:scale-90",
                      formMood === m.emoji ? "border-hotpink bg-hotpink/15 scale-110 shadow-rose-sm ring-2 ring-hotpink/20" : "border-border/60 bg-surface hover:bg-muted"
                    )}
                    title={isAr ? m.labelAr : m.labelEn}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-surface border border-border rounded-2xl p-1 shadow-inner">
                {(["low", "medium", "high"] as EnergyLevel[]).map((eng) => (
                  <button
                    key={eng}
                    type="button"
                    onClick={() => setFormEnergy(eng)}
                    className={cn(
                      "cursor-pointer px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all",
                      formEnergy === eng ? "grad-theme text-white shadow-xs" : "text-ink-light hover:text-ink"
                    )}
                  >
                    {eng === "low" ? (isAr ? "🌿 هادئة" : "🌿 Calm") : eng === "medium" ? (isAr ? "⚡ متوازنة" : "⚡ Med") : (isAr ? "🔥 نشيطة" : "🔥 High")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Format & Media Toolbar */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar bg-card/90 backdrop-blur-sm border border-border/80 p-2 rounded-2xl shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleInsertFormat("**", "**")}
                className="cursor-pointer px-3 py-1.5 rounded-xl bg-surface hover:bg-muted text-xs font-black text-ink border border-border/60 active:scale-95 transition-all"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormat("*", "*")}
                className="cursor-pointer px-3 py-1.5 rounded-xl bg-surface hover:bg-muted text-xs font-serif italic text-ink border border-border/60 active:scale-95 transition-all"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormat("\n• ")}
                className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-surface hover:bg-muted text-xs font-bold text-ink border border-border/60 active:scale-95 transition-all flex items-center gap-1"
              >
                <span>•</span>
                <span>{isAr ? "نقاط" : "Bullet"}</span>
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormat("\n[ ] ")}
                className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-surface hover:bg-muted text-xs font-bold text-ink border border-border/60 active:scale-95 transition-all flex items-center gap-1"
              >
                <span>☑</span>
                <span>{isAr ? "قائمة" : "Check"}</span>
              </button>
            </div>

            <div className="flex items-center gap-1 pl-2 border-s border-border/60">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer p-2 rounded-xl bg-surface hover:bg-purple-500/10 text-purple-600 border border-border/60 active:scale-95 transition-all"
                title={isAr ? "إرفاق صورة" : "Add Photo"}
              >
                <ImageIcon size={16} />
              </button>

              <button
                type="button"
                onClick={handleToggleVoiceRecord}
                className={cn(
                  "cursor-pointer p-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1",
                  isRecording ? "bg-rose-500 text-white animate-pulse border-rose-600 shadow-rose-sm" : "bg-surface hover:bg-pink-500/10 text-hotpink border-border/60"
                )}
                title={isAr ? "تسجيل صوتي" : "Record voice note"}
              >
                <Mic size={16} />
                {isRecording && <span className="text-[10px] font-mono font-bold">{recordingDuration}s</span>}
              </button>
            </div>
          </div>

          {/* Aesthetic Diary Paper Textarea */}
          <div className="rounded-3xl bg-gradient-to-b from-[#fffefc] to-[#faf6ed] dark:from-[#231828] dark:to-[#1a121e] border-2 border-pink-200/80 dark:border-pink-900/40 p-5 shadow-card min-h-[340px] flex flex-col relative overflow-hidden">
            <textarea
              ref={textareaRef}
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder={
                isAr
                  ? "اكتبي كل ما يدور في خاطركِ ومشاعركِ اليوم بكل حرية وهدوء... 🌸"
                  : "Express your reflections, gratitude, and dreams freely... 🌸"
              }
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              dir="auto"
              className="w-full flex-1 bg-transparent text-[15px] font-medium text-ink placeholder:text-ink-light/40 outline-none leading-[30px] resize-none min-h-[280px] bg-[linear-gradient(transparent_29px,rgba(240,200,215,0.35)_30px)] dark:bg-[linear-gradient(transparent_29px,rgba(255,255,255,0.06)_30px)] bg-[size:100%_30px]"
            />

            <div className="pt-3 flex justify-between items-center text-xs font-extrabold text-ink-light border-t border-pink-200/60 dark:border-pink-900/40">
              <span className="flex items-center gap-1 text-hotpink">
                <span>✍️</span>
                <span>{formBody.trim() ? formBody.trim().split(/\s+/).length : 0} {isAr ? "كلمة" : "words"}</span>
              </span>
              <span className="text-xl">{formSticker}</span>
            </div>
          </div>

          {/* Attachments List */}
          {formAttachments.length > 0 && (
            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2.5">
              <span className="text-xs font-extrabold text-ink-light block">
                {isAr ? "المرفقات:" : "Attachments:"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {formAttachments.map((att) => (
                  <div key={att.id} className="relative rounded-2xl bg-surface border border-border p-2 overflow-hidden flex flex-col items-center">
                    {att.type === "photo" ? (
                      <img src={att.url} alt="Attachment" className="h-24 w-full object-cover rounded-xl" />
                    ) : (
                      <div className="h-24 w-full flex flex-col items-center justify-center bg-hotpink/5 rounded-xl text-hotpink p-2 text-center">
                        <Mic size={24} className="mb-1" />
                        <span className="text-[11px] font-bold truncate">{att.name}</span>
                        <audio src={att.url} controls className="w-full h-8 mt-1 scale-90" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setFormAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                      className="cursor-pointer absolute top-3 right-3 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stickers */}
          <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
            <span className="text-xs font-extrabold text-ink-light block">
              {isAr ? "ملصق رمزي تذكاري للتدوينة:" : "Decorative Memory Sticker:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map((stk) => (
                <button
                  key={stk}
                  type="button"
                  onClick={() => setFormSticker(stk)}
                  className={cn(
                    "cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl text-lg border transition-all active:scale-90",
                    formSticker === stk ? "border-hotpink bg-hotpink/10 shadow-rose-sm scale-110" : "border-border bg-surface"
                  )}
                >
                  {stk}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center gap-3 px-5 py-3.5 pb-[calc(env(safe-area-inset-bottom,16px)+14px)] sm:pb-3.5 border-t border-border/60 bg-surface/50 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex-1 py-3 rounded-2xl border border-border text-xs font-extrabold text-ink-light hover:bg-surface active:scale-95 transition-all text-center"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!formBody.trim() && !formTitle.trim()}
            className="cursor-pointer flex-1 py-3 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-md hover:brightness-110 active:scale-95 transition-all text-center disabled:opacity-50"
          >
            {entry ? (isAr ? "حفظ التعديلات ✨" : "Save Changes ✨") : (isAr ? "حفظ التدوينة ✨" : "Save Entry ✨")}
          </button>
        </div>
      </div>
    </div>
  );
});
