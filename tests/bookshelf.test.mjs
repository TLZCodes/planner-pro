import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeBook,
  calculateBookProgress,
  formatReadingDuration,
  getCoverPalette,
  detectDuplicateBook,
  logReadingSession,
  startNewReadingCycle,
  addBookNote,
  deleteBookNote,
  calculateBookshelfStats,
  calculateMonthlyTargetProgress,
  filterAndSortBooks,
  getTodayKey,
} from "../src/lib/bookshelfEngine.ts";

test("Bookshelf - Normalization & Backward Compatibility", () => {
  // Legacy book normalization
  const legacyBook = {
    id: "leg-1",
    title: "Atomic Habits",
    author: "James Clear",
    totalPages: 340,
    currentPage: 136,
    coverEmoji: "📗",
    addedDate: "2026-09-01",
  };

  const normalized = normalizeBook(legacyBook);
  assert.equal(normalized.id, "leg-1");
  assert.equal(normalized.title, "Atomic Habits");
  assert.equal(normalized.author, "James Clear");
  assert.equal(normalized.format, "print");
  assert.equal(normalized.status, "reading");
  assert.equal(normalized.currentCycle, 1);
  assert.equal(normalized.cycles?.length, 1);
  assert.equal(Array.isArray(normalized.logs), true);
  assert.equal(Array.isArray(normalized.notes), true);

  // Completed book from legacy
  const finishedLegacy = normalizeBook({
    id: "leg-2",
    title: "Deep Work",
    author: "Cal Newport",
    totalPages: 296,
    currentPage: 296,
  });
  assert.equal(finishedLegacy.status, "finished");
});

test("Bookshelf - Truthful Progress Calculation (No Fake Percentages)", () => {
  // 1. Print with known total
  const printWithTotal = normalizeBook({
    title: "The Alchemist",
    totalPages: 200,
    currentPage: 50,
  });
  const prog1 = calculateBookProgress(printWithTotal);
  assert.equal(prog1.percent, 25);
  assert.equal(prog1.hasTotal, true);
  assert.match(prog1.labelEn, /p\. 50 \/ 200 \(25%\)/);

  // 2. Print without known total (never 0%)
  const printWithoutTotal = normalizeBook({
    title: "Rare Manuscript",
    currentPage: 45,
  });
  const prog2 = calculateBookProgress(printWithoutTotal);
  assert.equal(prog2.percent, undefined);
  assert.equal(prog2.hasTotal, false);
  assert.equal(prog2.labelEn, "p. 45");

  // 3. Print with manual percentage (e.g. ebook without page numbers)
  const ebookWithPercent = normalizeBook({
    title: "Digital Minimalism",
    format: "ebook",
    manualPercentage: 60,
    currentPage: 120,
  });
  const prog3 = calculateBookProgress(ebookWithPercent);
  assert.equal(prog3.percent, 60);
  assert.equal(prog3.hasTotal, false);
  assert.match(prog3.labelEn, /p\. 120 \(60%\)/);

  // 4. Audiobook with total duration
  const audiobookWithTotal = normalizeBook({
    title: "Becoming",
    format: "audiobook",
    currentMinutes: 120,
    totalMinutes: 600,
  });
  const prog4 = calculateBookProgress(audiobookWithTotal);
  assert.equal(prog4.percent, 20);
  assert.equal(prog4.hasTotal, true);
  assert.match(prog4.labelEn, /2h \/ 10h \(20%\)/);

  // 5. Audiobook without total duration
  const audiobookWithoutTotal = normalizeBook({
    title: "Audio Lecture",
    format: "audiobook",
    currentMinutes: 45,
  });
  const prog5 = calculateBookProgress(audiobookWithoutTotal);
  assert.equal(prog5.percent, undefined);
  assert.equal(prog5.hasTotal, false);
  assert.equal(prog5.labelEn, "45m listened");
});

test("Bookshelf - Strict Date Validation & Reading Log Updates", () => {
  const book = normalizeBook({
    id: "b-1",
    title: "Sapiens",
    totalPages: 400,
    currentPage: 100,
  });

  // Future date should be clamped to today
  const futureDate = "2099-12-31";
  const updatedBook = logReadingSession(book, {
    localDate: futureDate,
    newPage: 150,
    durationMinutes: 30,
    notes: "Fascinating chapter on the cognitive revolution.",
  });

  assert.equal(updatedBook.currentPage, 150);
  assert.equal(updatedBook.status, "reading");
  assert.equal(updatedBook.logs?.length, 1);
  const log = updatedBook.logs[0];
  assert.equal(log.endPage, 150);
  assert.equal(log.pagesRead, 50);
  assert.equal(log.durationMinutes, 30);
  assert.equal(log.notes, "Fascinating chapter on the cognitive revolution.");
  // Date must be clamped to today or past, not 2099!
  assert.notEqual(log.localDate, "2099-12-31");
  assert.equal(log.localDate, getTodayKey());

  // Completing the book marks it finished
  const finishedBook = logReadingSession(updatedBook, {
    localDate: getTodayKey(),
    newPage: 400,
  });
  assert.equal(finishedBook.currentPage, 400);
  assert.equal(finishedBook.status, "finished");
  assert.equal(Boolean(finishedBook.finishedDate), true);
  assert.equal(finishedBook.logs?.length, 2);
});

