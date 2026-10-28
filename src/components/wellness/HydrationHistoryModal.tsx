import React from "react";
import { X, Trash2, Clock, Droplets } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { todayKey } from "@/lib/store";

interface HydrationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HydrationHistoryModal: React.FC<HydrationHistoryModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useLang();
  const { state, deleteHydrationEvent } = useApp();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  if (!isOpen) return null;

  const todayEvents = (state.hydrationEvents || []).filter(
    (e) => e.localDate === today && !e.deletedAt
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl p-5 overflow-hidden max-h-[85vh] flex flex-col overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
              <Droplets size={18} />
            </span>
            <h3 className="text-base font-bold text-ink">
              {t("viewHistory")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-card-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-y-auto space-y-2 flex-1 pr-1">
          {todayEvents.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-muted">
              {t("emptyNothingLogged")}
            </div>
          ) : (
            todayEvents.map((ev) => {
              const timeStr = ev.occurredAt
                ? new Date(ev.occurredAt).toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";
              return (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-background border border-border/70 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center font-bold text-xs">
                      💧
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink">
                        +{ev.amount} {ev.unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                        <Clock size={11} />
                        <span>{timeStr}</span>
                        <span>•</span>
                        <span className="capitalize">{ev.sourceType}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteHydrationEvent(ev.id)}
                    className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title={t("delete")}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-background border border-border text-xs font-semibold text-ink hover:bg-card-hover transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
