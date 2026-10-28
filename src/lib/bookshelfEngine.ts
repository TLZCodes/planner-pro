/**
 * AYXA My Bookshelf Engine (مكتبتي 📚)
 *
 * Domain models, progress derivations, reading cycles, logs, notes/quotes,
 * monthly reading targets, and statistics for the AYXA Learning Bookshelf.
 *
 * Design rules:
 * - Feminine pastel planner identity with book covers as main visual content.
 * - Formats: Print, Ebook, Audiobook with truthful progress metrics.
 * - No fake percentages for unknown totals (never display 0% if total is unknown).
 * - Reading cycles allow rereading without wiping historical reading logs.
 * - Strictly 0 new Bookshelf XP. Focus session XP remains centralized and idempotent.
 * - Full bilingual support (English & Arabic RTL with feminine phrasing).
 */

export type BookFormat = "print" | "ebook" | "audiobook";

export type ReadingStatus = "want_to_read" | "reading" | "finished" | "paused" | "stopped";

export interface BookNote {
  id: string;
  bookId: string;
  type: "note" | "quote";
  content: string;
  pageOrLocation?: string; // e.g. "p. 142" or "Ch. 4, 12:40"
  createdAt: string;
}

export interface ReadingLogEntry {
  id: string;
  bookId: string;
  cycleNumber: number;
  localDate: string; // YYYY-MM-DD (strictly no future dates)
  pagesRead?: number; // delta
  minutesListened?: number; // delta
  endPage?: number; // absolute position after log
  endMinutes?: number; // absolute listening position after log
  endPercentage?: number; // absolute percentage after log
  durationMinutes?: number; // time spent in this session
  notes?: string;
  focusSessionId?: string;
  createdAt: string;
}

export interface ReadingCycle {
  cycleNumber: number;
  startDate: string;
  completedDate?: string;
  status: ReadingStatus;
  endPage?: number;
  endMinutes?: number;
  notes?: string;
}

export interface Book {
  id: string;
  title: string;
  titleAr?: string;
  author?: string;
  totalPages?: number;
  currentPage?: number;
  coverEmoji?: string;
  coverImage?: string; // data URL or URL
  edition?: string;
  isbn?: string;
  format: BookFormat;
  status: ReadingStatus;
  currentMinutes?: number; // For audiobook position
  totalMinutes?: number; // For audiobook total duration
  manualPercentage?: number; // For books without known page totals
  genre?: string;
  tags?: string[];
  description?: string;
  rating?: number; // 1-5 stars optional
  review?: string;
  linkedGoalId?: string;
  linkedHabitId?: string;
  currentCycle: number;
  cycles?: ReadingCycle[];
  logs?: ReadingLogEntry[];
  notes?: BookNote[];
  isArchived?: boolean;
  addedDate: string;
  startedDate?: string;
  finishedDate?: string;
  updatedAt?: string;
}

export interface MonthlyReadingTarget {
  yearMonth: string; // YYYY-MM
  type: "books" | "pages" | "minutes";
  targetValue: number;
}

export interface BookshelfStats {
  totalBooks: number;
  readingCount: number;
  wantToReadCount: number;
  finishedCount: number;
  pausedCount: number;
  stoppedCount: number;
  finishedThisMonth: number;
  pagesThisMonth: number;
  minutesThisMonth: number;
  allTimePages: number;
  allTimeMinutes: number;
}

/**
 * Unique ID generator for bookshelf items
 */
