import { useState, useEffect, memo } from "react";
import {
  type Book,
  type BookNote,
  type ReadingStatus,
  calculateBookProgress,
  formatReadingDuration,
} from "@/lib/bookshelfEngine";
import { useLang } from "@/lib/i18n";
import { BookCover } from "./BookCover";
import {
  X,
  Plus,
  Play,
  RotateCcw,
  Star,
  Quote,
  FileText,
  Clock,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Archive,
  BookOpen,
  Smartphone,
  Headphones,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";

interface BookDetailModalProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onOpenLog: (book: Book) => void;
  onStartFocus: (book: Book) => void;
  onStartReread: (bookId: string) => void;
  onAddNote: (
    bookId: string,
    note: { type: "note" | "quote"; content: string; pageOrLocation?: string }
  ) => void;
  onDeleteNote: (bookId: string, noteId: string) => void;
  onUpdateStatus: (bookId: string, status: ReadingStatus) => void;
  onSetRating: (bookId: string, rating: number, review?: string) => void;
  onDeleteBook: (bookId: string) => void;
  onArchiveBook: (bookId: string) => void;
  allGoals?: { id: string; title: string }[];
  allHabits?: { id: string; name: string }[];
  onLinkGoalHabit?: (bookId: string, goalId?: string, habitId?: string) => void;
}

