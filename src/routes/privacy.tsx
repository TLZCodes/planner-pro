import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AYXA Planner Pro" },
      {
        name: "description",
        content: "Privacy Policy for AYXA Planner Pro (com.ayxaplanner.app).",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
            <ShieldCheck size={20} className="text-hotpink" />
            <h1 className="font-display text-base font-extrabold">
              {isAr ? "سياسة الخصوصية — AYXA Planner Pro" : "Privacy Policy — AYXA Planner Pro"}
            </h1>
          </div>
        </header>

        <article className="rounded-3xl bg-card border border-border/70 p-5 space-y-4 text-xs leading-relaxed text-ink">
          <p className="text-[11px] font-bold text-ink-light">
            {isAr ? "آخر تحديث: نوفمبر 2026" : "Last Updated: November 2026"}
          </p>

          <section className="space-y-1.5">
            <h2 className="text-sm font-extrabold text-hotpink">
              {isAr ? "1. حفظ البيانات محلياً وخصوصيتكِ أولاً" : "1. Local-First Privacy"}
            </h2>
            <p>
              {isAr
                ? "تم تصميم تطبيق AYXA Planner Pro لحماية خصوصيتكِ. يتم تخزين مهامكِ وعاداتكِ ومذكراتكِ وبيانات العافية والمالية محلياً على جهازكِ. لا نقوم ببيع أو مشاركة بياناتكِ الشخصية مع أي أطراف إعلانية."
                : "AYXA Planner Pro is designed with a local-first privacy architecture. Your tasks, habits, routines, journals, wellness logs, and financial entries are stored locally on your device. We never sell or share your personal data with third-party advertisers."}
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-extrabold text-hotpink">
              {isAr ? "2. المشتريات والاشتراكات عبر Google Play" : "2. Google Play Billing & Subscriptions"}
            </h2>
            <p>
              {isAr
                ? "تتم معالجة جميع المدفوعات والاشتراكات (الباقة الشهرية، السنوية، أو مدى الحياة) بشكل آمن ومباشر عبر Google Play Billing و RevenueCat. لا يصل تطبيق AYXA Planner Pro ولا يحتفظ بأرقام بطاقاتكِ البنكية أبداً."
                : "All AYXA Pro subscriptions and lifetime purchases are processed securely by Google Play Billing and managed via RevenueCat. AYXA Planner Pro never collects, views, or stores your credit card or payment credentials."}
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-extrabold text-hotpink">
              {isAr ? "3. المساعد الذكي AYXA Muse Pro" : "3. AYXA Muse Pro AI Assistant"}
            </h2>
            <p>
              {isAr
                ? "عند إرسال رسالة إلى المساعد الذكي، يتم إرسال النص المطلوب فقط لتوليد خطتكِ وردّكِ المخصص. يمكنكِ التحكم الكامل في صلاحية الوصول لبيانات مخططكِ وإيقافها في أي وقت من إعدادات المساعد."
                : "When you chat with AYXA Muse Pro, only your message and the planning context you authorize are transmitted securely over HTTPS to generate your personalized reply. You can disable full planner context at any time inside AI Settings."}
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-extrabold text-hotpink">
              {isAr ? "4. حذف البيانات والتواصل" : "4. Data Deletion & Contact"}
            </h2>
            <p>
              {isAr
                ? "يمكنكِ تصدير نسخة احتياطية من بياناتكِ أو مسح جميع بياناتكِ بالكامل في أي وقت من صفحة الإعدادات داخل التطبيق. للاستفسارات المتعلقة بالخصوصية يرجى التواصل عبر البريد الإلكتروني للدعم المسجل في صفحة التطبيق على Google Play."
                : "You can export or permanently delete all your data at any time inside Settings -> Data & Storage. For privacy inquiries or account deletion requests, please contact our support email listed on the Google Play Store page."}
            </p>
          </section>
        </article>
      </div>
    </MobileShell>
  );
}
