/**
 * SM-2 Spaced Repetition Algorithm (v2.0)
 * Deterministic, versioned implementation with snapshot-based Undo capability
 * Based on SuperMemo 2 algorithm with configurable learning steps.
 */

export const SCHEDULER_VERSION = "sm2-v2.0";

export type CardState = "new" | "learning" | "review" | "relearning" | "suspended";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type RatingQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface CardScheduleSnapshot {
  easeFactor: number;
  interval: number;
  repetitions: number;
  state: CardState;
  nextReview: string;
  dueAt?: string;
}

export interface FlashCard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  explanation?: string;
  tags?: string[];
  imageStorageReference?: string;
  state: CardState;
  easeFactor: number;       // Default 2.5, min 1.3
  interval: number;         // Days until next review
  repetitions: number;      // Successful reviews in a row
  nextReview: string;       // ISO date string YYYY-MM-DD
  dueAt?: string;           // ISO timestamp or date
  difficulty?: number;      // 0-1 normalized
  stability?: number;       // estimated recall stability in days
  previousScheduleSnapshot?: CardScheduleSnapshot;
  createdAt: string;
  updatedAt?: string;
}

export interface FlashDeck {
  id: string;
  learningItemId?: string;
  subject?: string;
  name: string;
  title?: string;
  description?: string;
  emoji: string;
  icon?: string;
  color: string;
  status?: "active" | "paused" | "archived";
  newCardLimit?: number;
  reviewLimit?: number;
  schedulerVersion?: string;
  createdAt: string;
  updatedAt?: string;
  cards: FlashCard[];
}

export interface FlashcardReviewEvent {
  id: string;
  cardId: string;
  deckId: string;
  rating: ReviewRating;
  quality: RatingQuality;
  previousScheduleSnapshot: CardScheduleSnapshot;
  newScheduleSnapshot: CardScheduleSnapshot;
  reviewedAt: string;
  durationMs?: number;
  schedulerVersion: string;
}

export interface ReviewSessionSummary {
  id: string;
  deckIds?: string[];
  deckId?: string;
  startedAt: string;
  completedAt?: string;
  endedAt?: string;
  createdAt?: string;
  reviewedCount: number;
  cardsReviewedCount?: number;
  cardCount?: number;
  retentionRate?: number;
  newCount?: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  actualSeconds?: number;
  xpEarned?: number;
}

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export function todayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateAddDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ratingToQuality(rating: ReviewRating | RatingQuality): RatingQuality {
  if (typeof rating === "number") return rating;
  switch (rating) {
    case "again": return 0;
    case "hard":  return 1;
    case "good":  return 3;
    case "easy":  return 5;
    default:      return 3;
  }
}

/**
 * Apply SM-2 algorithm to a flashcard with snapshot tracking.
 * @param card    The card being reviewed
 * @param rating  "again" | "hard" | "good" | "easy" or 0-5 rating
 * @returns Updated card with new schedule & previous snapshot
 */
