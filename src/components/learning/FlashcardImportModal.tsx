import { useState, memo } from "react";
import { X, Upload, FileText, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";

interface FlashcardImportModalProps {
  deckId: string;
  open: boolean;
  onClose: () => void;
}

export const FlashcardImportModal = memo(function FlashcardImportModal({
  deckId, open, onClose,
}: FlashcardImportModalProps) {
  const { addFlashcard } = useApp();
  const { lang, dir } = useLang();
  const isAr = lang === "ar";

  const [text, setText] = useState("");
  const [separator, setSeparator] = useState<"," | "\t" | ";">("\t");
  const [previewCount, setPreviewCount] = useState(0);

  if (!open) return null;

  const parseLines = () => {
    if (!text.trim()) return [];
    const sep = separator === "\t" ? "\t" : separator;
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsed: { front: string; back: string }[] = [];

    for (const line of lines) {
      const parts = line.split(sep);
      if (parts.length >= 2) {
        parsed.push({
          front: parts[0].trim(),
          back: parts.slice(1).join(" ").trim(),
        });
      }
    }
    return parsed;
  };

  const parsed = parseLines();

  const handleImport = () => {
    if (parsed.length === 0) return;
    for (const item of parsed) {
      addFlashcard(deckId, {
        front: item.front,
        back: item.back,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-canvas rounded-t-3xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden flex flex-col" dir={dir}>
        <div className="p-5 border-b border-border/60 bg-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-hotpink/10 text-hotpink"><Upload size={16} /></span>
            <h2 className="text-base font-bold text-ink font-sans font-bold">
              {isAr ? "استيراد بطاقات من نص / CSV" : "Import Flashcards"}
            </h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl bg-ghost hover:bg-muted text-ink-light">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-ink-light block mb-1">
              {isAr ? "الفاصل بين السؤال والإجابة" : "Delimiter / Separator"}
            </label>
            <div className="flex gap-2">
              {[
                { id: "\t", label: isAr ? "Tab (نسخ من Excel/Sheets)" : "Tab (Excel/Sheets)" },
                { id: ",", label: "Comma (,)" },
                { id: ";", label: "Semicolon (;)" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeparator(s.id as any)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    separator === s.id ? "border-hotpink bg-hotpink/15 text-hotpink" : "border-border/40 bg-card text-ink-light"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-ink-light block mb-1">
              {isAr ? "الصقي النص هنا (سطر لكل بطاقة)" : "Paste text here (one card per line)"}
            </label>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isAr ? "السؤال الأول\tالإجابة الأولى\nالسؤال الثاني\tالإجابة الثانية" : "Question 1\tAnswer 1\nQuestion 2\tAnswer 2"}
              className="w-full rounded-xl bg-ghost p-3 text-xs text-ink outline-none border border-border/60 font-mono resize-none"
            />
          </div>

          {parsed.length > 0 && (
            <div className="p-3 rounded-2xl bg-mint/10 border border-mint/30 flex items-center justify-between">
              <span className="text-xs font-bold text-islamic flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                {isAr ? `تم التعرف على ${parsed.length} بطاقة` : `Recognized ${parsed.length} cards`}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-ghost text-ink-light text-xs font-bold">
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="button"
              disabled={parsed.length === 0}
              onClick={handleImport}
              className="px-6 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 disabled:opacity-50"
            >
              {isAr ? `استيراد ${parsed.length} بطاقة` : `Import ${parsed.length} Cards`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
