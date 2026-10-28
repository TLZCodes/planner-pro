import { useState, useEffect, memo } from "react";
import { type Book, getTodayKey, formatReadingDuration } from "@/lib/bookshelfEngine";
import { useLang } from "@/lib/i18n";
import { X, Clock, Bookmark, BookOpen, Headphones } from "lucide-react";

interface LogReadingModalProps {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSaveLog: (
    bookId: string,
    params: {
      localDate: string;
      pagesRead?: number;
      newPage?: number;
      minutesListened?: number;
      newMinutes?: number;
      durationMinutes?: number;
      notes?: string;
    }
  ) => void;
}

export const LogReadingModal = memo(function LogReadingModal({
  open,
  book,
  onClose,
  onSaveLog,
}: LogReadingModalProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const today = getTodayKey();

  const [date, setDate] = useState(today);
  const [mode, setMode] = useState<"new_position" | "delta">("new_position");
  const [newPageVal, setNewPageVal] = useState("");
  const [deltaPagesVal, setDeltaPagesVal] = useState("");

  const [newAudioHours, setNewAudioHours] = useState("");
  const [newAudioMins, setNewAudioMins] = useState("");
  const [deltaAudioMins, setDeltaAudioMins] = useState("");

  const [sessionDuration, setSessionDuration] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (book) {
      setDate(today);
      setMode("new_position");
      setNewPageVal(book.currentPage !== undefined ? String(book.currentPage) : "");
      setDeltaPagesVal("15");

      if (book.currentMinutes) {
        setNewAudioHours(String(Math.floor(book.currentMinutes / 60)));
        setNewAudioMins(String(book.currentMinutes % 60));
      } else {
        setNewAudioHours("");
        setNewAudioMins("");
      }
      setDeltaAudioMins("20");
      setSessionDuration("25");
      setNotes("");
    }
  }, [book, open, today]);

  if (!open || !book) return null;

  const isAudio = book.format === "audiobook";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const safeDate = date > today ? today : date;
    const durMins = sessionDuration ? parseInt(sessionDuration, 10) : undefined;

    if (isAudio) {
      if (mode === "new_position") {
        const h = parseInt(newAudioHours || "0", 10) || 0;
        const m = parseInt(newAudioMins || "0", 10) || 0;
        const totalPos = h * 60 + m;
        onSaveLog(book.id, {
          localDate: safeDate,
          newMinutes: totalPos,
          durationMinutes: durMins,
          notes: notes.trim() || undefined,
        });
      } else {
        const deltaM = parseInt(deltaAudioMins || "0", 10) || 0;
        onSaveLog(book.id, {
          localDate: safeDate,
          minutesListened: deltaM,
          durationMinutes: durMins,
          notes: notes.trim() || undefined,
        });
      }
    } else {
      if (mode === "new_position") {
        const pos = parseInt(newPageVal || "0", 10);
        onSaveLog(book.id, {
          localDate: safeDate,
          newPage: pos,
          durationMinutes: durMins,
          notes: notes.trim() || undefined,
        });
      } else {
        const delta = parseInt(deltaPagesVal || "0", 10);
        onSaveLog(book.id, {
          localDate: safeDate,
          pagesRead: delta,
          durationMinutes: durMins,
          notes: notes.trim() || undefined,
        });
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#FFF9F6] rounded-t-3xl sm:rounded-3xl border border-[#F2E5E3] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F2E5E3] flex items-center justify-between bg-white/60">
          <div>
            <h2 className="font-serif font-bold text-base text-[#3D1E28]">
              {isAr ? "تسجيل جلسة قراءة 📖" : "Log Reading Session 📖"}
            </h2>
            <p className="text-xs text-[#7A5B64] truncate max-w-[240px]">
              {book.title} {book.author ? `• ${book.author}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 active:scale-95 text-[#7A5B64] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Current Progress Reminder */}
          <div className="p-3 bg-white/80 rounded-2xl border border-[#F2E5E3] flex items-center justify-between text-xs">
            <span className="text-[#7A5B64]">{isAr ? "الموقع الحالي:" : "Current Position:"}</span>
            <span className="font-bold text-[#3D1E28]">
              {isAudio
                ? `${formatReadingDuration(book.currentMinutes || 0, isAr)}${
                    book.totalMinutes ? ` / ${formatReadingDuration(book.totalMinutes, isAr)}` : ""
                  }`
                : `p. ${book.currentPage || 0}${book.totalPages ? ` / ${book.totalPages}` : ""}`}
            </span>
          </div>

          {/* Mode Switcher: New Position vs Delta */}
          <div className="grid grid-cols-2 gap-2 bg-[#F5EBE9] p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("new_position")}
              className={`py-2 rounded-xl transition-all ${
                mode === "new_position"
                  ? "bg-white text-[#9D174D] shadow-xs"
                  : "text-[#7A5B64] hover:text-[#3D1E28]"
              }`}
            >
              {isAr ? "وصلتُ إلى صفحة / موقع" : "Reached Position"}
            </button>
            <button
              type="button"
              onClick={() => setMode("delta")}
              className={`py-2 rounded-xl transition-all ${
                mode === "delta"
                  ? "bg-white text-[#9D174D] shadow-xs"
                  : "text-[#7A5B64] hover:text-[#3D1E28]"
              }`}
            >
              {isAr ? "قرأتُ / استمعتُ اليوم" : "+ Added Today"}
            </button>
          </div>

          {/* Value Input depending on format and mode */}
          {isAudio ? (
            mode === "new_position" ? (
              <div>
                <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                  {isAr ? "وصلتُ عند التوقيت:" : "Reached Timestamp:"}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-[#F2E5E3]">
                    <input
                      type="number"
                      min="0"
                      value={newAudioHours}
                      onChange={(e) => setNewAudioHours(e.target.value)}
                      placeholder="0"
                      className="w-full text-sm font-bold text-[#3D1E28] outline-none"
                    />
                    <span className="text-xs text-[#7A5B64]">{isAr ? "ساعة" : "hrs"}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-[#F2E5E3]">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={newAudioMins}
                      onChange={(e) => setNewAudioMins(e.target.value)}
                      placeholder="0"
                      className="w-full text-sm font-bold text-[#3D1E28] outline-none"
                    />
                    <span className="text-xs text-[#7A5B64]">{isAr ? "دقيقة" : "mins"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                  {isAr ? "دقائق الاستماع المضافة:" : "Minutes Listened Today:"}
                </label>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#F2E5E3]">
                  <input
                    type="number"
                    min="1"
                    value={deltaAudioMins}
                    onChange={(e) => setDeltaAudioMins(e.target.value)}
                    placeholder="20"
                    className="w-full text-sm font-bold text-[#3D1E28] outline-none"
                  />
                  <span className="text-xs text-[#7A5B64]">{isAr ? "دقيقة" : "mins"}</span>
                </div>
              </div>
            )
          ) : mode === "new_position" ? (
            <div>
              <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                {isAr ? "رقم الصفحة التي وصلتِ إليها:" : "Page Reached:"}
              </label>
              <input
                type="number"
                min="0"
                max={book.totalPages || 9999}
                value={newPageVal}
                onChange={(e) => setNewPageVal(e.target.value)}
                placeholder="150"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                {isAr ? "عدد الصفحات المقروءة اليوم:" : "Pages Read Today:"}
              </label>
              <input
                type="number"
                min="1"
                value={deltaPagesVal}
                onChange={(e) => setDeltaPagesVal(e.target.value)}
                placeholder="20"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
              />
            </div>
          )}

          {/* Session Duration & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                {isAr ? "وقت الجلسة (دقائق)" : "Session Duration"}
              </label>
              <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-[#F2E5E3]">
                <Clock size={14} className="text-[#E87A90] shrink-0" />
                <input
                  type="number"
                  min="0"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  placeholder="25"
                  className="w-full text-xs text-[#3D1E28] outline-none"
                />
                <span className="text-[11px] text-[#7A5B64]">{isAr ? "د" : "m"}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                {isAr ? "تاريخ الجلسة" : "Date (No future dates)"}
              </label>
              <input
                type="date"
                max={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Short note or takeaway */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E28] mb-1">
              {isAr ? "انطباع أو خاطرة سريعة (اختياري)" : "Session Reflection or Thought (Optional)"}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? "فكرة استوقفتكِ أو شعور راودكِ..." : "A thought that resonated..."}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] text-xs focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-[#F2E5E3] bg-white/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#F2E5E3] text-[#7A5B64] text-xs font-semibold hover:bg-black/5 active:scale-95 transition-all"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 transition-all"
          >
            {isAr ? "تسجيل القراءة ✨" : "Save Log ✨"}
          </button>
        </div>
      </div>
    </div>
  );
});
