/**
 * useFlashcards — Custom hook for SM-2 flashcard deck management
 * Stored under LocalStorage key: proplanner_flashcards_v1
 */
import { useState, useCallback, useEffect } from "react";
import {
  type FlashCard,
  type FlashDeck,
  sm2,
  createFlashCard,
  createFlashDeck,
  getDueCards,
  todayStr,
} from "@/lib/sm2";

const FLASHCARDS_KEY = "proplanner_flashcards_v1";

const DEFAULT_DECKS: FlashDeck[] = [
  {
    ...createFlashDeck("Mathematics", "Math Fundamentals", "📐", "#A8E0D8"),
    cards: [
      { ...createFlashCard("", "What is the quadratic formula?", "x = (-b ± √(b²-4ac)) / 2a"), nextReview: todayStr() } as FlashCard,
      { ...createFlashCard("", "What is the derivative of sin(x)?", "cos(x)"), nextReview: todayStr() } as FlashCard,
      { ...createFlashCard("", "Pythagorean theorem?", "a² + b² = c²"), nextReview: todayStr() } as FlashCard,
    ],
  },
  {
    ...createFlashDeck("Languages", "English Vocabulary", "🗣️", "#C8B6E2"),
    cards: [
      { ...createFlashCard("", "Ephemeral", "Lasting for a very short time"), nextReview: todayStr() } as FlashCard,
      { ...createFlashCard("", "Ubiquitous", "Present, appearing, or found everywhere"), nextReview: todayStr() } as FlashCard,
    ],
  },
];

function fixDeckIds(decks: FlashDeck[]): FlashDeck[] {
  return decks.map((d) => ({
    ...d,
    cards: d.cards.map((c) => ({ ...c, deckId: d.id })),
  }));
}

function loadDecks(): FlashDeck[] {
  try {
    const raw = localStorage.getItem(FLASHCARDS_KEY);
    if (raw) return fixDeckIds(JSON.parse(raw) as FlashDeck[]);
  } catch { /* ignore */ }
  return fixDeckIds(DEFAULT_DECKS.map((d) => ({ ...d, id: Math.random().toString(36).slice(2, 10) })));
}

function saveDecks(decks: FlashDeck[]): void {
  try {
    localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(decks));
  } catch { /* ignore */ }
}

export function useFlashcards() {
  const [decks, setDecks] = useState<FlashDeck[]>(() => loadDecks());

  useEffect(() => {
    saveDecks(decks);
  }, [decks]);

  const addDeck = useCallback((subject: string, name: string, emoji: string, color: string) => {
    const newDeck = createFlashDeck(subject, name, emoji, color);
    setDecks((prev) => [...prev, newDeck]);
    return newDeck;
  }, []);

  const removeDeck = useCallback((deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  }, []);

  const addCard = useCallback((deckId: string, front: string, back: string) => {
    const card = createFlashCard(deckId, front, back);
    setDecks((prev) =>
      prev.map((d) => d.id === deckId ? { ...d, cards: [...d.cards, card] } : d)
    );
    return card;
  }, []);

  const removeCard = useCallback((deckId: string, cardId: string) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) } : d
      )
    );
  }, []);

  const reviewCard = useCallback(
    (deckId: string, cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5): FlashCard | null => {
      let updated: FlashCard | null = null;
      setDecks((prev) =>
        prev.map((d) => {
          if (d.id !== deckId) return d;
          return {
            ...d,
            cards: d.cards.map((c) => {
              if (c.id !== cardId) return c;
              updated = sm2(c, quality);
              return updated;
            }),
          };
        })
      );
      return updated;
    },
    []
  );

  const getDeckDueCards = useCallback(
    (deckId: string): FlashCard[] => {
      const deck = decks.find((d) => d.id === deckId);
      if (!deck) return [];
      return getDueCards(deck);
    },
    [decks]
  );

  const getAllDueCount = useCallback((): number => {
    const today = todayStr();
    return decks.flatMap((d) => d.cards).filter((c) => c.nextReview <= today).length;
  }, [decks]);

  const totalCards = decks.reduce((s, d) => s + d.cards.length, 0);

  return {
    decks,
    addDeck,
    removeDeck,
    addCard,
    removeCard,
    reviewCard,
    getDeckDueCards,
    getAllDueCount,
    totalCards,
  };
}
