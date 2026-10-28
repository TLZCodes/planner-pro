import { useState, useEffect, useMemo, memo } from "react";
import {
  type Book,
  type BookFormat,
  type ReadingStatus,
  detectDuplicateBook,
  formatReadingDuration,
} from "@/lib/bookshelfEngine";
import { useLang } from "@/lib/i18n";
import { BookCover } from "./BookCover";
import { X, BookOpen, Smartphone, Headphones, Image as ImageIcon, AlertCircle } from "lucide-react";

interface AddEditBookModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (bookData: Partial<Book> & { title: string }) => void;
  editingBook?: Book | null;
  existingBooks: Book[];
}

const EMOJI_OPTIONS = ["📚", "📗", "📘", "📕", "📙", "📖", "🔖", "📜", "🌸", "☕", "✨", "🧠"];

export const AddEditBookModal = memo(function AddEditBookModal({
  open,
  onClose,
  onSave,
  editingBook,
  existingBooks,
}: AddEditBookModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [format, setFormat] = useState<BookFormat>("print");
  const [status, setStatus] = useState<ReadingStatus>("reading");
  const [totalPages, setTotalPages] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<string>("");
  const [audioTotalHours, setAudioTotalHours] = useState<string>("");
  const [audioTotalMins, setAudioTotalMins] = useState<string>("");
  const [audioCurHours, setAudioCurHours] = useState<string>("");
  const [audioCurMins, setAudioCurMins] = useState<string>("");
  const [manualPercentage, setManualPercentage] = useState<string>("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [coverEmoji, setCoverEmoji] = useState("📚");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  // Hydrate when editingBook changes
  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title || "");
      setAuthor(editingBook.author || "");
      setFormat(editingBook.format || "print");
      setStatus(editingBook.status || "reading");
      setTotalPages(editingBook.totalPages ? String(editingBook.totalPages) : "");
      setCurrentPage(editingBook.currentPage !== undefined ? String(editingBook.currentPage) : "");

      if (editingBook.totalMinutes) {
        setAudioTotalHours(String(Math.floor(editingBook.totalMinutes / 60)));
        setAudioTotalMins(String(editingBook.totalMinutes % 60));
      } else {
        setAudioTotalHours("");
        setAudioTotalMins("");
      }

      if (editingBook.currentMinutes) {
        setAudioCurHours(String(Math.floor(editingBook.currentMinutes / 60)));
        setAudioCurMins(String(editingBook.currentMinutes % 60));
      } else {
        setAudioCurHours("");
        setAudioCurMins("");
      }

      setManualPercentage(
        editingBook.manualPercentage !== undefined ? String(editingBook.manualPercentage) : ""
      );
      setGenre(editingBook.genre || "");
      setDescription(editingBook.description || "");
      setCoverEmoji(editingBook.coverEmoji || "📚");
      setCoverImage(editingBook.coverImage);
    } else {
      setTitle("");
      setAuthor("");
      setFormat("print");
      setStatus("reading");
      setTotalPages("");
      setCurrentPage("");
      setAudioTotalHours("");
      setAudioTotalMins("");
      setAudioCurHours("");
      setAudioCurMins("");
      setManualPercentage("");
      setGenre("");
      setDescription("");
      setCoverEmoji("📚");
      setCoverImage(undefined);
    }
  }, [editingBook, open]);

  // Live duplicate detection
  const duplicateMatch = useMemo(() => {
    if (!title.trim()) return null;
    return detectDuplicateBook(title, author, existingBooks, editingBook?.id);
  }, [title, author, existingBooks, editingBook]);

  // Mock preview book for live cover rendering
  const previewBook: Book = useMemo(
    () => ({
      id: editingBook?.id || "preview",
      title: title.trim() || (isAr ? "عنوان الكتاب" : "Book Title"),
      author: author.trim() || (isAr ? "اسم الكاتب" : "Author Name"),
      format,
      status,
      totalPages: totalPages ? parseInt(totalPages, 10) : undefined,
      coverEmoji,
      coverImage,
      addedDate: editingBook?.addedDate || "2026-10-16",
      currentCycle: editingBook?.currentCycle || 1,
    }),
    [title, author, format, status, totalPages, coverEmoji, coverImage, editingBook, isAr]
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCoverImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let totPagesNum = totalPages ? parseInt(totalPages, 10) : undefined;
    let curPageNum = currentPage ? parseInt(currentPage, 10) : undefined;

    let totMinNum: number | undefined = undefined;
    let curMinNum: number | undefined = undefined;

    if (format === "audiobook") {
      const totH = parseInt(audioTotalHours || "0", 10) || 0;
      const totM = parseInt(audioTotalMins || "0", 10) || 0;
      totMinNum = totH * 60 + totM > 0 ? totH * 60 + totM : undefined;

      const curH = parseInt(audioCurHours || "0", 10) || 0;
      const curM = parseInt(audioCurMins || "0", 10) || 0;
      curMinNum = curH * 60 + curM > 0 ? curH * 60 + curM : undefined;
    }

    const manualPctNum = manualPercentage ? parseInt(manualPercentage, 10) : undefined;

    onSave({
      ...(editingBook || {}),
      title: title.trim(),
      author: author.trim() || undefined,
      format,
      status,
      totalPages: totPagesNum,
      currentPage: curPageNum,
      totalMinutes: totMinNum,
      currentMinutes: curMinNum,
      manualPercentage: manualPctNum,
      genre: genre.trim() || undefined,
      description: description.trim() || undefined,
      coverEmoji,
      coverImage,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#FFF9F6] rounded-t-3xl sm:rounded-3xl border border-[#F2E5E3] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#F2E5E3] flex items-center justify-between bg-white/60">
          <div>
            <h2 className="font-serif font-bold text-base text-[#3D1E28]">
              {editingBook
                ? isAr
                  ? "تعديل الكتاب"
                  : "Edit Book"
                : isAr
                ? "إضافة كتاب جديد 📚"
                : "Add New Book 📚"}
            </h2>
            <p className="text-xs text-[#7A5B64]">
              {isAr ? "وثّقي كتابكِ بكل تفاصيله ونسخته" : "Document your book and format with ease."}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Duplicate Warning */}
          {duplicateMatch && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {isAr ? "كتاب مشابه موجود:" : "Possible Duplicate:"}
                </span>{" "}
                <span>
                  &ldquo;{duplicateMatch.title}&rdquo;{" "}
                  {duplicateMatch.author ? `(${duplicateMatch.author})` : ""}
                </span>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {isAr
                    ? "يمكنكِ الاستمرار إذا كانت هذه نسخة أو ترجمة مختلفة."
                    : "You can still save if this is a different edition or translation."}
                </p>
              </div>
            </div>
          )}

          {/* Live Cover Preview + Emoji/Image Picker */}
          <div className="flex items-center gap-4 p-3 bg-white/70 rounded-2xl border border-[#F2E5E3]">
            <div className="w-16 shrink-0">
              <BookCover book={previewBook} size="sm" className="w-16 h-22 rounded-lg" />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <label className="block text-xs font-bold text-[#3D1E28]">
                {isAr ? "رمز أو غلاف الكتاب" : "Cover Style or Photo"}
              </label>

              {/* Emoji bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      setCoverEmoji(em);
                      setCoverImage(undefined);
                    }}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center shrink-0 border transition-all ${
                      coverEmoji === em && !coverImage
                        ? "bg-rose-100 border-rose-300 scale-105"
                        : "bg-white border-[#F2E5E3] hover:bg-rose-50"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>

              {/* Upload image button */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF2F4] text-[#E87A90] text-xs font-semibold border border-[#FCD7DE] hover:bg-[#FFE4E8] active:scale-95 transition-all">
                  <ImageIcon size={13} />
                  <span>{isAr ? "تحميل صورة غلاف" : "Upload Cover Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage(undefined)}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    {isAr ? "إزالة الصورة" : "Remove"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E28] mb-1">
              {isAr ? "عنوان الكتاب *" : "Book Title *"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? "مثال: لأنك الله، العادات الذرية..." : "e.g. Atomic Habits, Deep Work..."}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E28] mb-1">
              {isAr ? "اسم الكاتب / المؤلف" : "Author"}
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={isAr ? "مثال: جيمس كلير، علي بن جابر الفيفي..." : "e.g. James Clear"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
            />
          </div>

          {/* Format Selector (Print, Ebook, Audiobook) */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E28] mb-1.5">
              {isAr ? "صيغة الكتاب" : "Book Format"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "print" as const, labelEn: "Print", labelAr: "ورقي", icon: BookOpen },
                { key: "ebook" as const, labelEn: "Ebook", labelAr: "إلكتروني", icon: Smartphone },
                { key: "audiobook" as const, labelEn: "Audiobook", labelAr: "صوتي", icon: Headphones },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = format === fmt.key;
                return (
                  <button
                    key={fmt.key}
                    type="button"
                    onClick={() => setFormat(fmt.key)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#FFF0F3] border-[#E87A90] text-[#9D174D] shadow-xs"
                        : "bg-white border-[#F2E5E3] text-[#7A5B64] hover:bg-rose-50/50"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{isAr ? fmt.labelAr : fmt.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E28] mb-1.5">
              {isAr ? "حالة القراءة" : "Reading Status"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { key: "want_to_read" as const, labelEn: "Want to Read", labelAr: "أريد قراءته" },
                { key: "reading" as const, labelEn: "Reading", labelAr: "أقرأ الآن" },
                { key: "finished" as const, labelEn: "Finished", labelAr: "مكتمل" },
                { key: "paused" as const, labelEn: "Paused", labelAr: "متوقفة مؤقتًا" },
                { key: "stopped" as const, labelEn: "Stopped", labelAr: "توقفت عن قراءته" },
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setStatus(st.key)}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    status === st.key
                      ? "bg-[#FFF0F3] border-[#E87A90] text-[#9D174D]"
                      : "bg-white border-[#F2E5E3] text-[#7A5B64] hover:bg-rose-50/40"
                  }`}
                >
                  {isAr ? st.labelAr : st.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Format-Specific Progress Inputs */}
          {format === "audiobook" ? (
            <div className="space-y-3 p-3 bg-white/70 rounded-2xl border border-[#F2E5E3]">
              <div>
                <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                  {isAr ? "إجمالي مدة الكتاب الصوتي (اختياري)" : "Total Audio Duration (Optional)"}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#F2E5E3]">
                    <input
                      type="number"
                      min="0"
                      value={audioTotalHours}
                      onChange={(e) => setAudioTotalHours(e.target.value)}
                      placeholder="0"
                      className="w-full text-sm text-[#3D1E28] outline-none"
                    />
                    <span className="text-xs text-[#7A5B64]">{isAr ? "س" : "hrs"}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#F2E5E3]">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={audioTotalMins}
                      onChange={(e) => setAudioTotalMins(e.target.value)}
                      placeholder="0"
                      className="w-full text-sm text-[#3D1E28] outline-none"
                    />
                    <span className="text-xs text-[#7A5B64]">{isAr ? "د" : "mins"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                  {isAr ? "الموقع الحالي للاستماع" : "Current Listening Position"}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#F2E5E3]">
                    <input
                      type="number"
                      min="0"
                      value={audioCurHours}
                      onChange={(e) => setAudioCurHours(e.target.value)}
                      placeholder="0"
                      className="w-full text-sm text-[#3D1E28] outline-none"
                    />
                    <span className="text-xs text-[#7A5B64]">{isAr ? "س" : "hrs"}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#F2E5E3]">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={audioCurMins}
                      onChange={(e) => setAudioCurMins(e.target.value)}
                      placeholder="0"
                      className="w-full text-sm text-[#3D1E28] outline-none"
                    />
                    <span className="text-xs text-[#7A5B64]">{isAr ? "د" : "mins"}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3 bg-white/70 rounded-2xl border border-[#F2E5E3]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                    {isAr ? "إجمالي الصفحات (اختياري)" : "Total Pages (Optional)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                    placeholder={isAr ? "مثال: 320" : "e.g. 320"}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D1E28] mb-1">
                    {isAr ? "الصفحة الحالية" : "Current Page"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentPage}
                    onChange={(e) => setCurrentPage(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
                  />
                </div>
              </div>

              {/* If total pages is not known, allow manual percentage */}
              {!totalPages && (
                <div>
                  <label className="block text-xs font-medium text-[#7A5B64] mb-1">
                    {isAr ? "أو نسبة الإنجاز اليدوية % (اختياري)" : "Or manual percentage % (optional)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={manualPercentage}
                    onChange={(e) => setManualPercentage(e.target.value)}
                    placeholder="0 - 100"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
                  />
                </div>
              )}
            </div>
          )}

          {/* Genre / Category */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E28] mb-1">
              {isAr ? "التصنيف أو المجال (اختياري)" : "Genre or Category (Optional)"}
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder={isAr ? "مثال: تطوير الذات، أدب، فكر إسلامي..." : "e.g. Self-help, Philosophy, Fiction..."}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
            />
          </div>

          {/* Personal Description / Reason */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E28] mb-1">
              {isAr ? "لماذا اخترتِ قراءة هذا الكتاب؟ (اختياري)" : "Personal Reflection or Why Read (Optional)"}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "أثر متوقع، أو توصية من صديقة..." : "What drew you to this book..."}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F2E5E3] text-[#3D1E28] text-sm focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40 resize-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#F2E5E3] bg-white/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#F2E5E3] text-[#7A5B64] text-xs font-semibold hover:bg-black/5 active:scale-95 transition-all"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 transition-all"
          >
            {editingBook ? (isAr ? "حفظ التعديلات" : "Save Changes") : isAr ? "إضافة للكتاب" : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
});
