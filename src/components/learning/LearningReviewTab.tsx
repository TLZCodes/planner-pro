import { useState, useMemo, memo } from "react";
import {
  RotateCcw, Sparkles, CheckCircle2, ChevronRight, Undo2, Award,
  HelpCircle, Zap, ArrowLeft, ArrowRight, Play, Check, Clock, BookOpen
} from "lucide-react";
import { useApp, type FlashCard, type FlashDeck, type ReviewRating } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LearningReviewTabProps {
  onSelectTab: (tab: "overview" | "subjects" | "flashcards" | "review" | "progress") => void;
}

export const LearningReviewTab = memo(function LearningReviewTab({
  onSelectTab,
}: LearningReviewTabProps) {
  const { state, reviewFlashcard, undoFlashcardReview, recordReviewSession } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const todayStr = new Date().toISOString().slice(0, 10);
  const decks = state.flashcardDecks || [];

  const reviewQueue = useMemo(() => {
    const queue: { deck: FlashDeck; card: FlashCard }[] = [];
    for (const deck of decks) {
      for (const card of (deck.cards || [])) {
        if (!card.dueAt || card.dueAt <= todayStr || card.state === "new" || card.state === "learning") {
          queue.push({ deck, card });
        }
      }
    }
    return queue;
  }, [decks, todayStr]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [reviewedHistory, setReviewedHistory] = useState<{ deckId: string; cardId: string; rating: ReviewRating }[]>([]);
  const [sessionStartedAt] = useState(new Date().toISOString());
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const currentItem = reviewQueue[currentIndex];

  const handleRate = (rating: ReviewRating) => {
    if (!currentItem) return;
    reviewFlashcard(currentItem.deck.id, currentItem.card.id, rating);
    setReviewedHistory([...reviewedHistory, { deckId: currentItem.deck.id, cardId: currentItem.card.id, rating }]);
    setIsRevealed(false);
    setShowHint(false);

    if (currentIndex + 1 < reviewQueue.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSessionFinished(true);
      const goodOrEasyCount = [...reviewedHistory, { rating }].filter(
        (r) => r.rating === "good" || r.rating === "easy"
      ).length;
      const totalCount = reviewQueue.length;
      const retentionRate = Math.round((goodOrEasyCount / Math.max(1, totalCount)) * 100);

      const ended = new Date().toISOString();
      recordReviewSession({
        deckId: currentItem.deck.id,
        deckIds: [currentItem.deck.id],
        startedAt: sessionStartedAt,
        completedAt: ended,
        endedAt: ended,
        reviewedCount: totalCount,
        againCount: [...reviewedHistory, { rating }].filter((r) => r.rating === "again").length,
        hardCount: [...reviewedHistory, { rating }].filter((r) => r.rating === "hard").length,
        goodCount: [...reviewedHistory, { rating }].filter((r) => r.rating === "good").length,
        easyCount: [...reviewedHistory, { rating }].filter((r) => r.rating === "easy").length,
        newCount: 0,
        actualSeconds: 0,
        xpEarned: 0,
        retentionRate,
      });
    }
  };

  const handleUndo = () => {
    if (reviewedHistory.length === 0) return;
    const last = reviewedHistory[reviewedHistory.length - 1];
    undoFlashcardReview(last.deckId, last.cardId);
    setReviewedHistory(reviewedHistory.slice(0, -1));
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    setIsRevealed(false);
    setShowHint(false);
    setIsSessionFinished(false);
  };

  if (isSessionFinished || (reviewQueue.length > 0 && currentIndex >= reviewQueue.length)) {
    const goodOrEasy = reviewedHistory.filter((r) => r.rating === "good" || r.rating === "easy").length;
    const rate = Math.round((goodOrEasy / Math.max(1, reviewedHistory.length)) * 100);

    return (
      <div className="max-w-md mx-auto py-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="h-20 w-20 rounded-full grad-theme mx-auto flex items-center justify-center text-3xl shadow-rose animate-bounce">
          🎉
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-ink font-sans">{t("sessionComplete")}</h2>
          <p className="text-xs text-ink-light font-sans">
            {isAr ? "أحسنتِ! لقد راجعتِ جميع البطاقات المستحقة لجلسة اليوم." : "Great job! You’ve reviewed all cards due for today."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-3xl bg-card border border-border/60 text-center">
          <div className="p-3 rounded-2xl bg-ghost/50">
            <p className="text-[11px] text-ink-light font-bold font-sans">{isAr ? "البطاقات المراجعة" : "Cards Reviewed"}</p>
            <p className="text-2xl font-black font-mono text-ink mt-1">{reviewedHistory.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-ghost/50">
            <p className="text-[11px] text-ink-light font-bold font-sans">{t("reviewSuccessRate")}</p>
            <p className="text-2xl font-black font-mono text-hotpink mt-1">{rate}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          {reviewedHistory.length > 0 && (
            <button
              onClick={handleUndo}
              className="flex-1 py-3 rounded-2xl bg-ghost text-ink-light text-xs font-bold flex items-center justify-center gap-1.5 font-sans"
            >
              <Undo2 size={14} />
              <span>{t("undoReview")}</span>
            </button>
          )}
          <button
            onClick={() => onSelectTab("overview")}
            className="flex-1 py-3 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 font-sans"
          >
            {isAr ? "العودة للرئيسية" : "Back to Learning Hub"}
          </button>
        </div>
      </div>
    );
  }

  if (reviewQueue.length === 0) {
    return (
      <div className="max-w-md mx-auto py-14 text-center space-y-5 animate-in fade-in duration-300">
        <div className="h-20 w-20 rounded-full bg-mint/15 text-islamic mx-auto flex items-center justify-center text-3xl">
          🌿
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-ink font-sans">{t("allCaughtUpTitle")}</h2>
          <p className="text-xs text-ink-light max-w-xs mx-auto font-sans">{t("allCaughtUpSub")}</p>
        </div>
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => onSelectTab("flashcards")}
            className="px-5 py-2.5 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 font-sans"
          >
            {isAr ? "تصفح مجموعات البطاقات" : "Manage Flashcards"}
          </button>
        </div>
      </div>
    );
  }

  const card = currentItem.card;
  const deck = currentItem.deck;
  const progressPercent = Math.round(((currentIndex) / reviewQueue.length) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-300 pb-12">
      {/* Session Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-card border border-border/60 text-base shadow-xs">{deck.emoji}</span>
            <span className="font-bold text-ink truncate max-w-[170px] font-sans">{deck.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {reviewedHistory.length > 0 && (
              <button
                onClick={handleUndo}
                className="text-[11px] font-bold text-ink-light hover:text-ink flex items-center gap-1 font-sans"
                title="Undo last rating"
              >
                <Undo2 size={12} />
                <span>{t("undoReview")}</span>
              </button>
            )}
            <span className="font-mono font-bold text-hotpink text-xs">
              {currentIndex + 1} / {reviewQueue.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-ghost overflow-hidden">
          <div
            className="h-full grad-theme transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Modern Flashcard Container */}
      <div
        className={cn(
          "min-h-[320px] rounded-3xl bg-card border border-border/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all duration-300 relative",
          isRevealed ? "border-hotpink/50 shadow-rose-sm" : ""
        )}
      >
        {/* Top Card Badge & Tags */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-lg border font-sans",
              card.state === "new"
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                : card.state === "learning"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-ghost text-ink-light border-border/60"
            )}
          >
            {card.state === "new" ? (isAr ? "بطاقة جديدة" : "New") : (isAr ? "مراجعة دورية" : "Review")}
          </span>

          {card.tags && card.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {card.tags.map((tg) => (
                <span key={tg} className="text-[10px] font-bold text-ink-light bg-ghost px-2 py-0.5 rounded-md font-sans">
                  #{tg}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Main Card Content */}
        <div className="my-auto py-5 text-center space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-ink-light/70 font-sans block mb-1.5">
              {isAr ? "السؤال أو المفهوم" : "Prompt / Question"}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-ink leading-relaxed whitespace-pre-wrap font-sans tracking-tight">
              {card.front}
            </h3>
          </div>

          {/* Hint Section */}
          {card.hint && (
            <div>
              {showHint ? (
                <p className="text-xs text-hotpink bg-hotpink/10 p-2.5 rounded-xl border border-hotpink/20 max-w-sm mx-auto animate-in fade-in font-sans">
                  💡 {card.hint}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="text-[11px] text-ink-light hover:text-hotpink font-bold inline-flex items-center gap-1 font-sans"
                >
                  <HelpCircle size={12} />
                  <span>{isAr ? "إظهار تلميح" : "Show Hint"}</span>
                </button>
              )}
            </div>
          )}

          {/* Answer Section */}
          {isRevealed && (
            <div className="pt-4 border-t border-border/60 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 font-sans block">
                {isAr ? "الإجابة الصحيحة" : "Answer"}
              </span>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-base sm:text-lg font-sans whitespace-pre-wrap">
                {card.back}
              </div>
              {card.explanation && (
                <p className="text-xs text-ink-light leading-relaxed max-w-md mx-auto whitespace-pre-wrap pt-1 font-sans">
                  📖 {card.explanation}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Interactive Actions */}
        <div className="pt-2">
          {!isRevealed ? (
            <button
              onClick={() => setIsRevealed(true)}
              className="w-full py-3.5 rounded-2xl grad-theme text-white text-xs font-black shadow-rose active:scale-98 transition-all flex items-center justify-center gap-2 font-sans"
            >
              <Sparkles size={14} />
              <span>{t("revealAnswer")}</span>
            </button>
          ) : (
            <div className="space-y-2 animate-in fade-in duration-200">
              <p className="text-[10px] text-center font-bold text-ink-light font-sans">
                {isAr ? "كيف كان مستوى استرجاعكِ؟" : "Rate your recall:"}
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleRate("again")}
                  className="p-2.5 rounded-2xl bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 text-center font-bold text-xs active:scale-95 transition-all font-sans"
                >
                  <span className="block text-xs font-black">{t("ratingAgain")}</span>
                  <span className="block text-[10px] opacity-75 font-mono mt-0.5">1m</span>
                </button>
                <button
                  onClick={() => handleRate("hard")}
                  className="p-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/40 text-center font-bold text-xs active:scale-95 transition-all font-sans"
                >
                  <span className="block text-xs font-black">{t("ratingHard")}</span>
                  <span className="block text-[10px] opacity-75 font-mono mt-0.5">1d</span>
                </button>
                <button
                  onClick={() => handleRate("good")}
                  className="p-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-center font-bold text-xs active:scale-95 transition-all font-sans"
                >
                  <span className="block text-xs font-black">{t("ratingGood")}</span>
                  <span className="block text-[10px] opacity-75 font-mono mt-0.5">3d</span>
                </button>
                <button
                  onClick={() => handleRate("easy")}
                  className="p-2.5 rounded-2xl bg-hotpink/15 hover:bg-hotpink/25 text-hotpink border border-hotpink/40 text-center font-bold text-xs active:scale-95 transition-all font-sans"
                >
                  <span className="block text-xs font-black">{t("ratingEasy")}</span>
                  <span className="block text-[10px] opacity-75 font-mono mt-0.5">7d</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