export const BookDetailModal = memo(function BookDetailModal({
  book,
  open,
  onClose,
  onEdit,
  onOpenLog,
  onStartFocus,
  onStartReread,
  onAddNote,
  onDeleteNote,
  onUpdateStatus,
  onSetRating,
  onDeleteBook,
  onArchiveBook,
  allGoals = [],
  allHabits = [],
  onLinkGoalHabit,
}: BookDetailModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const [activeTab, setActiveTab] = useState<"logs" | "notes" | "details">("logs");

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // New Note / Quote Form
  const [newNoteType, setNewNoteType] = useState<"quote" | "note">("quote");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteLoc, setNewNoteLoc] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Review & Rating State
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewText, setReviewText] = useState("");

  if (!open || !book) return null;

  const progress = calculateBookProgress(book);

  const formatIcon =
    book.format === "audiobook" ? (
      <Headphones size={13} />
    ) : book.format === "ebook" ? (
      <Smartphone size={13} />
    ) : (
      <BookOpen size={13} />
    );

  const formatLabel =
    book.format === "audiobook"
      ? isAr
        ? "كتاب صوتي"
        : "Audiobook"
      : book.format === "ebook"
      ? isAr
        ? "كتاب إلكتروني"
        : "Ebook"
      : isAr
      ? "كتاب ورقي"
      : "Print Book";

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    onAddNote(book.id, {
      type: newNoteType,
      content: newNoteContent.trim(),
      pageOrLocation: newNoteLoc.trim() || undefined,
    });
    setNewNoteContent("");
    setNewNoteLoc("");
    setIsAddingNote(false);
  };

  const handleRatingClick = (star: number) => {
    const nextRating = book.rating === star ? 0 : star;
    onSetRating(book.id, nextRating, book.review);
  };

  const handleSaveReview = () => {
    onSetRating(book.id, book.rating || 0, reviewText.trim() || undefined);
    setIsEditingReview(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#FFF9F6] rounded-t-3xl sm:rounded-3xl border border-[#F2E5E3] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-[#F2E5E3] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              {formatIcon}
              <span>{formatLabel}</span>
            </span>

            {book.currentCycle > 1 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <RotateCcw size={10} />
                <span>{isAr ? `قراءة ${book.currentCycle}` : `Reread #${book.currentCycle}`}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(book)}
              className="p-2 rounded-full hover:bg-black/5 active:scale-95 text-[#7A5B64] transition-all"
              title={isAr ? "تعديل الكتاب" : "Edit book"}
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={isAr ? "إغلاق" : "Close"}
              data-testid="close-book-detail"
              className="p-2 rounded-full hover:bg-black/5 active:scale-95 text-[#7A5B64] transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Hero Section: Cover + Book Info */}
          <div className="flex items-start gap-4">
            <div className="w-24 shrink-0 shadow-md rounded-xl overflow-hidden">
              <BookCover book={book} size="lg" className="w-24 h-34 rounded-xl" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-serif font-bold text-base text-[#3D1E28] leading-snug mb-1">
                {book.title}
              </h2>
              {book.author && (
                <p className="text-xs font-medium text-[#7A5B64] mb-2">{book.author}</p>
              )}

              {/* Status Selector dropdown/pill */}
              <div className="mb-2">
                <select
                  value={book.status}
                  onChange={(e) => onUpdateStatus(book.id, e.target.value as ReadingStatus)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-[#F2E5E3] text-xs font-bold text-[#9D174D] focus:outline-none"
                >
                  <option value="reading">{isAr ? "أقرأ الآن" : "Reading"}</option>
                  <option value="want_to_read">{isAr ? "أريد قراءته" : "Want to Read"}</option>
                  <option value="finished">{isAr ? "مكتمل" : "Finished"}</option>
                  <option value="paused">{isAr ? "متوقفة مؤقتًا" : "Paused"}</option>
                  <option value="stopped">{isAr ? "توقفت عن قراءته" : "Stopped Reading"}</option>
                </select>
              </div>

              {/* Star Rating preview & toggle */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleRatingClick(s)}
                    className="p-0.5 hover:scale-110 active:scale-95 transition-transform"
                    aria-label={`Rate ${s} stars`}
                  >
                    <Star
                      size={16}
                      className={
                        (book.rating || 0) >= s
                          ? "fill-amber-400 text-amber-400"
                          : "text-[#D5C2C4] hover:text-amber-300"
                      }
                    />
                  </button>
                ))}
                {book.rating ? (
                  <span className="text-[11px] font-bold text-amber-700 ms-1">
                    {book.rating} / 5
                  </span>
                ) : (
                  <span className="text-[10px] text-[#A89297] ms-1">
                    {isAr ? "قيّمي الكتاب" : "Rate"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Widget Card */}
          <div className="p-4 bg-white/90 rounded-2xl border border-[#F2E5E3] shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-[#3D1E28]">
                {isAr ? "التقدم في القراءة" : "Reading Progress"}
              </span>
              <span className="font-bold text-[#9D174D]">
                {isAr ? progress.labelAr : progress.labelEn}
              </span>
            </div>

            {progress.percent !== undefined ? (
              <div className="w-full h-2 rounded-full bg-[#F3EBE9] overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress.isFinished
                      ? "bg-[#10B981]"
                      : "bg-gradient-to-r from-[#F472B6] to-[#FB7185]"
                  }`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            ) : (
              <div className="mb-3" />
            )}

            {/* Main Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenLog(book)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 transition-all"
              >
                <Plus size={14} />
                <span>{isAr ? "تسجيل قراءة" : "Log Reading"}</span>
              </button>

              <button
                type="button"
                onClick={() => onStartFocus(book)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FFF2F4] text-[#E87A90] text-xs font-bold border border-[#FCD7DE] hover:bg-[#FFE4E8] active:scale-95 transition-all"
              >
                <Play size={13} className="fill-[#E87A90]" />
                <span>{isAr ? "ابدئي جلسة تركيز" : "Read with Focus"}</span>
              </button>
            </div>

            {/* Reread Button if Finished */}
            {book.status === "finished" && (
              <div className="mt-2.5 pt-2.5 border-t border-[#F2E5E3] text-center">
                <button
                  type="button"
                  onClick={() => onStartReread(book.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all"
                >
                  <RotateCcw size={13} />
                  <span>{isAr ? "بدء دورة إعادة قراءة جديدة 🌸" : "Start New Reading Cycle (Reread)"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Personal Review Note (if present or clicked) */}
          <div className="p-3.5 bg-white/70 rounded-2xl border border-[#F2E5E3]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
                <FileText size={13} className="text-[#E87A90]" />
                <span>{isAr ? "انطباعكِ ومراجعتكِ الشخصية" : "Personal Review & Reflection"}</span>
              </span>
              {!isEditingReview && (
                <button
                  type="button"
                  onClick={() => {
                    setReviewText(book.review || "");
                    setIsEditingReview(true);
                  }}
                  className="text-[11px] text-[#E87A90] font-semibold hover:underline"
                >
                  {book.review ? (isAr ? "تعديل" : "Edit") : isAr ? "+ أضيفي انطباعاً" : "+ Add reflection"}
                </button>
              )}
            </div>

            {isEditingReview ? (
              <div className="space-y-2 mt-2">
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={
                    isAr
                      ? "ما الأفكار أو المشاعر التي تركها هذا الكتاب بداخلكِ..."
                      : "Reflections, highlights, or feelings this book inspired..."
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#F2E5E3] text-xs text-[#3D1E28] focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40 resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingReview(false)}
                    className="px-3 py-1 rounded-lg text-xs text-[#7A5B64]"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    className="px-3 py-1 rounded-lg grad-theme text-white text-xs font-bold shadow-xs"
                  >
                    {isAr ? "حفظ" : "Save"}
                  </button>
                </div>
              </div>
            ) : book.review ? (
              <p className="text-xs text-[#5C444C] leading-relaxed italic bg-rose-50/40 p-2.5 rounded-xl border border-rose-100">
                &ldquo;{book.review}&rdquo;
              </p>
            ) : (
              <p className="text-xs text-[#9E838B] italic">
                {isAr
                  ? "لا توجد مراجعة مكتوبة بعد. دعي انطباعكِ الشخصي يوثق أثر الكتاب."
                  : "No personal review written yet. Record your takeaways and lasting thoughts."}
              </p>
            )}
          </div>

          {/* Subtabs: Logs & Cycles | Notes & Quotes | Details */}
          <div>
            <div className="flex items-center gap-1 p-1 bg-[#F5EBE9] rounded-2xl mb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === "logs"
                    ? "bg-white text-[#9D174D] shadow-xs"
                    : "text-[#7A5B64] hover:text-[#3D1E28]"
                }`}
              >
                {isAr ? "سجل القراءة" : "Reading Log"} ({book.logs?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === "notes"
                    ? "bg-white text-[#9D174D] shadow-xs"
                    : "text-[#7A5B64] hover:text-[#3D1E28]"
                }`}
              >
                {isAr ? "اقتباسات وملاحظات" : "Quotes & Notes"} ({book.notes?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === "details"
                    ? "bg-white text-[#9D174D] shadow-xs"
                    : "text-[#7A5B64] hover:text-[#3D1E28]"
                }`}
              >
                {isAr ? "تفاصيل وربط" : "Details & Links"}
              </button>
            </div>

            {/* TAB 1: READING LOGS & CYCLES */}
            {activeTab === "logs" && (
              <div className="space-y-2">
                {book.logs && book.logs.length > 0 ? (
                  book.logs.map((lg) => (
                    <div
                      key={lg.id}
                      className="p-3 bg-white/80 rounded-2xl border border-[#F2E5E3] text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-[#7A5B64]">
                        <span className="font-semibold flex items-center gap-1">
                          <Calendar size={12} className="text-[#E87A90]" />
                          <span>{lg.localDate}</span>
                          {lg.cycleNumber > 1 && (
                            <span className="text-[10px] text-rose-600 bg-rose-50 px-1 rounded">
                              #{lg.cycleNumber}
                            </span>
                          )}
                        </span>
                        {lg.durationMinutes && (
                          <span className="flex items-center gap-1 text-[#9D174D] font-bold">
                            <Clock size={11} />
                            <span>{formatReadingDuration(lg.durationMinutes, isAr)}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[#3D1E28] font-bold">
                        <span>
                          {lg.endPage !== undefined
                            ? isAr
                              ? `وصلتِ لصفحة ${lg.endPage}`
                              : `Reached page ${lg.endPage}`
                            : lg.endMinutes !== undefined
                            ? isAr
                              ? `وصلتِ لـ ${formatReadingDuration(lg.endMinutes, isAr)}`
                              : `Reached ${formatReadingDuration(lg.endMinutes, isAr)}`
                            : ""}
                        </span>
                        {(lg.pagesRead || lg.minutesListened) && (
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                            +{lg.pagesRead ? `${lg.pagesRead} ${isAr ? "صفحة" : "pages"}` : `${lg.minutesListened} ${isAr ? "دقيقة" : "min"}`}
                          </span>
                        )}
                      </div>

                      {lg.notes && (
                        <p className="text-[11px] text-[#5C444C] mt-1 pt-1 border-t border-[#F2E5E3] italic">
                          &ldquo;{lg.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 px-4 bg-white/40 rounded-2xl border border-dashed border-[#F2E5E3]">
                    <Clock size={24} className="mx-auto text-[#D5C2C4] mb-1.5" />
                    <p className="text-xs text-[#7A5B64] font-medium">
                      {isAr ? "لم تسجلي جلسات قراءة بعد." : "No reading sessions logged yet."}
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenLog(book)}
                      className="mt-2 text-xs font-bold text-[#E87A90] hover:underline"
                    >
                      {isAr ? "+ تسجيل أول جلسة" : "+ Log first session"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: QUOTES & NOTES */}
            {activeTab === "notes" && (
              <div className="space-y-3">
                {/* Add quote/note button or inline form */}
                {!isAddingNote ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    className="w-full py-2.5 px-3 rounded-2xl bg-white border border-dashed border-[#E8B4B8] text-xs font-bold text-[#9D174D] flex items-center justify-center gap-1.5 hover:bg-rose-50/50 active:scale-98 transition-all"
                  >
                    <Plus size={14} />
                    <span>{isAr ? "إضافة اقتباس أو ملاحظة ملهمة" : "Add Quote or Reflection"}</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleCreateNote}
                    className="p-3.5 bg-white rounded-2xl border border-[#F2E5E3] space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewNoteType("quote")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          newNoteType === "quote"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-[#F5EBE9] text-[#7A5B64]"
                        }`}
                      >
                        {isAr ? "اقتباس 💬" : "Quote 💬"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewNoteType("note")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          newNoteType === "note"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-[#F5EBE9] text-[#7A5B64]"
                        }`}
                      >
                        {isAr ? "ملاحظة / فكرة 📝" : "Reflection 📝"}
                      </button>
                    </div>

                    <textarea
                      required
                      rows={2}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder={
                        newNoteType === "quote"
                          ? isAr
                            ? "اكتبي نص الاقتباس الذي أثّر بكِ..."
                            : "Enter quote text..."
                          : isAr
                          ? "اكتبي فكرتكِ أو استنتاجكِ..."
                          : "Enter your reflection..."
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FFF9F6] border border-[#F2E5E3] text-xs text-[#3D1E28] focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40 resize-none"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newNoteLoc}
                        onChange={(e) => setNewNoteLoc(e.target.value)}
                        placeholder={isAr ? "الصفحة أو الفصل (مثال: ص 42)" : "Page or Chapter (e.g. p. 42)"}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#FFF9F6] border border-[#F2E5E3] text-xs text-[#3D1E28] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddingNote(false)}
                        className="px-3 py-1.5 text-xs text-[#7A5B64]"
                      >
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 grad-theme text-white text-xs font-bold rounded-xl shadow-xs"
                      >
                        {isAr ? "إضافة" : "Add"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Notes List */}
                {book.notes && book.notes.length > 0 ? (
                  book.notes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-white/80 rounded-2xl border border-[#F2E5E3] text-xs flex flex-col gap-1.5 relative group"
                    >
                      <div className="flex items-center justify-between text-[#7A5B64]">
                        <span className="flex items-center gap-1 font-semibold text-[11px]">
                          {n.type === "quote" ? (
                            <Quote size={12} className="text-[#E87A90]" />
                          ) : (
                            <FileText size={12} className="text-[#E87A90]" />
                          )}
                          <span>{n.type === "quote" ? (isAr ? "اقتباس" : "Quote") : isAr ? "ملاحظة" : "Note"}</span>
                          {n.pageOrLocation && (
                            <span className="text-[#9D174D] font-mono">({n.pageOrLocation})</span>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => onDeleteNote(book.id, n.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
                          title={isAr ? "حذف الملاحظة" : "Delete note"}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <p
                        className={`text-xs text-[#3D1E28] leading-relaxed ${
                          n.type === "quote" ? "italic font-serif ps-2 border-s-2 border-[#E87A90]" : ""
                        }`}
                      >
                        {n.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 px-4 bg-white/40 rounded-2xl border border-dashed border-[#F2E5E3]">
                    <Quote size={24} className="mx-auto text-[#D5C2C4] mb-1.5" />
                    <p className="text-xs text-[#7A5B64] font-medium">
                      {isAr ? "لا توجد اقتباسات محفوظة بعد." : "No quotes saved yet."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DETAILS & LINKS */}
            {activeTab === "details" && (
              <div className="p-3.5 bg-white/80 rounded-2xl border border-[#F2E5E3] space-y-3 text-xs">
                {book.description && (
                  <div>
                    <span className="font-bold text-[#3D1E28] block mb-0.5">
                      {isAr ? "الهدف أو الوصف الشخصي:" : "Description / Why Read:"}
                    </span>
                    <p className="text-xs text-[#5C444C] leading-relaxed">{book.description}</p>
                  </div>
                )}

                {book.genre && (
                  <div>
                    <span className="font-bold text-[#3D1E28] block mb-0.5">
                      {isAr ? "التصنيف:" : "Genre:"}
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 font-semibold border border-rose-200">
                      {book.genre}
                    </span>
                  </div>
                )}

                {/* Explicit Linking to Goal or Habit */}
                {onLinkGoalHabit && (allGoals.length > 0 || allHabits.length > 0) && (
                  <div className="pt-2 border-t border-[#F2E5E3] space-y-2">
                    <span className="font-bold text-[#3D1E28] flex items-center gap-1">
                      <LinkIcon size={12} className="text-[#E87A90]" />
                      <span>{isAr ? "ربط بهدف أو عادة قائمة:" : "Link to Goal or Habit:"}</span>
                    </span>

                    {allGoals.length > 0 && (
                      <div>
                        <label className="block text-[11px] text-[#7A5B64] mb-0.5">
                          {isAr ? "الهدف المرتبط:" : "Linked Goal:"}
                        </label>
                        <select
                          value={book.linkedGoalId || ""}
                          onChange={(e) =>
                            onLinkGoalHabit(book.id, e.target.value || undefined, book.linkedHabitId)
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#F2E5E3] text-xs text-[#3D1E28]"
                        >
                          <option value="">{isAr ? "-- بدون هدف مرتبط --" : "-- No Linked Goal --"}</option>
                          {allGoals.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {allHabits.length > 0 && (
                      <div>
                        <label className="block text-[11px] text-[#7A5B64] mb-0.5">
                          {isAr ? "العادة المرتبطة:" : "Linked Habit:"}
                        </label>
                        <select
                          value={book.linkedHabitId || ""}
                          onChange={(e) =>
                            onLinkGoalHabit(book.id, book.linkedGoalId, e.target.value || undefined)
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#F2E5E3] text-xs text-[#3D1E28]"
                        >
                          <option value="">{isAr ? "-- بدون عادة مرتبطة --" : "-- No Linked Habit --"}</option>
                          {allHabits.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#F2E5E3] bg-white/70 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  isAr
                    ? "هل أنتِ متأكدة من حذف هذا الكتاب نهائياً من مكتبتكِ؟"
                    : "Are you sure you want to permanently delete this book?"
                )
              ) {
                onDeleteBook(book.id);
                onClose();
              }
            }}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50 active:scale-95 transition-all"
          >
            <Trash2 size={13} />
            <span>{isAr ? "حذف" : "Delete"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onArchiveBook(book.id);
                onClose();
              }}
              className="flex items-center gap-1 text-[#7A5B64] text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#F2E5E3] hover:bg-black/5 active:scale-95 transition-all"
            >
              <Archive size={13} />
              <span>{book.isArchived ? (isAr ? "استرجاع" : "Restore") : isAr ? "أرشفة" : "Archive"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(book);
              }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl grad-theme text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Edit2 size={13} />
              <span>{isAr ? "تعديل الكتاب" : "Edit Book"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
