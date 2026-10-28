import React, { useState, useEffect, memo } from "react";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Coins,
  Shield,
  Fingerprint,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  useApp,
  toMinorUnits,
  fromMinorUnits,
  type FinancialTransaction,
} from "@/lib/store";
import { hashPin, isBiometricAvailable } from "@/lib/financeSecurity";

export interface FinanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const FinanceSettingsModal = memo(function FinanceSettingsModal({
  isOpen,
  onClose,
  isAr,
  t,
}: FinanceSettingsModalProps) {
  if (!isOpen) return null;

  const { state, updateFinanceSettings, addFinancialTransaction } = useApp();
  const settings = state.financeSettings || {
    baseCurrency: "MAD",
    balancesHidden: false,
    hideOnBackground: false,
    financeLockEnabled: false,
    autoLockMinutes: 5,
  };

  const [currency, setCurrency] = useState(settings.baseCurrency || "MAD");
  const [balancesHidden, setBalancesHidden] = useState(Boolean(settings.balancesHidden));
  const [hideOnBackground, setHideOnBackground] = useState(Boolean(settings.hideOnBackground));
  const [financeLockEnabled, setFinanceLockEnabled] = useState(Boolean(settings.financeLockEnabled));
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes || 5);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(Boolean(settings.biometricEnabled));

  // PIN modal
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    isBiometricAvailable().then((avail) => setBiometricAvailable(avail));
  }, []);

  const handleSaveSettings = () => {
    updateFinanceSettings({
      baseCurrency: currency,
      balancesHidden,
      hideOnBackground,
      financeLockEnabled,
      autoLockMinutes,
      biometricEnabled: biometricAvailable && biometricEnabled,
    });
    onClose();
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setPinError(isAr ? "يجب أن يتكون الرمز من 4 أرقام" : "PIN must be exactly 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError(isAr ? "الرمزان غير متطابقين" : "PINs do not match");
      return;
    }

    const hashed = await hashPin(newPin);
    updateFinanceSettings({
      financeLockEnabled: true,
      pinHash: hashed,
    });
    setFinanceLockEnabled(true);
    setPinModalOpen(false);
    setNewPin("");
    setConfirmPin("");
    setPinError("");
  };

  // CSV Export
  const handleExportCSV = () => {
    const txs = state.financialTransactions || [];
    const headers = ["ID", "Type", "Status", "Category", "Merchant", "Date", "Amount", "Currency", "Note"];
    const rows = txs.map((tx) => {
      const leg = tx.legs[0];
      const amt = leg ? fromMinorUnits(leg.signedAmountMinor) : 0;
      return [
        tx.id,
        tx.type,
        tx.status,
        tx.categoryId,
        `"${(tx.merchantOrSource || "").replace(/"/g, '""')}"`,
        tx.localDate,
        amt,
        leg?.currency || settings.baseCurrency,
        `"${(tx.note || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ayxa_finance_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const handleExportJSON = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts: state.financeAccounts || [],
      transactions: state.financialTransactions || [],
      categories: state.financeCategories || [],
      budgets: state.financeBudgets || [],
      savingsGoals: state.savingsGoals || [],
      savingsContributions: state.savingsContributions || [],
      settings: state.financeSettings,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ayxa_finance_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas text-ink animate-fade-in overflow-y-auto">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3.5 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-ink hover:bg-surface/80 active:scale-90 transition-all"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-ink leading-tight">{t("tabSettings")}</h2>
            <p className="text-[11px] font-semibold text-ink-light">
              {isAr ? "العملة، الخصوصية وقفل الأمان" : "Currency, privacy & security lock"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveSettings}
          className="cursor-pointer flex items-center gap-1.5 rounded-2xl grad-theme px-3.5 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
        >
          <Check size={14} />
          <span>{isAr ? "حفظ" : "Save"}</span>
        </button>
      </header>

      {/* ── Body ── */}
      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-36">
        {/* Base Currency Section */}
        <div className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-hotpink" />
            <h3 className="text-xs font-bold text-ink">{isAr ? "العملة الأساسية" : "Base Currency"}</h3>
          </div>
          <p className="text-[11px] font-medium text-ink-light">
            {isAr
              ? "العملة الافتراضية لعرض إجمالي الرصيد والتقارير المالية."
              : "Default currency for net totals and reports."}
          </p>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full cursor-pointer rounded-xl bg-surface border border-border px-3 py-2.5 text-xs font-bold text-ink outline-none mt-2"
          >
            <option value="MAD">Moroccan Dirham (MAD د.م.)</option>
            <option value="USD">US Dollar (USD $)</option>
            <option value="EUR">Euro (EUR €)</option>
            <option value="GBP">British Pound (GBP £)</option>
            <option value="SAR">Saudi Riyal (SAR ر.س)</option>
            <option value="AED">UAE Dirham (AED د.إ)</option>
          </select>
        </div>

        {/* Privacy Toggles */}
        <div className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-hotpink" />
            <h3 className="text-xs font-bold text-ink">{isAr ? "الخصوصية وإخفاء الأرقام" : "Privacy & Visibility"}</h3>
          </div>

          <label className="flex items-center justify-between cursor-pointer pt-1">
            <div>
              <p className="text-xs font-bold text-ink">{isAr ? "إخفاء الأرصدة افتراضيًا" : "Mask Balances by Default"}</p>
              <p className="text-[10.5px] font-medium text-ink-light">
                {isAr ? "عرض '••••••' بدلاً من الأرقام الصريحة" : "Show '••••••' instead of raw amounts"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={balancesHidden}
              onChange={(e) => setBalancesHidden(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer border-t border-border/80 pt-2.5">
            <div>
              <p className="text-xs font-bold text-ink">{isAr ? "حجب الشاشة عند مغادرة التطبيق" : "Hide on App Switcher"}</p>
              <p className="text-[10.5px] font-medium text-ink-light">
                {isAr ? "إخفاء المعاينة عند الانتقال لتطبيقات أخرى" : "Obscure preview in recent apps"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={hideOnBackground}
              onChange={(e) => setHideOnBackground(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
          </label>
        </div>

        {/* Finance PIN & Biometric Lock */}
        <div className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-hotpink" />
            <h3 className="text-xs font-bold text-ink">{t("lockSettings")}</h3>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-bold text-ink">{isAr ? "تفعيل قفل المالية برمز PIN" : "Finance PIN Lock"}</p>
              <p className="text-[10.5px] font-medium text-ink-light">
                {settings.pinHash ? (isAr ? "رمز PIN مفعل ومحمي بتشفير SHA-256" : "PIN configured & hashed") : (isAr ? "لم يتم تعيين رمز PIN بعد" : "No PIN set yet")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPinModalOpen(true)}
              className="cursor-pointer rounded-xl bg-surface border border-border px-3 py-1.5 text-xs font-bold text-ink hover:bg-surface/80 active:scale-95 transition-all"
            >
              {settings.pinHash ? (isAr ? "تغيير PIN" : "Change PIN") : (isAr ? "تعيين PIN" : "Set PIN")}
            </button>
          </div>

          {biometricAvailable && (
            <label className="flex items-center justify-between cursor-pointer border-t border-border/80 pt-2.5">
              <div className="flex items-center gap-2">
                <Fingerprint size={16} className="text-purple-500" />
                <div>
                  <p className="text-xs font-bold text-ink">{isAr ? "فتح بالبصمة / Face ID" : "Biometric Unlock"}</p>
                  <p className="text-[10.5px] font-medium text-ink-light">
                    {isAr ? "استخدام المصادقة البيومترية للجهاز" : "Use device biometrics"}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => setBiometricEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-hotpink cursor-pointer"
              />
            </label>
          )}

          <div className="border-t border-border/80 pt-2.5">
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "مدة القفل التلقائي (بالدقائق)" : "Auto-lock Timeout (Minutes)"}
            </label>
            <select
              value={autoLockMinutes}
              onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
              className="w-full cursor-pointer rounded-xl bg-surface border border-border px-3 py-2 text-xs font-bold text-ink outline-none"
            >
              <option value={1}>1 {isAr ? "دقيقة" : "Minute"}</option>
              <option value={5}>5 {isAr ? "دقائق" : "Minutes"}</option>
              <option value={15}>15 {isAr ? "دقيقة" : "Minutes"}</option>
              <option value={30}>30 {isAr ? "دقيقة" : "Minutes"}</option>
            </select>
          </div>
        </div>

        {/* Data Export & Backup */}
        <div className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-hotpink" />
            <h3 className="text-xs font-bold text-ink">{isAr ? "تصدير ونسخ البيانات احتياطيًا" : "Data Export & Backup"}</h3>
          </div>
          <p className="text-[11px] font-medium text-ink-light">
            {isAr
              ? "بياناتكِ المالية محفوظة محليًا على هذا الجهاز فقط ولا ترسل إلى أي خادم."
              : "Financial data is stored strictly locally on your device and never uploaded to remote servers."}
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportCSV}
              className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-ink hover:bg-surface/80 active:scale-95 transition-all"
            >
              <Download size={13} />
              <span>{isAr ? "تصدير CSV" : "Export CSV"}</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-ink hover:bg-surface/80 active:scale-95 transition-all"
            >
              <Download size={13} />
              <span>{isAr ? "نسخة JSON" : "Backup JSON"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Set PIN Modal ── */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 shadow-rose-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-[15px] text-ink">{t("setNewPin")}</h3>
              <button
                type="button"
                onClick={() => setPinModalOpen(false)}
                className="cursor-pointer p-1 text-ink-light hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSetPin} className="space-y-3.5">
              {pinError && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 text-destructive text-xs font-bold">
                  <AlertCircle size={14} />
                  <span>{pinError}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-ink-light block mb-1">
                  {isAr ? "رمز PIN الجديد (4 أرقام)" : "Enter 4-digit PIN"}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••"
                  required
                  className="w-full text-center rounded-xl bg-surface px-3 py-2 text-lg font-extrabold text-ink border border-border outline-none focus:border-hotpink tracking-widest"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink-light block mb-1">
                  {isAr ? "تأكيد رمز PIN" : "Confirm 4-digit PIN"}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••"
                  required
                  className="w-full text-center rounded-xl bg-surface px-3 py-2 text-lg font-extrabold text-ink border border-border outline-none focus:border-hotpink tracking-widest"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-3 rounded-xl grad-theme text-white text-xs font-extrabold shadow-rose-sm active:scale-95 transition-all"
                >
                  {isAr ? "تأكيد وحفظ" : "Save PIN"}
                </button>
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
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
