import { useState, useEffect, memo } from "react";
import { X, Sparkles } from "lucide-react";
import { useApp, type FlashDeck, LEARNING_ITEM_COLORS } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface FlashcardDeckModalProps {
  deck?: FlashDeck | null;
  open: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultLearningItemId?: string;
}

export const FlashcardDeckModal = memo(function FlashcardDeckModal({
  deck, open, onClose, defaultSubject = "", defaultLearningItemId,
}: FlashcardDeckModalProps) {
  const { addFlashcardDeck, editFlashcardDeck, state } = useApp();
  const { lang, dir } = useLang();
  const isAr = lang === "ar";

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [learningItemId, setLearningItemId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🃏");
  const [color, setColor] = useState("#8b5cf6");

  useEffect(() => {
    if (deck) {
      setName(deck.name || "");
      setSubject(deck.subject || "");
      setLearningItemId(deck.learningItemId);
      setDescription(deck.description || "");
      setEmoji(deck.emoji || "🃏");
      setColor(deck.color || "#8b5cf6");
    } else {
      setName("");
      setSubject(defaultSubject);
      setLearningItemId(defaultLearningItemId);
      setDescription("");
      setEmoji("🃏");
      setColor(LEARNING_ITEM_COLORS[0]);
    }
  }, [deck, defaultSubject, defaultLearningItemId, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (deck) {
      editFlashcardDeck(deck.id, {
        name: name.trim(),
        subject: subject.trim() || undefined,
        learningItemId,
        description: description.trim() || undefined,
        emoji,
        color,
      });
    } else {
      addFlashcardDeck({
        name: name.trim(),
        subject: subject.trim() || undefined,
        learningItemId,
        description: description.trim() || undefined,
        emoji,
        color,
        cards: [],
      });
    }
    onClose();
  };

  const emojiPresets = ["🃏", "🧠", "💡", "📚", "📐", "🔬", "🌍", "💻", "🎨", "✍️", "📖", "✨"];

  return (
    <div className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-canvas rounded-t-3xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden" dir={dir}>
        <div className="p-5 border-b border-border/60 bg-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-hotpink/10 text-hotpink"><Sparkles size={16} /></span>
            <h2 className="text-base font-bold text-ink font-sans font-bold">
              {deck ? (isAr ? "تعديل مجموعة البطاقات" : "Edit Deck") : (isAr ? "مجموعة بطاقات جديدة" : "New Flashcard Deck")}
            </h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl bg-ghost hover:bg-muted text-ink-light">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "اسم المجموعة *" : "Deck Name *"}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? "مثلاً: مصطلحات التاريخ، مفردات الإنجليزية..." : "e.g. Vocabulary, Biology Ch 3..."}
              className="w-full rounded-xl bg-ghost px-3.5 py-2.5 text-xs text-ink outline-none border border-border/60 focus:border-hotpink"
            />
          </div>

          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "المادة أو الهدف المرتبط" : "Linked Subject / Goal"}</label>
            <select
              value={learningItemId || ""}
              onChange={(e) => {
                const val = e.target.value;
                setLearningItemId(val || undefined);
                const found = (state.learningItems || []).find((it) => it.id === val);
                if (found) setSubject(found.title);
              }}
              className="w-full rounded-xl bg-ghost px-3.5 py-2.5 text-xs text-ink outline-none border border-border/60"
            >
              <option value="">{isAr ? "بدون ربط بمادة معينة" : "Not linked to a subject"}</option>
              {(state.learningItems || []).map((it) => (
                <option key={it.id} value={it.id}>{it.icon} {it.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-ink-light block mb-1">{isAr ? "الأيقونة" : "Emoji"}</label>
              <div className="flex gap-1.5 flex-wrap">
                {emojiPresets.map((em) => (
                  <button
                    type="button"
                    key={em}
                    onClick={() => setEmoji(em)}
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center text-base border transition-all",
                      emoji === em ? "border-hotpink bg-hotpink/20 scale-110" : "border-border/40 bg-card hover:bg-ghost"
                    )}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-ink-light block mb-1">{isAr ? "اللون" : "Theme Color"}</label>
              <div className="flex gap-1.5 flex-wrap">
                {LEARNING_ITEM_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-transform",
                      color === c ? "scale-125 border-ink" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "الوصف (اختياري)" : "Description"}</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "وصف محتويات المجموعة..." : "Deck description..."}
              className="w-full rounded-xl bg-ghost px-3.5 py-2 text-xs text-ink outline-none border border-border/60 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-ghost text-ink-light text-xs font-bold">
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95">
              {deck ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إنشاء المجموعة" : "Create Deck")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
