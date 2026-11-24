import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AYXA Planner Pro" },
      {
        name: "description",
        content: "Terms of Service and Subscription Terms for AYXA Planner Pro.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  return (
    <MobileShell hideFooter hideTabs>
      <div className="min-h-screen bg-canvas text-ink px-4 py-5 space-y-5">
        <header className="flex items-center gap-3 border-b border-border/70 pb-3.5">
          <button
            type="button"
            onClick={() => navigate({ to: "/more" })}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-ink hover:border-hotpink cursor-pointer"
          >
            <ArrowLeft size={16} className="rtl:rotate-180" />
          </button>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-hotpink" />
            <h1 className="font-display text-base font-extrabold">
              {isAr ? "شروط الاستخدام — AYXA Planner Pro" : "Terms of Service — AYXA Planner Pro"}
            </h1>
          </div>
        </header>

        <article className="rounded-3xl bg-card border border-border/70 p-5 space-y-4 text-xs leading-relaxed text-ink">
          <p className="text-[11px] font-bold text-ink-light">
            {isAr ? "آخر تحديث: نوفمبر 2026" : "Last Updated: November 2026"}
          </p>

          <section className="space-y-1.5">
            <h2 className="text-sm font-extrabold text-hotpink">
              {isAr ? "1. اشتراكات AYXA Pro والتجديد التلقائي" : "1. AYXA Pro Subscriptions & Auto-Renewal"}
            </h2>
            <p>
              {isAr
                ? "يوفر AYXA Planner Pro خطط اشتراك اختيارية (شهري، سنوي مع فترة تجريبية مجانية 7 أيام، وعضوية دائمة مدى الحياة). يتم خصم الرسوم عبر حساب Google Play الخاص بكِ عند تأكيد الشراء، ويتجدد الاشتراك تلقائياً ما لم يتم إلغاؤه قبل 24 ساعة على الأقل من نهاية الفترة الحالية عبر إعدادات اشتراكات Google Play."
                : "AYXA Planner Pro offers optional premium plans (Monthly, Yearly with a 7-day free trial, and Royal Lifetime). Payment is charged to your Google Play account upon confirmation. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period in your Google Play Subscriptions settings."}
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-extrabold text-hotpink">
              {isAr ? "2. الاستخدام الشخصي والتخطيط الذكي" : "2. Personal Planning & AI Guidance"}
            </h2>
            <p>
              {isAr
                ? "يوفر تطبيق AYXA Planner Pro ومساعد AYXA Muse Pro أدوات للإنتاجية وتنظيم الوقت والروتين والعناية الذاتية فقط، ولا يُعد بديلاً عن الاستشارات الطبية أو المالية أو القانونية أو الشرعية المتخصصة."
                : "AYXA Planner Pro and AYXA Muse Pro provide personal productivity, organization, and self-care planning tools. AI-generated suggestions are for informational and organizational purposes only and do not constitute medical, financial, or legal advice."}
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-extrabold text-hotpink">
              {isAr ? "3. سياسة الاسترداد" : "3. Refunds & Cancellation"}
            </h2>
            <p>
              {isAr
                ? "تخضع جميع طلبات إلغاء الاشتراك واسترداد المبالغ لسياسات Google Play الرسمية، ويمكنكِ إدارة اشتراككِ في أي وقت مباشرة من متجر Google Play."
                : "All subscription cancellations and refund requests are governed by Google Play's official refund policies and can be managed directly inside Google Play Store -> Payments & Subscriptions."}
            </p>
          </section>
        </article>
      </div>
    </MobileShell>
  );
}
