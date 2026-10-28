import { memo } from "react";
import { type Book, calculateBookProgress } from "@/lib/bookshelfEngine";
import { useLang } from "@/lib/i18n";
import { BookCover } from "./BookCover";
import { Star, RotateCcw, Plus, Check } from "lucide-react";

interface BookCardProps {
  book: Book;
  viewMode?: "grid" | "list";
  onClick: (book: Book) => void;
  onQuickLog?: (book: Book) => void;
}

export const BookCard = memo(function BookCard({
  book,
  viewMode = "grid",
  onClick,
  onQuickLog,
}: BookCardProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const progressInfo = calculateBookProgress(book);

  const statusConfig: Record<
    string,
    { labelEn: string; labelAr: string; bg: string; text: string; dot: string }
  > = {
    want_to_read: {
      labelEn: "Want to Read",
      labelAr: "أريد قراءته",
      bg: "bg-[#F3EFEA]",
      text: "text-[#6B5A55]",
      dot: "bg-[#B0A29C]",
    },
    reading: {
      labelEn: "Reading",
      labelAr: "أقرأ الآن",
      bg: "bg-[#FCE7F3]",
      text: "text-[#9D174D]",
      dot: "bg-[#EC4899]",
    },
    finished: {
      labelEn: "Finished",
      labelAr: "مكتمل",
      bg: "bg-[#ECFDF5]",
      text: "text-[#065F46]",
      dot: "bg-[#10B981]",
    },
    paused: {
      labelEn: "Paused",
      labelAr: "متوقفة مؤقتًا",
      bg: "bg-[#FEF3C7]",
      text: "text-[#92400E]",
      dot: "bg-[#F59E0B]",
    },
    stopped: {
      labelEn: "Stopped",
      labelAr: "توقفت عن قراءته",
      bg: "bg-[#F1F5F9]",
      text: "text-[#475569]",
      dot: "bg-[#94A3B8]",
    },
  };

  const status = statusConfig[book.status] || statusConfig.want_to_read;
  const statusLabel = isAr ? status.labelAr : status.labelEn;
  const progressLabel = isAr ? progressInfo.labelAr : progressInfo.labelEn;

  // Grid view (Cover card format)
  if (viewMode === "grid") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick(book)}
        onKeyDown={(e) => e.key === "Enter" && onClick(book)}
        className="group text-start flex flex-col bg-white/90 backdrop-blur-xs rounded-2xl p-2.5 border border-[#F2E5E3] shadow-xs hover:shadow-md hover:border-[#E8B4B8] active:scale-[0.98] transition-all cursor-pointer"
      >
        {/* Cover with hover subtle lift */}
        <div className="relative mb-2.5 rounded-xl overflow-hidden shadow-xs group-hover:shadow-sm transition-shadow">
          <BookCover book={book} size="md" />

          {/* Reread cycle badge */}
          {book.currentCycle > 1 && (
            <div className="absolute bottom-2 end-2 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[#831843] text-[9px] font-bold flex items-center gap-0.5 shadow-xs border border-rose-200">
              <RotateCcw size={9} />
              <span>{isAr ? `قراءة ${book.currentCycle}` : `#${book.currentCycle}`}</span>
            </div>
          )}
        </div>

        {/* Book Title & Author */}
        <h3 className="font-serif font-bold text-xs leading-snug text-[#3D1E28] line-clamp-2 mb-0.5">
          {book.title}
        </h3>
        {book.author ? (
          <p className="text-[11px] text-[#7A5B64] truncate mb-2">{book.author}</p>
        ) : (
          <div className="mb-2" />
        )}

        {/* Status Pill & Rating */}
        <div className="mt-auto flex items-center justify-between gap-1 text-[10px] mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${status.bg} ${status.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span className="truncate">{statusLabel}</span>
          </span>

          {book.rating ? (
            <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span>{book.rating}</span>
            </span>
          ) : null}
        </div>

        {/* Progress Bar (Truthful - Only if total is known, or manual percentage exists) */}
        {progressInfo.percent !== undefined ? (
          <div>
            <div className="flex items-center justify-between text-[10px] font-medium text-[#7A5B64] mb-1">
              <span className="truncate">{progressLabel}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F3EBE9] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progressInfo.isFinished
                    ? "bg-[#10B981]"
                    : "bg-gradient-to-r from-[#F472B6] to-[#FB7185]"
                }`}
                style={{ width: `${progressInfo.percent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-[10px] font-medium text-[#7A5B64] bg-[#FDF6F0] px-2 py-1 rounded-lg border border-[#F2E5E3] text-center truncate">
            {progressLabel}
          </div>
        )}
      </div>
    );
  }

  // Compact List view
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(book)}
      onKeyDown={(e) => e.key === "Enter" && onClick(book)}
      className="group text-start flex items-center gap-3 bg-white/90 backdrop-blur-xs rounded-2xl p-2.5 border border-[#F2E5E3] shadow-xs hover:border-[#E8B4B8] active:scale-[0.99] transition-all cursor-pointer"
    >
      {/* Mini Cover Thumbnail */}
      <div className="shrink-0">
        <BookCover book={book} size="sm" />
      </div>

      {/* Middle details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="font-serif font-bold text-xs text-[#3D1E28] truncate">{book.title}</h3>
          {book.currentCycle > 1 && (
            <span className="px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-700 text-[9px] font-bold border border-rose-200">
              {isAr ? `قراءة ${book.currentCycle}` : `#${book.currentCycle}`}
            </span>
          )}
        </div>

        {book.author && (
          <p className="text-[11px] text-[#7A5B64] truncate mb-1">{book.author}</p>
        )}

        <div className="flex items-center gap-2 text-[10px]">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-semibold ${status.bg} ${status.text}`}
          >
            <span className={`w-1 h-1 rounded-full ${status.dot}`} />
            <span>{statusLabel}</span>
          </span>

          <span className="text-[#8B6E76] font-medium truncate">{progressLabel}</span>

          {book.rating ? (
            <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold ms-auto">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span>{book.rating}</span>
            </span>
          ) : null}
        </div>

        {progressInfo.percent !== undefined && (
          <div className="w-full h-1 rounded-full bg-[#F3EBE9] overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressInfo.isFinished
                  ? "bg-[#10B981]"
                  : "bg-gradient-to-r from-[#F472B6] to-[#FB7185]"
              }`}
              style={{ width: `${progressInfo.percent}%` }}
            />
          </div>
        )}
      </div>

      {/* Quick Log Action */}
      {onQuickLog && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickLog(book);
          }}
          aria-label={isAr ? "تسجيل قراءة" : "Log reading"}
          className="shrink-0 p-2 rounded-xl bg-[#FFF2F4] text-[#E87A90] hover:bg-[#FFE4E8] active:scale-95 transition-all border border-[#FCD7DE]"
        >
          {book.status === "finished" ? <Check size={15} /> : <Plus size={15} />}
        </button>
      )}
    </div>
  );
});
