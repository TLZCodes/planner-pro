import React from "react";
import { Shield, ShieldAlert, Check, X, Info, Clock, AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  type ContextPermissionScope,
  buildUserContextSummary,
  STRICT_EXCLUDED_MODULES,
} from "@/lib/aiPlannerEngine";

interface AiContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: ContextPermissionScope;
  onUpdateScope: (updated: Partial<ContextPermissionScope>) => void;
  onRevoke: () => void;
}

export function AiContextModal({
  isOpen,
  onClose,
  scope,
  onUpdateScope,
  onRevoke,
}: AiContextModalProps) {
  const { lang, dir } = useLang();
  const { state } = useApp();
  const isAr = lang === "ar";

  if (!isOpen) return null;

  const inspection = buildUserContextSummary(state, scope);

  const toggleSource = (sourceKey: keyof ContextPermissionScope["sources"]) => {
    onUpdateScope({
      granted: true,
      sources: {
        ...scope.sources,
        [sourceKey]: !scope.sources[sourceKey],
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const setConsentGranted = (granted: boolean) => {
    onUpdateScope({
      granted,
      updatedAt: new Date().toISOString(),
    });
  };

  const setMode = (mode: "single_request" | "ongoing") => {
    onUpdateScope({
      mode,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="context-modal-title"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-card border border-pink-200/80 dark:border-pink-900/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-hotpink/10 text-hotpink">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 id="context-modal-title" className="text-base font-bold text-ink">
                {isAr ? "سياق التخطيط والصلاحيات 🔒" : "Planner Context & Privacy 🔒"}
              </h2>
              <p className="text-[11px] font-medium text-ink-light">
                {isAr ? "تحكّمي بدقة في البيانات المسموح إرسالها لمساعدتكِ" : "Control the exact planner data shared with AYXA AI"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-light hover:bg-surface hover:text-ink transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
          {/* Master Consent Toggle */}
          <div className="rounded-2xl border border-pink-200 dark:border-pink-900/80 bg-pink-50/50 dark:bg-pink-950/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink">
                  {isAr ? "السماح بالوصول لسياق التخطيط" : "Allow Planner Context Sharing"}
                </p>
                <p className="text-xs text-ink-light mt-0.5">
                  {isAr
                    ? "افتراضياً: لا تتم مشاركة أي بيانات شخصية ما لم تفعّليها صراحة."
                    : "Default: No personal context is shared unless you explicitly authorize it."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConsentGranted(!scope.granted)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  scope.granted ? "bg-hotpink" : "bg-gray-300 dark:bg-gray-700"
                }`}
                role="switch"
                aria-checked={scope.granted}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    scope.granted ? (isAr ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {scope.granted && (
              <div className="mt-3 pt-3 border-t border-pink-200/60 dark:border-pink-900/40 flex items-center gap-2">
                <span className="text-xs font-semibold text-ink-light">
                  {isAr ? "نطاق الصلاحية:" : "Authorization Scope:"}
                </span>
                <button
                  type="button"
                  onClick={() => setMode("single_request")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    scope.mode === "single_request"
                      ? "bg-hotpink text-white"
                      : "bg-surface text-ink-light hover:text-ink"
                  }`}
                >
                  {isAr ? "لهذا الطلب فقط" : "This Request Only"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("ongoing")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    scope.mode === "ongoing"
                      ? "bg-hotpink text-white"
                      : "bg-surface text-ink-light hover:text-ink"
                  }`}
                >
                  {isAr ? "نطاق مستمر" : "Ongoing Scope"}
                </button>
              </div>
            )}
          </div>

          {/* Permitted Granular Sources */}
          {scope.granted && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-light">
                {isAr ? "المصادر المسموح بها والمدرجة حالياً:" : "Permitted Context Sources:"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    key: "openTasks" as const,
                    labelEn: "Open Tasks (Titles only)",
                    labelAr: "المهام المفتوحة (العناوين فقط)",
                    count: inspection.recordCounts.tasks,
                    fields: "title, dueDate, tag (NO notes)",
                  },
                  {
                    key: "goalMilestones" as const,
                    labelEn: "Active Goals & Milestones",
                    labelAr: "الأهداف والمحطات النشطة",
                    count: inspection.recordCounts.goals,
                    fields: "title, category, milestones",
                  },
                  {
                    key: "routineSchedules" as const,
                    labelEn: "Routine Schedules",
                    labelAr: "مواعيد الروتين المجدولة",
                    count: inspection.recordCounts.routines,
                    fields: "routine key, step titles, times",
                  },
                  {
                    key: "studyCommitments" as const,
                    labelEn: "Study Commitments",
                    labelAr: "الالتزامات الدراسية",
                    count: inspection.recordCounts.learning,
                    fields: "title, subject type",
                  },
                  {
                    key: "configuredTimezone" as const,
                    labelEn: "Configured Timezone",
                    labelAr: "المنطقة الزمنية المحلية",
                    count: 1,
                    fields: "timezone, local reference date",
                  },
                  {
                    key: "prayerTimes" as const,
                    labelEn: "Prayer Anchors (No worship logs)",
                    labelAr: "مواقيت الصلاة (دون سجل العبادات)",
                    count: inspection.recordCounts.prayerAnchors,
                    fields: "canonical prayer times only",
                  },
                ].map((src) => {
                  const isChecked = scope.sources[src.key];
                  return (
                    <button
                      key={src.key}
                      type="button"
                      onClick={() => toggleSource(src.key)}
                      className={`flex flex-col text-start p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? "border-pink-300 dark:border-pink-700 bg-pink-50/30 dark:bg-pink-950/20"
                          : "border-border/70 bg-card/60 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-xs text-ink">
                          {isAr ? src.labelAr : src.labelEn}
                        </span>
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                            isChecked
                              ? "bg-hotpink border-hotpink text-white"
                              : "border-border bg-surface"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-ink-light mt-1 font-mono">
                        {isAr ? `الحقول: ${src.fields}` : `Fields: ${src.fields}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strictly Excluded Private Modules */}
          <div className="rounded-2xl border border-border/80 bg-surface/50 p-3.5 space-y-2">
            <p className="text-xs font-bold text-ink flex items-center gap-1.5 text-danger">
              <ShieldAlert size={14} />
              {isAr ? "البيانات الخاصة المستثناة تماماً من الذكاء الاصطناعي:" : "Strictly Excluded Private Data:"}
            </p>
            <ul className="text-xs text-ink-light space-y-1 list-disc ps-4 leading-relaxed">
              {STRICT_EXCLUDED_MODULES.slice(0, 6).map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>

          {/* Privacy & Revocation Disclosure */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>
              {isAr
                ? "إلغاء الصلاحية يوقف إرسال أي سياق مستقبلياً فوراً. لن يؤثر ذلك على النصوص التي أرسلتِها أنتِ يدوياً في المحادثة سابقاً."
                : "Revoking permission immediately stops future context inclusion. It does not recall text manually sent in past conversation turns."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/80 px-5 py-3.5 bg-surface/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onRevoke}
            className="text-xs font-bold text-danger hover:underline cursor-pointer"
          >
            {isAr ? "إلغاء جميع الصلاحيات" : "Revoke All Permissions"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="grad-theme rounded-full px-5 py-2 text-xs font-bold text-white shadow-rose active:scale-95 transition-transform cursor-pointer"
          >
            {isAr ? "حفظ وإغلاق" : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