export function sm2(card: FlashCard, rating: ReviewRating | RatingQuality): FlashCard {
  const quality = ratingToQuality(rating);
  
  // Save current schedule snapshot for Undo
  const previousScheduleSnapshot: CardScheduleSnapshot = {
    easeFactor: card.easeFactor ?? DEFAULT_EASE,
    interval: card.interval ?? 0,
    repetitions: card.repetitions ?? 0,
    state: card.state ?? "review",
    nextReview: card.nextReview ?? todayStr(),
    dueAt: card.dueAt,
  };

  let easeFactor = card.easeFactor ?? DEFAULT_EASE;
  let interval = card.interval ?? 0;
  let repetitions = card.repetitions ?? 0;
  let state: CardState = card.state ?? "review";

  if (quality < 3) {
    // Again / Failed
    repetitions = 0;
    interval = 1;
    state = "relearning";
  } else {
    // Passed (Hard / Good / Easy)
    if (repetitions === 0) {
      interval = quality === 1 ? 1 : quality === 5 ? 4 : 1;
    } else if (repetitions === 1) {
      interval = quality === 1 ? 3 : quality === 5 ? 8 : 6;
    } else {
      const multiplier = quality === 1 ? 1.2 : quality === 5 ? easeFactor * 1.3 : easeFactor;
      interval = Math.max(1, Math.round(interval * multiplier));
    }
    repetitions += 1;
    state = "review";
  }

  // Update ease factor according to SuperMemo 2 formula
  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReview = dateAddDays(interval);

  return {
    ...card,
    state,
    easeFactor: Number(easeFactor.toFixed(2)),
    interval,
    repetitions,
    nextReview,
    dueAt: nextReview,
    previousScheduleSnapshot,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Restore a card to its previous schedule snapshot (Undo)
 */
export function undoSm2(card: FlashCard): FlashCard {
  if (!card.previousScheduleSnapshot) return card;
  const prev = card.previousScheduleSnapshot;
  return {
    ...card,
    easeFactor: prev.easeFactor,
    interval: prev.interval,
    repetitions: prev.repetitions,
    state: prev.state,
    nextReview: prev.nextReview,
    dueAt: prev.dueAt || prev.nextReview,
    previousScheduleSnapshot: undefined,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Create a brand-new flashcard with default SM-2 fields
 */
export function createFlashCard(
  deckId: string,
  front: string,
  back: string,
  options?: {
    hint?: string;
    explanation?: string;
    tags?: string[];
  }
): FlashCard {
  const now = new Date().toISOString();
  return {
    id: "card_" + Math.random().toString(36).slice(2, 11),
    deckId,
    front: front.trim(),
    back: back.trim(),
    hint: options?.hint?.trim() || undefined,
    explanation: options?.explanation?.trim() || undefined,
    tags: options?.tags || [],
    state: "new",
    easeFactor: DEFAULT_EASE,
    interval: 0,
    repetitions: 0,
    nextReview: todayStr(),
    dueAt: todayStr(),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a brand-new flashcard deck
 */
export function createFlashDeck(
  subject: string,
  name: string,
  emoji: string,
  color: string,
  options?: {
    learningItemId?: string;
    description?: string;
    newCardLimit?: number;
    reviewLimit?: number;
  }
): FlashDeck {
  const now = new Date().toISOString();
  return {
    id: "deck_" + Math.random().toString(36).slice(2, 11),
    learningItemId: options?.learningItemId,
    subject,
    name: name.trim(),
    title: name.trim(),
    description: options?.description?.trim() || undefined,
    emoji: emoji || "🃏",
    icon: emoji || "🃏",
    color: color || "#A8E0D8",
    status: "active",
    newCardLimit: options?.newCardLimit ?? 20,
    reviewLimit: options?.reviewLimit ?? 50,
    schedulerVersion: SCHEDULER_VERSION,
    createdAt: now,
    updatedAt: now,
    cards: [],
  };
}

/**
 * Normalize and repair flashcard deck IDs and card schemas
 */
export function normalizeFlashDeck(deck: Partial<FlashDeck>): FlashDeck {
  const id = deck.id || "deck_" + Math.random().toString(36).slice(2, 11);
  const cards = (deck.cards || []).map((c: any) => ({
    id: c.id || "card_" + Math.random().toString(36).slice(2, 11),
    deckId: id,
    front: c.front || "",
    back: c.back || "",
    hint: c.hint,
    explanation: c.explanation,
    tags: c.tags || [],
    imageStorageReference: c.imageStorageReference,
    state: (c.state as CardState) || (c.repetitions > 0 ? "review" : "new"),
    easeFactor: c.easeFactor ?? DEFAULT_EASE,
    interval: c.interval ?? 0,
    repetitions: c.repetitions ?? 0,
    nextReview: c.nextReview || todayStr(),
    dueAt: c.dueAt || c.nextReview || todayStr(),
    difficulty: c.difficulty,
    stability: c.stability,
    previousScheduleSnapshot: c.previousScheduleSnapshot,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  }));

  return {
    id,
    learningItemId: deck.learningItemId,
    subject: deck.subject || "General",
    name: deck.name || deck.title || "Untitled Deck",
    title: deck.title || deck.name || "Untitled Deck",
    description: deck.description,
    emoji: deck.emoji || deck.icon || "🃏",
    icon: deck.icon || deck.emoji || "🃏",
    color: deck.color || "#A8E0D8",
    status: deck.status || "active",
    newCardLimit: deck.newCardLimit ?? 20,
    reviewLimit: deck.reviewLimit ?? 50,
    schedulerVersion: deck.schedulerVersion || SCHEDULER_VERSION,
    createdAt: deck.createdAt || new Date().toISOString(),
    updatedAt: deck.updatedAt || new Date().toISOString(),
    cards,
  };
}

/**
 * Get cards due for review today or earlier for a given deck
 */
export function getDueCards(deck: FlashDeck): FlashCard[] {
  const today = todayStr();
  return (deck.cards || []).filter(
    (c) => c.state !== "suspended" && (c.nextReview || todayStr()) <= today
  );
}

/**
 * Get all due cards across all active decks
 */
export function getAllDueCards(decks: FlashDeck[]): FlashCard[] {
  const today = todayStr();
  return decks
    .filter((d) => d.status !== "archived")
    .flatMap((d) => (d.cards || []).filter((c) => c.state !== "suspended" && (c.nextReview || todayStr()) <= today));
}
