import { useState } from "react";
import { Sparkles, Check, Zap, Gift, ShieldCheck, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

interface AiCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiCreditsModal({ isOpen, onClose }: AiCreditsModalProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const { state, addAiCredits } = useApp();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCredits = typeof state.aiCredits === "number" ? state.aiCredits : 50;

  const packages = [
    {
      id: "starter",
      titleAr: "باقة البداية 🌸",
      titleEn: "Starter Pack 🌸",
      credits: 50,
      bonus: 0,
      priceAr: "19 ر.س",
      priceEn: "$4.99",
      descAr: "مناسبة للمهام اليومية السريعة والبدايات الهادئة.",
      descEn: "Great for quick daily check-ins and starter plans.",
    },
    {
      id: "pro",
      titleAr: "باقة الإنجاز ⭐ (الأكثر اختياراً)",
      titleEn: "Pro Planner ⭐ (Most Popular)",
      credits: 200,
      bonus: 30,
      priceAr: "49 ر.س",
      priceEn: "$12.99",
      descAr: "تخطيط عميق للأهداف، الروتين بين الصلوات، وتوجيه العقلية.",
      descEn: "Deep goal breakdown, daily routines, and mindset coaching.",
      highlight: true,
    },
    {
      id: "unlimited",
      titleAr: "باقة البركة والوفرة 🌿",
      titleEn: "Barakah Mastery 🌿",
      credits: 500,
      bonus: 100,
      priceAr: "99 ر.س",
      priceEn: "$24.99",
      descAr: "مرافقة ذكية مستمرة لجميع أركان حياتكِ ومشاريعكِ.",
      descEn: "Comprehensive AI companion for all your projects & life areas.",
    },
  ];

  const handleRecharge = (amount: number, packageName: string) => {
    addAiCredits(amount);
    setSuccessMsg(
      isAr
        ? `✨ مبارك! تمت إضافة ${amount} نقطة بنجاح إلى رصيدكِ (${packageName})`
        : `✨ Success! Added ${amount} credits to your balance (${packageName})`
    );
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-pink-200/80 dark:border-pink-900/60 p-6 shadow-2xl text-ink max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-4 end-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface hover:bg-border/60 text-ink transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-hotpink to-pink-300 text-white shadow-rose mx-auto">
            <Sparkles size={24} />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">
            {isAr ? "رصيد وباقات الذكاء الاصطناعي ✨" : "AI Planner Credits & Packages ✨"}
          </h2>
          <p className="text-xs text-ink-light max-w-xs mx-auto">
            {isAr
              ? "استثمري في وضوح خطواتكِ مع رصيد ذكي للتخطيط وتنظيم الروتين والعقلية."
              : "Empower your daily clarity with AI credits for routines, tasks, and mindset guidance."}
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="mt-4 rounded-2xl border border-pink-200/90 dark:border-pink-900/60 bg-pink-50/60 dark:bg-pink-950/20 p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider">
              {isAr ? "رصيدكِ الحالي:" : "Current Balance:"}
            </p>
            <p className="text-2xl font-black text-hotpink mt-0.5">
              {currentCredits} <span className="text-xs font-semibold text-ink">{isAr ? "نقطة" : "Credits"}</span>
            </p>
          </div>
          <div className="text-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              <Zap size={12} className="text-emerald-600" />
              {isAr ? "1 نقطة لكل رسالة" : "1 credit per query"}
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mt-3 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-bounce-subtle">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <p className="font-bold">{successMsg}</p>
          </div>
        )}

        {/* Instant Test Top-up Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleRecharge(50, isAr ? "شحن تجريبي مجاني" : "Free Test Top-up")}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <Gift size={15} />
            <span>
              {isAr
                ? "⚡ شحن رصيد تجريبي مجاني (+50 نقطة فورية للاختبار)"
                : "⚡ Free Instant Test Top-up (+50 Credits)"}
            </span>
          </button>
        </div>

        {/* Packages Grid */}
        <div className="mt-4 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-light">
            {isAr ? "باقات النقاط الرسمية:" : "Official Credit Packages:"}
          </p>
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl border p-3.5 transition-all flex items-center justify-between gap-3 ${
                pkg.highlight
                  ? "border-hotpink bg-pink-50/40 dark:bg-pink-950/30 shadow-xs ring-1 ring-hotpink/30"
                  : "border-border/80 bg-surface/50 hover:border-pink-300"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-ink truncate">
                    {isAr ? pkg.titleAr : pkg.titleEn}
                  </h3>
                  {pkg.bonus > 0 && (
                    <span className="text-[10px] font-bold text-hotpink bg-white/90 dark:bg-card px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-900">
                      +{pkg.bonus} {isAr ? "هدية" : "Bonus"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink-light mt-0.5 line-clamp-1">
                  {isAr ? pkg.descAr : pkg.descEn}
                </p>
                <p className="text-xs font-bold text-hotpink mt-1">
                  {pkg.credits + pkg.bonus} {isAr ? "نقطة إجمالاً" : "Total Credits"}
                </p>
              </div>

              <div className="text-end shrink-0">
                <p className="font-extrabold text-sm text-ink mb-1">
                  {isAr ? pkg.priceAr : pkg.priceEn}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    handleRecharge(
                      pkg.credits + pkg.bonus,
                      isAr ? pkg.titleAr : pkg.titleEn
                    )
                  }
                  className="px-3.5 py-1.5 rounded-full bg-hotpink text-white font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-rose cursor-pointer"
                >
                  {isAr ? "شحن الآن" : "Recharge"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Footer */}
        <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-center gap-1.5 text-[11px] text-ink-light text-center">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>
            {isAr
              ? "النقاط تظل محفوظة دائماً في حسابكِ دون تاريخ انتهاء صلاحية."
              : "Your credits never expire and remain safely stored in your account."}
          </span>
        </div>
      </div>
    </div>
  );
}
