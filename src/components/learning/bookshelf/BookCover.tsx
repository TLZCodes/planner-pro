import { memo } from "react";
import { type Book, getCoverPalette, formatReadingDuration } from "@/lib/bookshelfEngine";
import { BookOpen, Smartphone, Headphones } from "lucide-react";

interface BookCoverProps {
  book: Book;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const BookCover = memo(function BookCover({
  book,
  size = "md",
  className = "",
}: BookCoverProps) {
  const palette = getCoverPalette(book.title || "");

  const sizeClasses = {
    sm: "w-12 h-16 text-[9px] rounded-lg",
    md: "w-full aspect-[2/3] min-h-[140px] text-xs rounded-xl",
    lg: "w-28 h-40 text-sm rounded-2xl",
  }[size];

  const formatIcon =
    book.format === "audiobook" ? (
      <Headphones size={size === "sm" ? 10 : 13} className="shrink-0" />
    ) : book.format === "ebook" ? (
      <Smartphone size={size === "sm" ? 10 : 13} className="shrink-0" />
    ) : (
      <BookOpen size={size === "sm" ? 10 : 13} className="shrink-0" />
    );

  if (book.coverImage) {
    return (
      <div
        className={`relative overflow-hidden shadow-md flex items-center justify-center bg-[#FAF5F0] border border-[#F2E5E3] ${sizeClasses} ${className}`}
      >
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Subtle format chip in corner */}
        <div className="absolute top-1.5 start-1.5 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white flex items-center gap-1 shadow-sm">
          {formatIcon}
        </div>
      </div>
    );
  }

  // Tasteful Title-Based Pastel Cover
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${palette.gradient} p-2.5 flex flex-col justify-between shadow-md border border-white/60 select-none ${sizeClasses} ${className}`}
      style={{
        boxShadow: "0 4px 14px rgba(61, 30, 40, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
      }}
    >
      {/* Decorative Book Spine Illusion */}
      <div className="absolute top-0 start-0 bottom-0 w-1.5 bg-black/10 mix-blend-multiply" />
      <div className="absolute top-0 start-1.5 bottom-0 w-0.5 bg-white/40" />

      {/* Top row: Format icon badge & subtle emoji */}
      <div className="flex items-center justify-between z-10 ps-1">
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs border ${palette.badgeBg}`}
        >
          {formatIcon}
          {book.format === "audiobook" && size !== "sm" ? (
            <span className="text-[9px]">Audio</span>
          ) : book.format === "ebook" && size !== "sm" ? (
            <span className="text-[9px]">Ebook</span>
          ) : null}
        </span>
        <span className="text-xs opacity-75">{book.coverEmoji || "🌸"}</span>
      </div>

      {/* Middle: Title & Author in dark plum berry tone */}
      <div className="my-auto text-center px-1 z-10">
        <p
          className={`font-serif font-bold leading-tight line-clamp-3`}
          style={{ color: palette.textColor }}
        >
          {book.title}
        </p>
        {book.author && size !== "sm" && (
          <p
            className="text-[10px] mt-1 font-medium truncate opacity-80"
            style={{ color: palette.textColor }}
          >
            {book.author}
          </p>
        )}
      </div>

      {/* Bottom: Subtle bookmark ribbon / motif */}
      <div className="flex items-center justify-between z-10 ps-1 text-[9px] opacity-75">
        <div
          className="w-4 h-1.5 rounded-full"
          style={{ backgroundColor: palette.ribbonColor }}
        />
        {book.totalPages ? (
          <span className="font-mono text-[9px]" style={{ color: palette.textColor }}>
            {book.totalPages}p
          </span>
        ) : book.totalMinutes ? (
          <span className="font-mono text-[9px]" style={{ color: palette.textColor }}>
            {formatReadingDuration(book.totalMinutes)}
          </span>
        ) : (
          <span className="text-[9px] italic" style={{ color: palette.textColor }}>
            AYXA
          </span>
        )}
      </div>
    </div>
  );
});
