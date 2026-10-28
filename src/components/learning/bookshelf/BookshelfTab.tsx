import { useState, useMemo, memo } from "react";
import {
  type Book,
  type ReadingStatus,
  type BookFormat,
  type MonthlyReadingTarget,
  calculateBookshelfStats,
  calculateMonthlyTargetProgress,
  filterAndSortBooks,
  getCurrentYearMonth,
} from "@/lib/bookshelfEngine";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { BookCard } from "./BookCard";
import { BookDetailModal } from "./BookDetailModal";
import { AddEditBookModal } from "./AddEditBookModal";
import { LogReadingModal } from "./LogReadingModal";
import { MonthlyTargetModal } from "./MonthlyTargetModal";
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

interface BookshelfTabProps {
  onStartFocus: (book: Book) => void;
}

export const BookshelfTab = memo(function BookshelfTab({ onStartFocus }: BookshelfTabProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const curMonth = getCurrentYearMonth();

  const {
    state,
    addBook,
    updateBook,
    deleteBook,
    archiveBook,
    restoreBook,
    logReadingProgress,
    startNewReadingCycle,
    addBookNote,
    deleteBookNote,
    setMonthlyReadingTarget,
  } = useApp();

  const books: Book[] = state.books || [];
  const monthlyReadingTarget = state.monthlyReadingTarget;
  const goals = state.goals || [];
  const habits = state.habits || [];

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");

  // Modals state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [loggingBook, setLoggingBook] = useState<Book | null>(null);
  const [targetModalOpen, setTargetModalOpen] = useState(false);

  // Statistics
  const stats = useMemo(() => calculateBookshelfStats(books, curMonth), [books, curMonth]);

  // Target Progress
  const targetProgress = useMemo(
    () => calculateMonthlyTargetProgress(books, monthlyReadingTarget, curMonth),
    [books, monthlyReadingTarget, curMonth]
  );

  // Filtered Books
  const displayedBooks = useMemo(
    () =>
      filterAndSortBooks(books, {
        search: searchQuery,
        status: statusFilter,
        format: formatFilter,
        sortBy: "recent",
      }),
    [books, searchQuery, statusFilter, formatFilter]
  );

  // Synchronize selectedBook if books change
  const currentDetailBook = useMemo(() => {
    if (!selectedBook) return null;
    return books.find((b) => b.id === selectedBook.id) || selectedBook;
  }, [selectedBook, books]);

  // All active goals & habits for explicit linking
  const goalOptions = useMemo(
    () => goals.filter((g) => g.status === "active").map((g) => ({ id: g.id, title: g.title })),
    [goals]
  );

  const habitOptions = useMemo(
    () => habits.filter((h) => h.status === "active").map((h) => ({ id: h.id, name: h.title || "" })),
    [habits]
  );

  const statusPills: { key: string; labelEn: string; labelAr: string; count: number }[] = [
    { key: "all", labelEn: "All", labelAr: "الكل", count: stats.totalBooks },
    { key: "reading", labelEn: "Reading", labelAr: "أقرأ الآن", count: stats.readingCount },
    { key: "want_to_read", labelEn: "Want to Read", labelAr: "أريد قراءته", count: stats.wantToReadCount },
    { key: "finished", labelEn: "Finished", labelAr: "مكتمل", count: stats.finishedCount },
    { key: "paused", labelEn: "Paused", labelAr: "متوقفة مؤقتًا", count: stats.pausedCount },
    { key: "stopped", labelEn: "Stopped", labelAr: "توقفت عن قراءته", count: stats.stoppedCount },
  ];

  return (
    <div className="space-y-4">
      {/* ── Subtitle / Visual Introduction ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-[#FFF5F6] via-[#FFF9F6] to-[#FDF6F0] border border-[#F2E5E3] shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-base text-[#3D1E28] flex items-center gap-2">
            <span>{t("bookshelfTitle")}</span>
          </h2>
          <p className="text-xs text-[#7A5B64] mt-0.5">{t("bookshelfSubtitle")}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-white/80 rounded-xl border border-[#F2E5E3]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-[#FFE4E8] text-[#9D174D] shadow-2xs"
                  : "text-[#7A5B64] hover:text-[#3D1E28]"
              }`}
              title={isAr ? "عرض الغلاف" : "Grid View"}
              aria-label="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-[#FFE4E8] text-[#9D174D] shadow-2xs"
                  : "text-[#7A5B64] hover:text-[#3D1E28]"
              }`}
              title={isAr ? "عرض القائمة" : "List View"}
              aria-label="List View"
            >
              <List size={15} />
            </button>
          </div>

          {/* Add Book Button */}
          <button
            type="button"
            onClick={() => {
              setEditingBook(null);
              setAddEditModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>{isAr ? "+ كتاب جديد" : "+ Add Book"}</span>
          </button>
        </div>
      </div>

      {/* ── Monthly Reading Intention Card ── */}
      <div className="p-3.5 rounded-2xl bg-white/90 border border-[#F2E5E3] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-50 text-rose-700">
              <Target size={15} />
            </span>
            <div>
              <span className="text-xs font-bold text-[#3D1E28] block leading-tight">
                {isAr ? "نية الشهر القرائية" : "Monthly Reading Intention"}
              </span>
              <span className="text-[11px] text-[#7A5B64]">
                {monthlyReadingTarget && monthlyReadingTarget.yearMonth === curMonth
                  ? isAr
                    ? targetProgress.isCompleted
                      ? "أتممتِ نيتكِ القرائية لهذا الشهر بنجاح! 🌸"
                      : `حققتِ ${targetProgress.current} من ${targetProgress.target} ${
                          targetProgress.type === "books"
                            ? "كتب"
                            : targetProgress.type === "pages"
                            ? "صفحة"
                            : "دقيقة"
                        }`
                    : targetProgress.isCompleted
                    ? "Completed your monthly intention! 🌸"
                    : `${targetProgress.current} / ${targetProgress.target} ${targetProgress.type} accomplished`
                  : isAr
                  ? "حددي نية خفيفة للشهر تعينكِ على الاستمرار."
                  : "Set a gentle intention for this month."}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTargetModalOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-[#FFF2F4] text-[#E87A90] text-xs font-semibold hover:bg-[#FFE4E8] active:scale-95 transition-all border border-[#FCD7DE]"
          >
            {monthlyReadingTarget && monthlyReadingTarget.yearMonth === curMonth
              ? isAr
                ? "تعديل"
                : "Edit"
              : isAr
              ? "+ تحديد النية"
              : "+ Set Target"}
          </button>
        </div>

        {monthlyReadingTarget && monthlyReadingTarget.yearMonth === curMonth && (
          <div className="w-full h-2 rounded-full bg-[#F3EBE9] overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                targetProgress.isCompleted
                  ? "bg-[#10B981]"
                  : "bg-gradient-to-r from-[#F472B6] to-[#FB7185]"
              }`}
              style={{ width: `${targetProgress.percent}%` }}
            />
          </div>
        )}
      </div>

      {/* ── Statistics Summary Strip ── */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 rounded-2xl bg-white/80 border border-[#F2E5E3] shadow-xs">
          <span className="block font-serif font-bold text-sm text-[#9D174D]">
            {stats.readingCount}
          </span>
          <span className="text-[10px] text-[#7A5B64] font-medium leading-tight">
            {isAr ? "أقرأ الآن" : "Reading"}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/80 border border-[#F2E5E3] shadow-xs">
          <span className="block font-serif font-bold text-sm text-emerald-700">
            {stats.finishedCount}
          </span>
          <span className="text-[10px] text-[#7A5B64] font-medium leading-tight">
            {isAr ? "مكتمل" : "Finished"}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/80 border border-[#F2E5E3] shadow-xs">
          <span className="block font-serif font-bold text-sm text-[#3D1E28]">
            {stats.allTimePages}
          </span>
          <span className="text-[10px] text-[#7A5B64] font-medium leading-tight">
            {isAr ? "صفحة موثقة" : "Pages"}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/80 border border-[#F2E5E3] shadow-xs">
          <span className="block font-serif font-bold text-sm text-[#3D1E28]">
            {Math.round(stats.allTimeMinutes / 60)}h
          </span>
          <span className="text-[10px] text-[#7A5B64] font-medium leading-tight">
            {isAr ? "وقت القراءة" : "Read Time"}
          </span>
        </div>
      </div>

      {/* ── Search Bar & Status Filter Pills ── */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={14} className="absolute top-3 start-3 text-[#A89297]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr ? "ابحثي عن كتاب أو كاتب أو تصنيف..." : "Search books, authors, or genres..."
            }
            className="w-full ps-9 pe-4 py-2 rounded-2xl bg-white/90 border border-[#F2E5E3] text-xs text-[#3D1E28] placeholder-[#A89297] focus:outline-none focus:ring-2 focus:ring-[#E87A90]/40"
          />
        </div>

        {/* Filter Pills scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusPills.map((pill) => {
            const isSelected = statusFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? "bg-[#FFF0F3] border border-[#E87A90] text-[#9D174D] shadow-xs"
                    : "bg-white/80 border border-[#F2E5E3] text-[#7A5B64] hover:bg-rose-50/50"
                }`}
              >
                <span>{isAr ? pill.labelAr : pill.labelEn}</span>
                <span className="ms-1 text-[10px] opacity-75">({pill.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Book Cards Grid or List ── */}
      {displayedBooks.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayedBooks.map((b) => (
              <BookCard
                key={b.id}
                book={b}
                viewMode="grid"
                onClick={(book) => setSelectedBook(book)}
                onQuickLog={(book) => setLoggingBook(book)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedBooks.map((b) => (
              <BookCard
                key={b.id}
                book={b}
                viewMode="list"
                onClick={(book) => setSelectedBook(book)}
                onQuickLog={(book) => setLoggingBook(book)}
              />
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-6 rounded-3xl bg-white/60 border border-dashed border-[#F2E5E3]">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-50 flex items-center justify-center text-[#E87A90]">
            <BookOpen size={28} />
          </div>
          <h3 className="font-serif font-bold text-sm text-[#3D1E28] mb-1">
            {t("bookshelfEmptyTitle")}
          </h3>
          <p className="text-xs text-[#7A5B64] max-w-xs mx-auto mb-4">
            {t("bookshelfEmptySub")}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingBook(null);
              setAddEditModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>{isAr ? "+ أضيفي أول كتاب" : "+ Add your first book"}</span>
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      <AddEditBookModal
        open={addEditModalOpen}
        editingBook={editingBook}
        existingBooks={books}
        onClose={() => {
          setAddEditModalOpen(false);
          setEditingBook(null);
        }}
        onSave={(data) => {
          if (editingBook) {
            updateBook(editingBook.id, data);
          } else {
            addBook(data);
          }
        }}
      />

      <BookDetailModal
        book={currentDetailBook}
        open={Boolean(currentDetailBook)}
        onClose={() => setSelectedBook(null)}
        onEdit={(b) => {
          setSelectedBook(null);
          setEditingBook(b);
          setAddEditModalOpen(true);
        }}
        onOpenLog={(b) => setLoggingBook(b)}
        onStartFocus={(b) => {
          setSelectedBook(null);
          onStartFocus(b);
        }}
        onStartReread={(id) => startNewReadingCycle(id)}
        onAddNote={(id, note) => addBookNote(id, note)}
        onDeleteNote={(id, noteId) => deleteBookNote(id, noteId)}
        onUpdateStatus={(id, status) => updateBook(id, { status })}
        onSetRating={(id, rating, review) => updateBook(id, { rating, review })}
        onDeleteBook={(id) => deleteBook(id)}
        onArchiveBook={(id) => (currentDetailBook?.isArchived ? restoreBook(id) : archiveBook(id))}
        allGoals={goalOptions}
        allHabits={habitOptions}
        onLinkGoalHabit={(id, goalId, habitId) =>
          updateBook(id, { linkedGoalId: goalId, linkedHabitId: habitId })
        }
      />

      <LogReadingModal
        book={loggingBook}
        open={Boolean(loggingBook)}
        onClose={() => setLoggingBook(null)}
        onSaveLog={(id, params) => logReadingProgress(id, params)}
      />

      <MonthlyTargetModal
        open={targetModalOpen}
        currentTarget={monthlyReadingTarget}
        onClose={() => setTargetModalOpen(false)}
        onSave={(t) => setMonthlyReadingTarget(t)}
      />
    </div>
  );
});
