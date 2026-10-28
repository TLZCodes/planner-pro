import { useState, useEffect, memo } from "react";
import { X, Sparkles, HelpCircle } from "lucide-react";
import { useApp, type FlashCard } from "@/lib/store";
import { useLang } from "@/lib/i18n";

interface FlashcardFormModalProps {
  deckId: string;
  card?: FlashCard | null;
  open: boolean;
  onClose: () => void;
}

export const FlashcardFormModal = memo(function FlashcardFormModal({
  deckId, card, open, onClose,
}: FlashcardFormModalProps) {
  const { addFlashcard, editFlashcard } = useApp();
  const { lang, dir } = useLang();
  const isAr = lang === "ar";

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (card) {
      setFront(card.front || "");
      setBack(card.back || "");
      setHint(card.hint || "");
      setExplanation(card.explanation || "");
      setTags(card.tags || []);
    } else {
      setFront("");
      setBack("");
      setHint("");
      setExplanation("");
      setTags([]);
    }
  }, [card, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    if (card) {
      editFlashcard(deckId, card.id, {
        front: front.trim(),
        back: back.trim(),
        hint: hint.trim() || undefined,
        explanation: explanation.trim() || undefined,
        tags,
      });
    } else {
      addFlashcard(deckId, {
        front: front.trim(),
        back: back.trim(),
        hint: hint.trim() || undefined,
        explanation: explanation.trim() || undefined,
        tags,
      });
    }
    onClose();
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const tClean = tagInput.trim();
    if (!tags.includes(tClean)) {
      setTags([...tags, tClean]);
    }
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-canvas rounded-t-3xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" dir={dir}>
        <div className="p-5 border-b border-border/60 bg-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-hotpink/10 text-hotpink"><Sparkles size={16} /></span>
            <h2 className="text-base font-bold text-ink font-sans font-bold">
              {card ? (isAr ? "تعديل البطاقة" : "Edit Flashcard") : (isAr ? "بطاقة استذكار جديدة" : "New Flashcard")}
            </h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl bg-ghost hover:bg-muted text-ink-light">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "السؤال / الوجه الأمامي *" : "Front / Question *"}</label>
            <textarea
              required
              rows={3}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder={isAr ? "اكتبي السؤال أو المفهوم هنا..." : "Enter the question or concept here..."}
              className="w-full rounded-xl bg-ghost px-3.5 py-2.5 text-xs text-ink outline-none border border-border/60 focus:border-hotpink resize-none"
            />
          </div>

          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "الإجابة / الوجه الخلفي *" : "Back / Answer *"}</label>
            <textarea
              required
              rows={3}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder={isAr ? "اكتبي الإجابة النموذجية أو التعريف هنا..." : "Enter the key answer or definition here..."}
              className="w-full rounded-xl bg-ghost px-3.5 py-2.5 text-xs text-ink outline-none border border-border/60 focus:border-hotpink resize-none"
            />
          </div>

          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "تلميح (اختياري)" : "Hint (Optional)"}</label>
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder={isAr ? "تلميح يساعد في التذكر..." : "A gentle clue..."}
              className="w-full rounded-xl bg-ghost px-3.5 py-2 text-xs text-ink outline-none border border-border/60"
            />
          </div>

          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "شرح إضافي بعد الإجابة (اختياري)" : "Detailed Explanation (Optional)"}</label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder={isAr ? "شرح أو أمثلة تظهر عند كشف الإجابة..." : "Extra context shown after flipping..."}
              className="w-full rounded-xl bg-ghost px-3.5 py-2 text-xs text-ink outline-none border border-border/60 resize-none"
            />
          </div>

          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "وسوم / تصنيفات" : "Tags"}</label>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={isAr ? "+ وسم واضغطي Enter..." : "+ Tag..."}
                className="flex-1 rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40"
              />
              <button type="button" onClick={handleAddTag} className="px-3 py-1.5 rounded-xl bg-ghost text-xs font-bold text-ink">
                {isAr ? "إضافة" : "Add"}
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {tags.map((tg) => (
                  <span key={tg} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-hotpink/10 text-hotpink text-[10px] font-bold">
                    #{tg}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tg))} className="text-danger">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-ghost text-ink-light text-xs font-bold">
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95">
              {card ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إضافة البطاقة" : "Add Flashcard")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
