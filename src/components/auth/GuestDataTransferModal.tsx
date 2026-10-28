import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import type {
  GuestDataInspectionResult,
  GuestMigrationStrategy,
} from "@/lib/guestMigrationEngine";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Layers,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

interface GuestDataTransferModalProps {
  open: boolean;
  inspection: GuestDataInspectionResult | null;
  onSelectStrategy: (strategy: GuestMigrationStrategy) => void;
  loading?: boolean;
}

export function GuestDataTransferModal({
  open,
  inspection,
  onSelectStrategy,
  loading = false,
}: GuestDataTransferModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const [showDetails, setShowDetails] = useState(false);

  if (!inspection || !inspection.hasData) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onSelectStrategy("cancel")}>
      <DialogContent className="max-w-md w-[92vw] max-h-[90vh] flex flex-col p-5 rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
        <DialogHeader className="text-start pb-2 border-b border-border/40">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-9 w-9 rounded-full grad-theme flex items-center justify-center text-white shadow-xs">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-foreground">
                {t("guestDataDetected")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {t("guestDataDetectedSub")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 space-y-3.5 pr-1">
          {/* Summary badge */}
          <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {isAr ? "البيانات المسجلة على هذا الجهاز:" : "Total items on this device:"}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full grad-theme text-white text-xs font-black shadow-2xs">
              {inspection.totalItems} {isAr ? "عنصر" : "items"}
            </span>
          </div>

          {/* Breakdown Toggle */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground px-2 py-1 hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              {isAr ? "تفاصيل العناصر حسب القسم" : "Breakdown by category"}
            </span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDetails && (
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-muted/40 border border-border/50 max-h-48 overflow-y-auto">
              {inspection.categories.map((cat) => (
                <div
                  key={cat.key}
                  className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/40 text-[11px]"
                >
                  <span className="text-muted-foreground truncate">{isAr ? cat.nameAr : cat.nameEn}</span>
                  <span className="font-bold text-foreground ltr:ml-1 rtl:mr-1">{cat.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Strategy Actions */}
          <div className="space-y-2 pt-1">
            {/* Strategy 1: Keep & Merge (Recommended) */}
            <button
              type="button"
              disabled={loading}
              onClick={() => onSelectStrategy("keep_and_merge")}
              className="w-full p-3.5 rounded-2xl bg-primary/10 hover:bg-primary/15 border-2 border-primary/30 text-start flex items-start gap-3 transition-all active:scale-[0.99]"
            >
              <div className="h-8 w-8 rounded-xl grad-theme flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">{t("keepAndAttach")}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full grad-theme text-white">
                    {isAr ? "الموصى به" : "Recommended"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {t("keepAndAttachDesc")}
                </p>
              </div>
            </button>

            {/* Strategy 2: Account Only (Fresh start) */}
            <button
              type="button"
              disabled={loading}
              onClick={() => onSelectStrategy("account_only")}
              className="w-full p-3 rounded-2xl bg-muted/40 hover:bg-muted/60 border border-border text-start flex items-start gap-3 transition-all active:scale-[0.99]"
            >
              <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center text-foreground shrink-0 mt-0.5">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-foreground">{t("useAccountOnly")}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {t("useAccountOnlyDesc")}
                </p>
              </div>
            </button>

            {/* Strategy 3: Cancel */}
            <button
              type="button"
              disabled={loading}
              onClick={() => onSelectStrategy("cancel")}
              className="w-full py-2.5 rounded-xl text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("cancelMigration")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