test("Bookshelf - Reading Cycles (Rereading Preserves History)", () => {
  const book = normalizeBook({
    id: "b-2",
    title: "The Little Prince",
    totalPages: 100,
    currentPage: 100,
    status: "finished",
    currentCycle: 1,
    finishedDate: "2026-05-01",
    logs: [
      {
        id: "log-1",
        bookId: "b-2",
        cycleNumber: 1,
        localDate: "2026-05-01",
        pagesRead: 100,
        endPage: 100,
        createdAt: "2026-05-01T10:00:00Z",
      },
    ],
  });

  // Start cycle 2 (reread)
  const rereadBook = startNewReadingCycle(book, "2026-10-15");
  assert.equal(rereadBook.currentCycle, 2);
  assert.equal(rereadBook.status, "reading");
  assert.equal(rereadBook.currentPage, 0);
  assert.equal(rereadBook.cycles?.length, 2);
  // Historical logs must still be preserved!
  assert.equal(rereadBook.logs?.length, 1);
  assert.equal(rereadBook.logs[0].cycleNumber, 1);

  // Log progress in cycle 2
  const loggedCycle2 = logReadingSession(rereadBook, {
    localDate: "2026-10-15",
    newPage: 25,
  });
  assert.equal(loggedCycle2.currentPage, 25);
  assert.equal(loggedCycle2.logs?.length, 2);
  assert.equal(loggedCycle2.logs[0].cycleNumber, 2);
  assert.equal(loggedCycle2.logs[1].cycleNumber, 1);
});

test("Bookshelf - Notes and Quotes Management", () => {
  let book = normalizeBook({ id: "b-3", title: "Meditations" });

  // Add quote
  book = addBookNote(book, {
    type: "quote",
    content: "You have power over your mind - not outside events.",
    pageOrLocation: "Book IV, 3",
  });
  assert.equal(book.notes?.length, 1);
  assert.equal(book.notes[0].type, "quote");
  assert.equal(book.notes[0].pageOrLocation, "Book IV, 3");

  // Add reflection note
  book = addBookNote(book, {
    type: "note",
    content: "Reread this whenever feeling overwhelmed.",
  });
  assert.equal(book.notes?.length, 2);

  // Delete note
  const quoteId = book.notes[1].id;
  book = deleteBookNote(book, quoteId);
  assert.equal(book.notes?.length, 1);
  assert.equal(book.notes[0].type, "note");
});

test("Bookshelf - Statistics & Monthly Targets", () => {
  const targetMonth = "2026-10";
  const books = [
    normalizeBook({
      id: "b-a",
      title: "Book A",
      status: "finished",
      finishedDate: "2026-10-10",
      logs: [
        {
          id: "l-1",
          bookId: "b-a",
          cycleNumber: 1,
          localDate: "2026-10-05",
          pagesRead: 150,
          durationMinutes: 60,
          createdAt: "2026-10-05T00:00:00Z",
        },
      ],
    }),
    normalizeBook({
      id: "b-b",
      title: "Audiobook B",
      format: "audiobook",
      status: "reading",
      logs: [
        {
          id: "l-2",
          bookId: "b-b",
          cycleNumber: 1,
          localDate: "2026-10-08",
          minutesListened: 45,
          createdAt: "2026-10-08T00:00:00Z",
        },
      ],
    }),
  ];

  const stats = calculateBookshelfStats(books, targetMonth);
  assert.equal(stats.totalBooks, 2);
  assert.equal(stats.finishedCount, 1);
  assert.equal(stats.readingCount, 1);
  assert.equal(stats.finishedThisMonth, 1);
  assert.equal(stats.pagesThisMonth, 150);
  assert.equal(stats.minutesThisMonth, 105); // 60 mins duration + 45 mins listened

  // Monthly Target Progress
  const targetBooks = { yearMonth: "2026-10", type: "books", targetValue: 2 };
  const targetProg = calculateMonthlyTargetProgress(books, targetBooks, targetMonth);
  assert.equal(targetProg.current, 1);
  assert.equal(targetProg.target, 2);
  assert.equal(targetProg.percent, 50);
  assert.equal(targetProg.isCompleted, false);
});

test("Bookshelf - Duplicate Detection & Filter Sorting", () => {
  const existing = [
    normalizeBook({ id: "1", title: "Atomic Habits", author: "James Clear", rating: 5 }),
    normalizeBook({ id: "2", title: "Deep Work", author: "Cal Newport", rating: 4 }),
  ];

  // Exact duplicate detection
  const dup = detectDuplicateBook("atomic habits", "James Clear", existing);
  assert.notEqual(dup, null);
  assert.equal(dup?.id, "1");

  // Filtering & Sorting
  const sortedByRating = filterAndSortBooks(existing, { sortBy: "rating" });
  assert.equal(sortedByRating[0].title, "Atomic Habits");

  const searchFiltered = filterAndSortBooks(existing, { search: "Cal" });
  assert.equal(searchFiltered.length, 1);
  assert.equal(searchFiltered[0].title, "Deep Work");
});

test("Bookshelf - Strictly 0 Extra Bookshelf XP Guarantee", () => {
  // Verifies that neither normalization, progress logging, cycle starts,
  // nor note additions produce any XP awards or ledger mutations.
  const book = normalizeBook({ title: "Clean Code" });
  const logged = logReadingSession(book, { localDate: getTodayKey(), newPage: 20 });
  const noted = addBookNote(logged, { type: "note", content: "Meaningful names matter." });
  const cycled = startNewReadingCycle(noted);

  assert.equal(cycled.xp, undefined);
  assert.equal(cycled.xpAwarded, undefined);
});
