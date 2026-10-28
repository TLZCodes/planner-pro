import { useState, memo } from "react";
import {
  Plus, Play, Zap, Edit2, Trash2, Upload, BookOpen, Layers, ChevronRight, Sparkles
} from "lucide-react";
import { useApp, type FlashDeck, type FlashCard } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LearningFlashcardsTabProps {
  onSelectTab: (tab: "overview" | "subjects" | "flashcards" | "review" | "progress") => void;
  onOpenNewDeck: () => void;
  onEditDeck: (deck: FlashDeck) => void;
  onOpenNewCard: (deckId: string) => void;
  onEditCard: (deckId: string, card: FlashCard) => void;
  onOpenImport: (deckId: string) => void;
}

export const LearningFlashcardsTab = memo(function LearningFlashcardsTab({
  onSelectTab, onOpenNewDeck, onEditDeck, onOpenNewCard, onEditCard, onOpenImport,
}: LearningFlashcardsTabProps) {
  const { state, removeFlashcardDeck, removeFlashcard } = useApp();
  const { t, lang, dir } = useLang();
  const isAr = lang === "ar";

  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const decks = state.flashcardDecks || [];
  const selectedDeck = decks.find((d) => d.id === selectedDeckId);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-ink font-sans">{isAr ? "مجموعات بطاقات الاستذكار" : "Flashcard Decks"}</h3>
          <p className="text-xs text-ink-light mt-0.5 font-sans">{decks.length} {isAr ? "مجموعات نشطة" : "decks in total"}</p>
        </div>
        <button
          onClick={onOpenNewDeck}
          className="px-4 py-2.5 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 flex items-center gap-1.5 font-sans"
        >
          <Plus size={14} />
          <span>{isAr ? "+ إنشاء مجموعة" : "+ New Deck"}</span>
        </button>
      </div>

      {/* Decks Grid */}
      {decks.length === 0 ? (
        <div className="text-center py-14 rounded-3xl bg-card border border-border/60 p-6">
          <p className="text-4xl mb-3">🃏</p>
          <p className="text-base font-bold text-ink font-sans">{isAr ? "لا توجد مجموعات بطاقات بعد" : "No Flashcard Decks Yet"}</p>
          <p className="text-xs text-ink-light mt-1 max-w-sm mx-auto font-sans">
            {isAr
              ? "أنشئي مجموعتكِ الأولى وأضيفي بطاقات لمراجعتها بأسلوب التكرار المتباعد."
              : "Create a deck to start memorizing formulas, definitions, and key concepts."}
          </p>
          <button
            onClick={onOpenNewDeck}
            className="mt-5 px-6 py-2.5 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 inline-flex items-center gap-1.5 font-sans"
          >
            <Plus size={14} />
            <span>{isAr ? "إنشاء أول مجموعة" : "Create First Deck"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map((deck) => {
            const cards = deck.cards || [];
            const cardsDue = cards.filter(
              (c) => !c.dueAt || c.dueAt <= todayStr || c.state === "new" || c.state === "learning"
            ).length;

            return (
              <div
                key={deck.id}
                className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs hover:border-hotpink/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl shrink-0 shadow-xs"
                      style={{ background: deck.color + "25", border: `1.5px solid ${deck.color}50` }}
                    >
                      {deck.emoji}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditDeck(deck)}
                        className="h-8 w-8 rounded-xl bg-ghost hover:bg-muted text-ink-light flex items-center justify-center"
                        title="Edit Deck"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(isAr ? "هل أنتِ متأكدة من حذف هذه المجموعة؟" : "Delete this deck?")) {
                            removeFlashcardDeck(deck.id);
                          }
                        }}
                        className="h-8 w-8 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger flex items-center justify-center"
                        title="Delete Deck"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-ink truncate font-sans">{deck.name}</h4>
                  {deck.subject && <p className="text-[11px] text-hotpink font-bold mt-0.5">📚 {deck.subject}</p>}
                  {deck.description && <p className="text-xs text-ink-light line-clamp-2 mt-1">{deck.description}</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-ink font-mono">{(deck.cards || []).length} cards</span>
                    {cardsDue > 0 ? (
                      <span className="text-[10px] text-hotpink font-bold block">🔥 {cardsDue} due today</span>
                    ) : (
                      <span className="text-[10px] text-islamic font-bold block">✓ all caught up</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedDeckId(selectedDeckId === deck.id ? null : deck.id)}
                      className="px-3 py-1.5 rounded-xl bg-ghost text-ink-light hover:text-ink text-xs font-bold"
                    >
                      {selectedDeckId === deck.id ? (isAr ? "إخفاء" : "Hide") : (isAr ? "إدارة" : "Manage")}
                    </button>
                    <button
                      onClick={() => onSelectTab("review")}
                      className="px-3.5 py-1.5 rounded-xl grad-theme text-white text-xs font-bold flex items-center gap-1 active:scale-95 shadow-xs"
                    >
                      <Play size={11} className="fill-white" />
                      <span>{isAr ? "مراجعة" : "Review"}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Card Manager within the Deck */}
                {selectedDeckId === deck.id && (
                  <div className="mt-4 pt-3 border-t border-border/60 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">{isAr ? "بطاقات المجموعة" : "Cards"} ({(deck.cards || []).length})</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onOpenImport(deck.id)}
                          className="px-2.5 py-1 rounded-lg bg-ghost text-ink-light text-[11px] font-bold flex items-center gap-1"
                        >
                          <Upload size={11} /> {isAr ? "استيراد" : "Import"}
                        </button>
                        <button
                          onClick={() => onOpenNewCard(deck.id)}
                          className="px-2.5 py-1 rounded-lg bg-hotpink/10 text-hotpink text-[11px] font-bold flex items-center gap-1"
                        >
                          <Plus size={11} /> {isAr ? "+ بطاقة" : "+ Card"}
                        </button>
                      </div>
                    </div>

                    {(deck.cards || []).length === 0 ? (
                      <p className="text-[11px] text-ink-light italic text-center py-3">
                        {isAr ? "لا توجد بطاقات في هذه المجموعة بعد." : "No cards in this deck yet."}
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(deck.cards || []).map((c) => (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-ghost/50 border border-border/40 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="font-bold text-ink truncate">{c.front}</p>
                              <p className="text-[10px] text-ink-light truncate mt-0.5">{c.back}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => onEditCard(deck.id, c)}
                                className="h-6 w-6 rounded-lg bg-ghost text-ink-light flex items-center justify-center hover:text-ink"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={() => removeFlashcard(deck.id, c.id)}
                                className="h-6 w-6 rounded-lg bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