export function generateBookshelfId(prefix = "book"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Get today's local date string YYYY-MM-DD
 */
export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get current year-month string YYYY-MM
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Format minutes into readable "1h 30m" or Arabic "1 س 30 د"
 */
export function formatReadingDuration(minutes: number, isAr = false): string {
  const safeMin = Math.max(0, Math.round(minutes || 0));
  const hrs = Math.floor(safeMin / 60);
  const remMins = safeMin % 60;

  if (isAr) {
    if (hrs > 0 && remMins > 0) return `${hrs} س ${remMins} د`;
    if (hrs > 0) return `${hrs} س`;
    return `${remMins} د`;
  }

  if (hrs > 0 && remMins > 0) return `${hrs}h ${remMins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${remMins}m`;
}

/**
 * Aesthetic Pastel Palettes for generated title-based book covers
 */
export const COVER_PALETTES = [
  {
    gradient: "from-[#FFE4E6] via-[#FFF1F2] to-[#FED7AA]",
    accentColor: "#E11D48",
    textColor: "#881337",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    ribbonColor: "#FB7185",
  },
  {
    gradient: "from-[#EDE9FE] via-[#F5F3FF] to-[#FCE7F3]",
    accentColor: "#9333EA",
    textColor: "#581C87",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
    ribbonColor: "#C084FC",
  },
  {
    gradient: "from-[#D1FAE5] via-[#ECFDF5] to-[#E0E7FF]",
    accentColor: "#059669",
    textColor: "#064E3B",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ribbonColor: "#34D399",
  },
  {
    gradient: "from-[#FEF3C7] via-[#FFFBEB] to-[#FED7AA]",
    accentColor: "#D97706",
    textColor: "#78350F",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    ribbonColor: "#FBBF24",
  },
  {
    gradient: "from-[#E0F2FE] via-[#F0F9FF] to-[#EDE9FE]",
    accentColor: "#2563EB",
    textColor: "#1E3A8A",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    ribbonColor: "#60A5FA",
  },
  {
    gradient: "from-[#FFEDD5] via-[#FFF7ED] to-[#FFE4E6]",
    accentColor: "#EA580C",
    textColor: "#9A3412",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    ribbonColor: "#FB923C",
  },
];

/**
 * Deterministically pick cover style from title
 */
export function getCoverPalette(title = ""): (typeof COVER_PALETTES)[number] {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COVER_PALETTES.length;
  return COVER_PALETTES[index];
}

/**
 * Normalize and upgrade a Book record from legacy or user input
 */
export function normalizeBook(raw: any, fallbackId?: string): Book {
  const id = raw?.id || fallbackId || generateBookshelfId();
  const title = (raw?.title || "Untitled Book").trim();
  const author = raw?.author ? String(raw.author).trim() : undefined;
  const addedDate = raw?.addedDate || getTodayKey();

  // Format
  const format: BookFormat =
    raw?.format === "audiobook" || raw?.format === "ebook" || raw?.format === "print"
      ? raw.format
      : "print";

  // Total & current metrics
  const totalPages = typeof raw?.totalPages === "number" && raw.totalPages > 0 ? raw.totalPages : undefined;
  const currentPage = typeof raw?.currentPage === "number" ? Math.max(0, raw.currentPage) : undefined;
  const totalMinutes = typeof raw?.totalMinutes === "number" && raw.totalMinutes > 0 ? raw.totalMinutes : undefined;
  const currentMinutes = typeof raw?.currentMinutes === "number" ? Math.max(0, raw.currentMinutes) : undefined;
  const manualPercentage =
    typeof raw?.manualPercentage === "number"
      ? Math.min(100, Math.max(0, Math.round(raw.manualPercentage)))
      : undefined;

  // Status migration / defaults
  let status: ReadingStatus = "want_to_read";
  if (raw?.status && ["want_to_read", "reading", "finished", "paused", "stopped"].includes(raw.status)) {
    status = raw.status;
  } else if (totalPages && currentPage !== undefined && currentPage >= totalPages) {
    status = "finished";
  } else if (totalMinutes && currentMinutes !== undefined && currentMinutes >= totalMinutes) {
    status = "finished";
  } else if ((currentPage && currentPage > 0) || (currentMinutes && currentMinutes > 0) || (manualPercentage && manualPercentage > 0)) {
    status = "reading";
  }

  // Current cycle
  const currentCycle = typeof raw?.currentCycle === "number" && raw.currentCycle >= 1 ? raw.currentCycle : 1;

  // Cycles array
  let cycles: ReadingCycle[] = [];
  if (Array.isArray(raw?.cycles) && raw.cycles.length > 0) {
    cycles = raw.cycles.map((c: any, idx: number) => ({
      cycleNumber: typeof c?.cycleNumber === "number" ? c.cycleNumber : idx + 1,
      startDate: c?.startDate || addedDate,
      completedDate: c?.completedDate,
      status: c?.status || (c?.completedDate ? "finished" : "reading"),
      endPage: c?.endPage,
      endMinutes: c?.endMinutes,
      notes: c?.notes,
    }));
  } else {
    cycles = [
      {
        cycleNumber: 1,
        startDate: raw?.startedDate || addedDate,
        completedDate: status === "finished" ? (raw?.finishedDate || addedDate) : undefined,
        status,
        endPage: currentPage,
        endMinutes: currentMinutes,
      },
    ];
  }

  // Logs array
  const logs: ReadingLogEntry[] = Array.isArray(raw?.logs)
    ? raw.logs.map((lg: any, idx: number) => ({
        id: lg?.id || `log-${idx}-${Date.now().toString(36)}`,
        bookId: id,
        cycleNumber: typeof lg?.cycleNumber === "number" ? lg.cycleNumber : currentCycle,
        localDate: lg?.localDate || addedDate,
        pagesRead: typeof lg?.pagesRead === "number" ? lg.pagesRead : undefined,
        minutesListened: typeof lg?.minutesListened === "number" ? lg.minutesListened : undefined,
        endPage: typeof lg?.endPage === "number" ? lg.endPage : undefined,
        endMinutes: typeof lg?.endMinutes === "number" ? lg.endMinutes : undefined,
        endPercentage: typeof lg?.endPercentage === "number" ? lg.endPercentage : undefined,
        durationMinutes: typeof lg?.durationMinutes === "number" ? lg.durationMinutes : undefined,
        notes: lg?.notes,
        focusSessionId: lg?.focusSessionId,
        createdAt: lg?.createdAt || new Date().toISOString(),
      }))
    : [];

  // Notes and Quotes
  const notes: BookNote[] = Array.isArray(raw?.notes)
    ? raw.notes.map((n: any, idx: number) => ({
        id: n?.id || `note-${idx}-${Date.now().toString(36)}`,
        bookId: id,
        type: n?.type === "quote" ? "quote" : "note",
        content: String(n?.content || "").trim(),
        pageOrLocation: n?.pageOrLocation ? String(n.pageOrLocation).trim() : undefined,
        createdAt: n?.createdAt || new Date().toISOString(),
      }))
    : [];

  return {
    id,
    title,
    titleAr: raw?.titleAr,
    author,
    totalPages,
    currentPage,
    coverEmoji: raw?.coverEmoji || "📚",
    coverImage: raw?.coverImage,
    edition: raw?.edition,
    isbn: raw?.isbn,
    format,
    status,
    currentMinutes,
    totalMinutes,
    manualPercentage,
    genre: raw?.genre,
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    description: raw?.description,
    rating: typeof raw?.rating === "number" && raw.rating >= 1 && raw.rating <= 5 ? raw.rating : undefined,
    review: raw?.review,
    linkedGoalId: raw?.linkedGoalId,
    linkedHabitId: raw?.linkedHabitId,
    currentCycle,
    cycles,
    logs,
    notes,
    isArchived: Boolean(raw?.isArchived),
    addedDate,
    startedDate: raw?.startedDate || (status === "reading" ? addedDate : undefined),
    finishedDate: raw?.finishedDate || (status === "finished" ? addedDate : undefined),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
}

/**
 * Truthful progress calculation without fake percentages
 */
export function calculateBookProgress(book: Book): {
  percent?: number;
  labelEn: string;
  labelAr: string;
  hasTotal: boolean;
  isFinished: boolean;
} {
  const isFinished = book.status === "finished";

  if (book.format === "audiobook") {
    const curMin = book.currentMinutes || 0;
    const totMin = book.totalMinutes;

    if (totMin && totMin > 0) {
      const pct = Math.min(100, Math.max(0, Math.round((curMin / totMin) * 100)));
      return {
        percent: pct,
        labelEn: `${formatReadingDuration(curMin, false)} / ${formatReadingDuration(totMin, false)} (${pct}%)`,
        labelAr: `${formatReadingDuration(curMin, true)} / ${formatReadingDuration(totMin, true)} (${pct}%)`,
        hasTotal: true,
        isFinished,
      };
    }

    if (curMin > 0) {
      return {
        percent: undefined,
        labelEn: `${formatReadingDuration(curMin, false)} listened`,
        labelAr: `${formatReadingDuration(curMin, true)} استماع`,
        hasTotal: false,
        isFinished,
      };
    }

    return {
      percent: undefined,
      labelEn: isFinished ? "Completed" : "Not listened yet",
      labelAr: isFinished ? "مكتمل" : "لم يبدأ بعد",
      hasTotal: false,
      isFinished,
    };
  }

  // Print or Ebook
  const curPage = book.currentPage || 0;
  const totPage = book.totalPages;

  if (totPage && totPage > 0) {
    const pct = Math.min(100, Math.max(0, Math.round((curPage / totPage) * 100)));
    return {
      percent: pct,
      labelEn: `p. ${curPage} / ${totPage} (${pct}%)`,
      labelAr: `ص ${curPage} من ${totPage} (${pct}%)`,
      hasTotal: true,
      isFinished,
    };
  }

  // Unknown total pages
  if (book.manualPercentage !== undefined) {
    return {
      percent: book.manualPercentage,
      labelEn: curPage > 0 ? `p. ${curPage} (${book.manualPercentage}%)` : `${book.manualPercentage}%`,
      labelAr: curPage > 0 ? `ص ${curPage} (${book.manualPercentage}%)` : `${book.manualPercentage}%`,
      hasTotal: false,
      isFinished,
    };
  }

  if (curPage > 0) {
    return {
      percent: undefined,
      labelEn: `p. ${curPage}`,
      labelAr: `ص ${curPage}`,
      hasTotal: false,
      isFinished,
    };
  }

  return {
    percent: undefined,
    labelEn: isFinished ? "Completed" : "Not started yet",
    labelAr: isFinished ? "مكتمل" : "لم تبدأ بعد",
    hasTotal: false,
    isFinished,
  };
}

/**
 * Detect possible duplicate book title/author
 */
export function detectDuplicateBook(
  newTitle: string,
  newAuthor: string | undefined,
  books: Book[],
  currentBookId?: string
): Book | null {
  const normTitle = (newTitle || "").toLowerCase().trim();
  const normAuthor = (newAuthor || "").toLowerCase().trim();

  if (!normTitle) return null;

  for (const b of books) {
    if (currentBookId && b.id === currentBookId) continue;
    if (b.isArchived) continue;

    const bTitle = (b.title || "").toLowerCase().trim();
    const bAuthor = (b.author || "").toLowerCase().trim();

    if (bTitle === normTitle) {
      if (!normAuthor || !bAuthor || normAuthor === bAuthor) {
        return b;
      }
    }
  }

  return null;
}

/**
 * Log reading progress with strict validation (no future dates)
 */
export function logReadingSession(
  book: Book,
  params: {
    localDate: string;
    pagesRead?: number;
    newPage?: number;
    minutesListened?: number;
    newMinutes?: number;
    percentage?: number;
    durationMinutes?: number;
    notes?: string;
    focusSessionId?: string;
  }
): Book {
  const today = getTodayKey();
  const targetDate = params.localDate > today ? today : params.localDate;

  const isAudio = book.format === "audiobook";
  let finalPage = book.currentPage;
  let deltaPages = params.pagesRead;

  let finalMinutes = book.currentMinutes;
  let deltaMinutes = params.minutesListened;

  let finalPercentage = book.manualPercentage;

  if (isAudio) {
    if (params.newMinutes !== undefined) {
      const safeNew = Math.max(0, params.newMinutes);
      deltaMinutes = safeNew - (book.currentMinutes || 0);
      finalMinutes = safeNew;
    } else if (params.minutesListened !== undefined) {
      deltaMinutes = params.minutesListened;
      finalMinutes = Math.max(0, (book.currentMinutes || 0) + params.minutesListened);
    }

    if (book.totalMinutes && finalMinutes !== undefined) {
      finalMinutes = Math.min(book.totalMinutes, finalMinutes);
    }
  } else {
    // Print or Ebook
    if (params.newPage !== undefined) {
      const safeNew = Math.max(0, params.newPage);
      deltaPages = safeNew - (book.currentPage || 0);
      finalPage = safeNew;
    } else if (params.pagesRead !== undefined) {
      deltaPages = params.pagesRead;
      finalPage = Math.max(0, (book.currentPage || 0) + params.pagesRead);
    }

    if (book.totalPages && finalPage !== undefined) {
      finalPage = Math.min(book.totalPages, finalPage);
    }

    if (params.percentage !== undefined) {
      finalPercentage = Math.min(100, Math.max(0, Math.round(params.percentage)));
    }
  }

  // Check if completed
  let nextStatus = book.status;
  let finishedDate = book.finishedDate;
  if (
    (book.totalPages && finalPage !== undefined && finalPage >= book.totalPages) ||
    (book.totalMinutes && finalMinutes !== undefined && finalMinutes >= book.totalMinutes) ||
    (finalPercentage !== undefined && finalPercentage >= 100)
  ) {
    nextStatus = "finished";
    if (!finishedDate) finishedDate = targetDate;
  } else if (book.status === "want_to_read" || book.status === "paused") {
    nextStatus = "reading";
  }

  const newLog: ReadingLogEntry = {
    id: generateBookshelfId("log"),
    bookId: book.id,
    cycleNumber: book.currentCycle || 1,
    localDate: targetDate,
    pagesRead: deltaPages,
    minutesListened: deltaMinutes,
    endPage: finalPage,
    endMinutes: finalMinutes,
    endPercentage: finalPercentage,
    durationMinutes: params.durationMinutes,
    notes: params.notes ? params.notes.trim() : undefined,
    focusSessionId: params.focusSessionId,
    createdAt: new Date().toISOString(),
  };

  const updatedLogs = [newLog, ...(book.logs || [])];

  // Update current cycle record
  const cycles = (book.cycles || []).map((c) => {
    if (c.cycleNumber === (book.currentCycle || 1)) {
      return {
        ...c,
        status: nextStatus,
        endPage: finalPage,
        endMinutes: finalMinutes,
        completedDate: nextStatus === "finished" ? (c.completedDate || targetDate) : c.completedDate,
      };
    }
    return c;
  });

  return {
    ...book,
    currentPage: finalPage,
    currentMinutes: finalMinutes,
    manualPercentage: finalPercentage,
    status: nextStatus,
    finishedDate,
    cycles,
    logs: updatedLogs,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Start a new reading cycle (rereading) without wiping previous logs
 */
export function startNewReadingCycle(book: Book, startDate?: string): Book {
  const nextCycleNum = (book.currentCycle || 1) + 1;
  const start = startDate || getTodayKey();

  const newCycle: ReadingCycle = {
    cycleNumber: nextCycleNum,
    startDate: start,
    status: "reading",
    endPage: 0,
    endMinutes: 0,
  };

  return {
    ...book,
    currentCycle: nextCycleNum,
    status: "reading",
    currentPage: 0,
    currentMinutes: 0,
    manualPercentage: 0,
    startedDate: start,
    finishedDate: undefined,
    cycles: [...(book.cycles || []), newCycle],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add a personal note or quote to a book
 */
export function addBookNote(
  book: Book,
  note: { type: "note" | "quote"; content: string; pageOrLocation?: string }
): Book {
  const newNote: BookNote = {
    id: generateBookshelfId("note"),
    bookId: book.id,
    type: note.type,
    content: note.content.trim(),
    pageOrLocation: note.pageOrLocation ? note.pageOrLocation.trim() : undefined,
    createdAt: new Date().toISOString(),
  };

  return {
    ...book,
    notes: [newNote, ...(book.notes || [])],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Delete a personal note or quote from a book
 */
export function deleteBookNote(book: Book, noteId: string): Book {
  return {
    ...book,
    notes: (book.notes || []).filter((n) => n.id !== noteId),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate Bookshelf reading statistics
 */
export function calculateBookshelfStats(books: Book[], yearMonth = getCurrentYearMonth()): BookshelfStats {
  const activeBooks = books.filter((b) => !b.isArchived);

  let readingCount = 0;
  let wantToReadCount = 0;
  let finishedCount = 0;
  let pausedCount = 0;
  let stoppedCount = 0;
  let finishedThisMonth = 0;

  let pagesThisMonth = 0;
  let minutesThisMonth = 0;
  let allTimePages = 0;
  let allTimeMinutes = 0;

  for (const b of activeBooks) {
    if (b.status === "reading") readingCount++;
    else if (b.status === "want_to_read") wantToReadCount++;
    else if (b.status === "finished") finishedCount++;
    else if (b.status === "paused") pausedCount++;
    else if (b.status === "stopped") stoppedCount++;

    // Finished this month check
    if (b.status === "finished" && b.finishedDate && b.finishedDate.startsWith(yearMonth)) {
      finishedThisMonth++;
    }

    // Tally logs
    if (Array.isArray(b.logs)) {
      for (const lg of b.logs) {
        const isThisMonth = lg.localDate && lg.localDate.startsWith(yearMonth);

        if (typeof lg.pagesRead === "number" && lg.pagesRead > 0) {
          allTimePages += lg.pagesRead;
          if (isThisMonth) pagesThisMonth += lg.pagesRead;
        }

        if (typeof lg.minutesListened === "number" && lg.minutesListened > 0) {
          allTimeMinutes += lg.minutesListened;
          if (isThisMonth) minutesThisMonth += lg.minutesListened;
        }

        if (typeof lg.durationMinutes === "number" && lg.durationMinutes > 0 && (!lg.minutesListened || lg.minutesListened === 0)) {
          allTimeMinutes += lg.durationMinutes;
          if (isThisMonth) minutesThisMonth += lg.durationMinutes;
        }
      }
    }
  }

  return {
    totalBooks: activeBooks.length,
    readingCount,
    wantToReadCount,
    finishedCount,
    pausedCount,
    stoppedCount,
    finishedThisMonth,
    pagesThisMonth,
    minutesThisMonth,
    allTimePages,
    allTimeMinutes,
  };
}

/**
 * Calculate monthly reading target progress
 */
export function calculateMonthlyTargetProgress(
  books: Book[],
  target: MonthlyReadingTarget | undefined,
  currentYearMonth = getCurrentYearMonth()
): {
  current: number;
  target: number;
  percent: number;
  isCompleted: boolean;
  type: "books" | "pages" | "minutes";
} {
  if (!target || target.yearMonth !== currentYearMonth || target.targetValue <= 0) {
    return {
      current: 0,
      target: 0,
      percent: 0,
      isCompleted: false,
      type: "books",
    };
  }

  const stats = calculateBookshelfStats(books, currentYearMonth);
  let current = 0;

  if (target.type === "books") {
    current = stats.finishedThisMonth;
  } else if (target.type === "pages") {
    current = stats.pagesThisMonth;
  } else if (target.type === "minutes") {
    current = stats.minutesThisMonth;
  }

  const percent = Math.min(100, Math.round((current / target.targetValue) * 100));

  return {
    current,
    target: target.targetValue,
    percent,
    isCompleted: current >= target.targetValue,
    type: target.type,
  };
}

/**
 * Filter and sort books for Bookshelf view
 */
export function filterAndSortBooks(
  books: Book[],
  options: {
    search?: string;
    status?: string; // "all" | ReadingStatus
    format?: string; // "all" | BookFormat
    sortBy?: "recent" | "title" | "progress" | "rating";
  }
): Book[] {
  let list = books.filter((b) => !b.isArchived);

  // Status filter
  if (options.status && options.status !== "all") {
    list = list.filter((b) => b.status === options.status);
  }

  // Format filter
  if (options.format && options.format !== "all") {
    list = list.filter((b) => b.format === options.format);
  }

  // Search filter
  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter((b) => {
      const matchTitle = (b.title || "").toLowerCase().includes(q);
      const matchTitleAr = (b.titleAr || "").toLowerCase().includes(q);
      const matchAuthor = (b.author || "").toLowerCase().includes(q);
      const matchGenre = (b.genre || "").toLowerCase().includes(q);
      const matchTags = (b.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchTitleAr || matchAuthor || matchGenre || matchTags;
    });
  }

  // Sorting
  const sortBy = options.sortBy || "recent";
  list.sort((a, b) => {
    if (sortBy === "title") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === "progress") {
      const pA = calculateBookProgress(a).percent || 0;
      const pB = calculateBookProgress(b).percent || 0;
      return pB - pA;
    }
    // "recent": updated or added date descending
    const dateA = a.updatedAt || a.addedDate || "";
    const dateB = b.updatedAt || b.addedDate || "";
    return dateB.localeCompare(dateA);
  });

  return list;
}
