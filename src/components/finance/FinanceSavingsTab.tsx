import React, { useState, memo } from "react";
import {
  PiggyBank,
  Plus,
  ArrowRightLeft,
  Calendar,
  Wallet,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  toMinorUnits,
  calculateSavingsProgressMinor,
  createTransferTransaction,
  type SavingsGoal,
  type SavingsContribution,
} from "@/lib/store";
import { ProgressBar } from "@/components/kit";

export interface FinanceSavingsTabProps {
  isAr: boolean;
  t: (key: string) => string;
}

export const FinanceSavingsTab = memo(function FinanceSavingsTab({
  isAr,
  t,
}: FinanceSavingsTabProps) {
  const {
    state,
    addSavingsGoal,
    updateSavingsGoal,
    addSavingsContribution,
    addFinancialTransaction,
  } = useApp();

  const goals = state.savingsGoals || [];
  const contributions = state.savingsContributions || [];
  const accounts = state.financeAccounts || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  // Modals
  const [newGoalModalOpen, setNewGoalModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState<SavingsGoal | null>(null);

  // New Goal Form State
  const [goalName, setGoalName] = useState("");
  const [goalIcon, setGoalIcon] = useState("🛡️");
  const [goalTargetStr, setGoalTargetStr] = useState("");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [goalLinkedAcc, setGoalLinkedAcc] = useState<string>("");

  // Contribute Form State
  const [contribAmountStr, setContribAmountStr] = useState("");
  const [contribMode, setContribMode] = useState<"account_transfer" | "virtual_allocation">("account_transfer");
  const [contribSourceAcc, setContribSourceAcc] = useState<string>(accounts[0]?.id || "");
  const [contribDestAcc, setContribDestAcc] = useState<string>("");
  const [contribNote, setContribNote] = useState("");

  const handleOpenContribute = (goal: SavingsGoal) => {
    setSelectedGoalForContrib(goal);
    setContribAmountStr("");
    setContribNote("");
    setContribMode("account_transfer");
    setContribSourceAcc(accounts[0]?.id || "");
    setContribDestAcc(goal.linkedAccountId || accounts[1]?.id || accounts[0]?.id || "");
    setContributeModalOpen(true);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || !goalTargetStr.trim()) return;

    const targetMinor = toMinorUnits(goalTargetStr);
    addSavingsGoal({
      name: goalName.trim(),
      icon: goalIcon,
      currency: baseCurrency,
      targetAmountMinor: targetMinor,
      targetDate: goalTargetDate || undefined,
      linkedAccountId: goalLinkedAcc || undefined,
      status: "active",
    });

    setGoalName("");
    setGoalTargetStr("");
    setGoalTargetDate("");
    setGoalLinkedAcc("");
    setNewGoalModalOpen(false);
  };

  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForContrib || !contribAmountStr.trim()) return;

    const amtMinor = toMinorUnits(contribAmountStr);
    const today = new Date().toISOString().slice(0, 10);

    // If real transfer mode and accounts are distinct, generate the transfer in canonical ledger
    let txId: string | undefined = undefined;
    if (contribMode === "account_transfer" && contribSourceAcc && contribDestAcc && contribSourceAcc !== contribDestAcc) {
      const transferTx = createTransferTransaction({
        sourceAccountId: contribSourceAcc,
        destinationAccountId: contribDestAcc,
        amountMinor: amtMinor,
        currency: baseCurrency,
        localDate: today,
        merchantOrSource: `Savings: ${selectedGoalForContrib.name}`,
        note: contribNote || `Deposit toward ${selectedGoalForContrib.name}`,
      });
      addFinancialTransaction(transferTx);
      txId = transferTx.id;
    }

    addSavingsContribution({
      savingsGoalId: selectedGoalForContrib.id,
      mode: contribMode,
      transactionId: txId,
      sourceAccountId: contribSourceAcc,
      amountMinor: amtMinor,
      currency: baseCurrency,
      localDate: today,
      note: contribNote,
    });

    setContributeModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* ── Top Header & Add Goal Button ── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold text-ink">{t("savingsTitle")}</h2>
          <p className="text-[11px] font-medium text-ink-light">{t("savingsSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setNewGoalModalOpen(true)}
          className="cursor-pointer flex items-center gap-1 rounded-2xl grad-theme px-3.5 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>{t("addSavingsGoal")}</span>
        </button>
      </div>

      {/* ── Goals Grid / List ── */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-ink-light/50 mb-2">
            <PiggyBank size={24} />
          </div>
          <p className="text-xs font-bold text-ink">{t("noSavingsYet")}</p>
          <p className="text-[11px] font-medium text-ink-light mt-1 max-w-xs leading-relaxed">
            {t("savingsSubtitle")}
          </p>
          <button
            type="button"
            onClick={() => setNewGoalModalOpen(true)}
            className="cursor-pointer mt-3.5 flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>{t("addSavingsGoal")}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const prog = calculateSavingsProgressMinor(g, contributions);
            const isCompleted = prog.currentAmountMinor >= prog.targetAmountMinor;

            return (
              <div
                key={g.id}
                className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{g.icon || "🎯"}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-ink">{g.name}</h3>
                        {isCompleted && (
                          <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[9.5px] font-bold">
                            <CheckCircle2 size={10} /> Completed
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] font-semibold text-ink-light mt-0.5">
                        {g.targetDate ? `${isAr ? "الموعد المستهدف:" : "Target:"} ${g.targetDate}` : isAr ? "هدف مفتوح" : "Ongoing Fund"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenContribute(g)}
                    className="cursor-pointer flex items-center gap-1 rounded-xl bg-surface border border-border px-3 py-1.5 text-[11px] font-bold text-ink hover:bg-surface/80 active:scale-95 transition-all"
                  >
                    <Plus size={12} />
                    <span>{t("contribute")}</span>
                  </button>
                </div>

                {/* Progress Bar */}
                <ProgressBar
                  value={prog.pct}
                  className="h-2.5"
                  barClass={isCompleted ? "bg-emerald-500" : "grad-theme"}
                />

                <div className="flex items-center justify-between text-[11px] font-semibold text-ink-light">
                  <span>
                    {formatMoney(prog.currentAmountMinor, g.currency || baseCurrency, isHidden, "en-US", isAr)} {t("savedOf")}{" "}
                    {formatMoney(prog.targetAmountMinor, g.currency || baseCurrency, isHidden, "en-US", isAr)}
                  </span>
                  <span className="font-mono font-bold text-ink">
                    {prog.pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── New Goal Modal ── */}
      {newGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-5 shadow-rose-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-[15px] text-ink">{t("addSavingsGoal")}</h3>
              <button
                type="button"
                onClick={() => setNewGoalModalOpen(false)}
                className="cursor-pointer p-1 text-ink-light hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div className="flex gap-2">
                <div className="w-16">
                  <label className="text-[11px] font-bold text-ink-light block mb-1">
                    {isAr ? "أيقونة" : "Icon"}
                  </label>
                  <input
                    value={goalIcon}
                    onChange={(e) => setGoalIcon(e.target.value)}
                    className="w-full rounded-xl bg-surface px-2.5 py-2 text-center text-base border border-border outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-ink-light block mb-1">
                    {isAr ? "اسم الهدف / الصندوق" : "Goal / Fund Name"}
                  </label>
                  <input
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder={isAr ? "مثال: صندوق الطوارئ، السفر، السيارة..." : "e.g. Emergency, Trip, Car..."}
                    required
                    className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink-light block mb-1">
                  {t("targetAmount")} ({baseCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={goalTargetStr}
                  onChange={(e) => setGoalTargetStr(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink-light block mb-1">
                  {isAr ? "الموعد المستهدف (اختياري)" : "Target Date (Optional)"}
                </label>
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink"
                />
              </div>

              {accounts.length > 0 && (
                <div>
                  <label className="text-[11px] font-bold text-ink-light block mb-1">
                    {isAr ? "ربط بحساب ادخار مخصص (اختياري)" : "Link Dedicated Account (Optional)"}
                  </label>
                  <select
                    value={goalLinkedAcc}
                    onChange={(e) => setGoalLinkedAcc(e.target.value)}
                    className="w-full cursor-pointer rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none"
                  >
                    <option value="">{isAr ? "بدون ربط حساب محدد" : "No specific account"}</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.icon} {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-3 rounded-xl grad-theme text-white text-xs font-extrabold shadow-rose-sm active:scale-95 transition-all"
                >
                  {isAr ? "حفظ الهدف" : "Create Goal"}
                </button>
                <button
                  type="button"
                  onClick={() => setNewGoalModalOpen(false)}
                  className="cursor-pointer py-3 px-4 rounded-xl bg-surface border border-border text-xs font-bold text-ink-light hover:text-ink active:scale-95"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Contribute Modal ── */}
      {contributeModalOpen && selectedGoalForContrib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-5 shadow-rose-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-[15px] text-ink">{t("contribute")}</h3>
                <p className="text-[11px] font-semibold text-ink-light">
                  {selectedGoalForContrib.icon} {selectedGoalForContrib.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContributeModalOpen(false)}
                className="cursor-pointer p-1 text-ink-light hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContribution} className="space-y-3.5">
              {/* Contribution Mode Toggle */}
              <div className="flex rounded-2xl bg-surface p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setContribMode("account_transfer")}
                  className={`cursor-pointer flex-1 rounded-xl py-2 text-[10.5px] font-bold transition-all ${
                    contribMode === "account_transfer"
                      ? "grad-theme text-white shadow-xs"
                      : "text-ink-light hover:text-ink"
                  }`}
                >
                  {t("accountTransferMode")}
                </button>
                <button
                  type="button"
                  onClick={() => setContribMode("virtual_allocation")}
                  className={`cursor-pointer flex-1 rounded-xl py-2 text-[10.5px] font-bold transition-all ${
                    contribMode === "virtual_allocation"
                      ? "grad-theme text-white shadow-xs"
                      : "text-ink-light hover:text-ink"
                  }`}
                >
                  {t("virtualAllocationMode")}
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink-light block mb-1">
                  {isAr ? "المبلغ المودع" : "Contribution Amount"} ({baseCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={contribAmountStr}
                  onChange={(e) => setContribAmountStr(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink font-mono text-base"
                />
              </div>

              {contribMode === "account_transfer" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10.5px] font-bold text-ink-light block mb-1">
                      {isAr ? "من حساب" : "From Account"}
                    </label>
                    <select
                      value={contribSourceAcc}
                      onChange={(e) => setContribSourceAcc(e.target.value)}
                      className="w-full cursor-pointer rounded-xl bg-surface px-2.5 py-2 text-xs font-bold text-ink border border-border outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.icon} {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-ink-light block mb-1">
                      {isAr ? "إلى حساب الادخار" : "To Account"}
                    </label>
                    <select
                      value={contribDestAcc}
                      onChange={(e) => setContribDestAcc(e.target.value)}
                      className="w-full cursor-pointer rounded-xl bg-surface px-2.5 py-2 text-xs font-bold text-ink border border-border outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.icon} {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-ink-light block mb-1">
                  {isAr ? "ملاحظة خاصة (اختياري)" : "Private Note (Optional)"}
                </label>
                <input
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  placeholder={isAr ? "مثال: جزء من مكافأة العمل" : "e.g. Part of monthly savings"}
                  className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-3 rounded-xl grad-theme text-white text-xs font-extrabold shadow-rose-sm active:scale-95 transition-all"
                >
                  {isAr ? "تسجيل الإيداع" : "Save Contribution"}
                </button>
                <button
                  type="button"
                  onClick={() => setContributeModalOpen(false)}
                  className="cursor-pointer py-3 px-4 rounded-xl bg-surface border border-border text-xs font-bold text-ink-light hover:text-ink active:scale-95"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});
