import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Crown,
  Sparkles,
  X,
  RefreshCw,
  ShieldCheck,
  Palette,
  Briefcase,
  Plane,
  Cloud,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  DEFAULT_PRO_PLANS,
  fetchProOfferings,
  purchaseProPlan,
  restoreProPurchases,
  isNativeBillingConfigured,
  type ProPlanId,
  type ProPlanOffering,
} from "@/lib/billingEngine";
import { cn } from "@/lib/utils";

interface ProPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFeature?: string;
}

export function ProPaywallModal({
  isOpen,
  onClose,
  sourceFeature,
}: ProPaywallModalProps) {
  const { lang, dir } = useLang();
  const { state, setProSubscription } = useApp();
  const isAr = lang === "ar";
  const isPro = Boolean(state.user?.isPro || state.proSubscription?.isPro);

  const [plans, setPlans] = useState<ProPlanOffering[]>(DEFAULT_PRO_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<ProPlanId>("yearly");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    void fetchProOfferings().then((loaded) => {
      if (loaded.length > 0) setPlans(loaded);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPlan =
    plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handlePurchase = async () => {
    if (isPurchasing || !selectedPlan) return;
    setIsPurchasing(true);
    setStatusMessage(null);

    const res = await purchaseProPlan(selectedPlan);
    setIsPurchasing(false);

    if (res.cancelled) {
      return;
    }

    if (res.success && res.subscription) {
      setProSubscription(res.subscription);
      setStatusMessage({
        type: "success",
        text: isAr
          ? "مبارك لكِ! تم تفعيل عضوية AYXA Pro بنجاح 👑✨"
          : "Welcome to AYXA Pro! All luxury features are now unlocked 👑✨",
      });
      setTimeout(() => {
        onClose();
      }, 1100);
    } else {
      setStatusMessage({
        type: "error",
        text:
          res.error ||
          (isAr
            ? "تعذر إتمام الاشتراك حالياً. يرجى المحاولة مجدداً."
            : "Could not complete purchase right now. Please try again."),
      });
    }
  };

  const handleRestore = async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    setStatusMessage(null);

    const res = await restoreProPurchases();
    setIsRestoring(false);

    if (res.isPro && res.subscription) {
      setProSubscription(res.subscription);
      setStatusMessage({
        type: "success",
        text: isAr
          ? "تمت استعادة اشتراككِ في AYXA Pro بنجاح 👑"
          : "Your AYXA Pro subscription has been restored 👑",
      });
      setTimeout(() => onClose(), 1000);
    } else {
      setStatusMessage({
        type: "info",
        text: isAr
          ? "لم يتم العثور على اشتراك نشط مرتبط بحساب المتجر."
          : res.error || "No active subscription found for this store account.",
      });
    }
  };

  const benefits = [
    {
      icon: Sparkles,
      ar: "مساعدة AYXA Muse Pro بلا حدود (0 استهلاك نقاط + الخطة الملكية)",
      en: "Unlimited AYXA Muse Pro AI (Zero credit limits + Royal Masterplan)",
    },
    {
      icon: Palette,
      ar: "جميع الثيمات الفاخرة (الزمردي، اللافندر، الذهبي، النعناع، والمحيط)",
      en: "All 6 Luxury Aesthetic Themes (Emerald, Lavender, Gold, Mint & Ocean)",
    },
    {
      icon: Briefcase,
      ar: "استوديو الأعمال والمشاريع (العملاء، الفواتير، والأرباح)",
      en: "Business & Projects Studio (Clients, Invoices & Revenue)",
    },
    {
      icon: Plane,
      ar: "استوديو السفر وقائمة الأحلام وتنظيم الرحلات",
      en: "Travel Studio, Dream Bucket List & Smart Itineraries",
    },
    {
      icon: Cloud,
      ar: "النسخ الاحتياطي السحابي الأولوي وتصدير ملفات PDF و JSON",
      en: "Priority Cloud Backup & Full PDF / JSON Exports",
    },
  ];

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3.5 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md max-h-[92dvh] flex flex-col rounded-3xl border border-pink-300/70 dark:border-pink-800/60 bg-canvas text-ink shadow-2xl overflow-hidden">
        {/* Luxury Gradient Hero Header */}
        <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 px-5 pt-5 pb-6 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3.5 end-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs shadow-lg">
              <Crown size={22} className="text-amber-200" />
            </span>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase">
                {isAr ? "العضوية الملكية ✨" : "LUXURY MEMBERSHIP ✨"}
              </span>
              <h2 className="font-display text-lg font-extrabold leading-tight mt-0.5">
                {isAr ? "ارتقي بتجربتكِ مع AYXA Pro 👑" : "Unlock AYXA Planner Pro 👑"}
              </h2>
            </div>
          </div>

          {sourceFeature && (
            <p className="mt-2.5 rounded-xl bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-pink-50">
              {isAr
                ? `افتحي ميزة "${sourceFeature}" وجميع مزايا AYXA Pro الفاخرة`
                : `Unlock "${sourceFeature}" and every luxury feature inside AYXA Pro`}
            </p>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {isPro && (
            <div className="rounded-2xl border border-emerald-400/50 bg-emerald-500/10 p-3 text-center">
              <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                {isAr
                  ? "👑 عضويتكِ في AYXA Pro نشطة حالياً — استمتعي بجميع المزايا بلا حدود!"
                  : "👑 Your AYXA Pro membership is active — enjoy unlimited access!"}
              </p>
            </div>
          )}

          {/* Benefits List */}
          <div className="space-y-2">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-2xl bg-card/80 border border-pink-200/50 dark:border-pink-900/40 px-3 py-2.5"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-hotpink">
                    <Icon size={13} />
                  </span>
                  <span className="text-xs font-semibold text-ink leading-snug">
                    {isAr ? b.ar : b.en}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Subscription Plan Cards */}
          <div className="space-y-2.5 pt-1">
            {plans.map((plan) => {
              const active = selectedPlanId === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={cn(
                    "relative w-full text-start rounded-2xl border-2 p-3.5 transition-all cursor-pointer",
                    active
                      ? "border-hotpink bg-gradient-to-r from-pink-500/12 via-rose-500/8 to-transparent shadow-rose-sm"
                      : "border-border/70 bg-card/70 hover:border-pink-300/70"
                  )}
                >
                  {(plan.badgeEn || plan.badgeAr) && (
                    <span className="absolute -top-2.5 end-3 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 px-2.5 py-0.5 text-[9px] font-extrabold text-white shadow-sm">
                      {isAr ? plan.badgeAr : plan.badgeEn}
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                          active
                            ? "border-hotpink bg-hotpink text-white"
                            : "border-ink-light/40"
                        )}
                      >
                        {active && <Check size={12} strokeWidth={3} />}
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-ink">
                          {isAr ? plan.titleAr : plan.titleEn}
                        </p>
                        <p className="text-[10.5px] text-ink-light mt-0.5">
                          {isAr ? plan.subtextAr : plan.subtextEn}
                        </p>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <p className="text-sm font-extrabold text-hotpink">
                        {plan.priceString}
                      </p>
                      <p className="text-[10px] font-semibold text-ink-light">
                        {isAr ? plan.periodAr : plan.periodEn}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {statusMessage && (
            <div
              className={cn(
                "rounded-2xl px-3.5 py-2.5 text-xs font-bold text-center",
                statusMessage.type === "success"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40"
                  : statusMessage.type === "error"
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-400/40"
                    : "bg-pink-500/10 text-hotpink border border-pink-300/40"
              )}
            >
              {statusMessage.text}
            </div>
          )}

          {/* CTA Button */}
          <button
            type="button"
            disabled={isPurchasing}
            onClick={() => void handlePurchase()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 py-3.5 px-5 text-sm font-extrabold text-white shadow-rose hover:opacity-95 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
          >
            <Crown size={16} />
            <span>
              {isPurchasing
                ? isAr
                  ? "جارٍ الاتصال بمتجر التطبيقات..."
                  : "Connecting to Store..."
                : selectedPlan?.hasFreeTrial
                  ? isAr
                    ? "ابدئي التجربة المجانية 7 أيام ✨"
                    : "Start 7-Day Free Trial ✨"
                  : isAr
                    ? `اشتركي الآن (${selectedPlan?.priceString})`
                    : `Continue (${selectedPlan?.priceString})`}
            </span>
          </button>

          {!isNativeBillingConfigured() && (
            <p className="text-center text-[10px] text-ink-light bg-surface/80 rounded-xl px-3 py-1.5">
              {isAr
                ? "وضع المعاينة المحلية: يتم فتح AYXA Pro للتجربة فوراً، وسيعمل عبر Google Play Billing تلقائياً عند التثبيت من المتجر."
                : "Web Preview Mode: activates AYXA Pro for testing. Uses Google Play Billing automatically on Android builds."}
            </p>
          )}

          {/* Restore Purchases & Legal Compliance Footer (Mandatory for Google Play) */}
          <div className="pt-1 space-y-2 text-center">
            <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-ink-light">
              <button
                type="button"
                onClick={() => void handleRestore()}
                disabled={isRestoring}
                className="inline-flex items-center gap-1 hover:text-hotpink transition-colors cursor-pointer"
              >
                <RefreshCw size={11} className={isRestoring ? "animate-spin" : ""} />
                <span>{isAr ? "استعادة المشتريات" : "Restore Purchases"}</span>
              </button>
              <span>·</span>
              <Link
                to="/terms"
                onClick={onClose}
                className="hover:text-hotpink transition-colors"
              >
                {isAr ? "الشروط" : "Terms"}
              </Link>
              <span>·</span>
              <Link
                to="/privacy"
                onClick={onClose}
                className="hover:text-hotpink transition-colors"
              >
                {isAr ? "الخصوصية" : "Privacy"}
              </Link>
            </div>

            <p className="flex items-center justify-center gap-1 text-[10px] text-ink-light/80 leading-relaxed">
              <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
              <span>
                {isAr
                  ? "دفع آمن عبر Google Play. يتجدد الاشتراك تلقائياً ويمكنكِ إلغاؤه في أي وقت من إعدادات حسابكِ."
                  : "Secured by Google Play. Subscriptions auto-renew unless cancelled 24h before renewal in Play Store settings."}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
