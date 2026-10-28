import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLang } from "@/lib/i18n";
import { Shield, FileText, Lock, Sparkles, CheckCircle2 } from "lucide-react";

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "terms" | "privacy";
}

export function LegalModal({
  open,
  onOpenChange,
  defaultTab = "terms",
}: LegalModalProps) {
  const { lang, t } = useLang();
  const [tab, setTab] = useState<string>(defaultTab);

  const isAr = lang === "ar";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] max-h-[85vh] flex flex-col p-5 rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
        <DialogHeader className="text-start pb-2 border-b border-border/40">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-full grad-theme flex items-center justify-center text-white shadow-xs">
              <Shield className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold font-display tracking-tight text-foreground">
              {isAr ? "الخصوصية والشروط" : "Privacy & Terms"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {isAr
              ? "التزامنا الواضح والشفاف بأمان بياناتكِ وخصوصيتكِ التامة في AYXA Planner."
              : "Our transparent commitment to your privacy, data security, and control in AYXA Planner."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0 pt-2">
          <TabsList className="grid grid-cols-2 rounded-2xl bg-muted/60 p-1 mb-3">
            <TabsTrigger
              value="terms"
              className="rounded-xl text-xs font-semibold py-2 transition-all data-[state=active]:grad-theme data-[state=active]:text-white data-[state=active]:shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 inline-block ltr:mr-1.5 rtl:ml-1.5" />
              {t("termsOfService")}
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="rounded-xl text-xs font-semibold py-2 transition-all data-[state=active]:grad-theme data-[state=active]:text-white data-[state=active]:shadow-xs"
            >
              <Lock className="h-3.5 w-3.5 inline-block ltr:mr-1.5 rtl:ml-1.5" />
              {t("privacyPolicy")}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4 text-foreground/85 leading-relaxed">
            <TabsContent value="terms" className="m-0 space-y-3.5 focus-visible:outline-none">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {isAr ? "1. الاستخدام الشخصي والتمكين" : "1. Personal Use & Empowerment"}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {isAr
                    ? "صُمم AYXA Planner لمساعدتكِ في إدارة مهامكِ، أهدافكِ، عاداتكِ، وجدولكِ اليومي بكل راحة وطمأنينة. التطبيق مخصص للاستخدام الشخصي غير التجاري."
                    : "AYXA Planner is crafted to help you organize daily tasks, habits, reflections, and goals in an uplifting and serene environment for personal, non-commercial use."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {isAr ? "2. وضع الضيفة وحساب المستخدمة" : "2. Guest Mode & Registered Accounts"}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {isAr
                    ? "في وضع الضيفة، يتم تخزين كافة البيانات محلياً على جهازكِ فقط دون إرسالها إلى أي خادم خارجي. عند إنشاء حساب مسجل، يتم تشفير بياناتكِ وحفظها بأمان عبر بنية سحابية موثوقة لمزامنتها بين أجهزتكِ."
                    : "In Guest Mode, all data is retained locally on your device only and never uploaded to remote servers. When creating a verified account, your data is securely encrypted and synced via trusted cloud infrastructure."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {isAr ? "3. ملكية البيانات والتحكم الكامل" : "3. Data Ownership & Control"}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {isAr
                    ? "أنتِ المالكة الوحيدة لبياناتكِ ومذكراتكِ وأهدافكِ. يمكنكِ في أي وقت تصدير بياناتكِ أو حذف حسابكِ وسجلّاتكِ بالكامل وبشكل نهائي من قائمة الإعدادات."
                    : "You retain full ownership of all notes, tasks, habits, and journal entries. You can export your data or permanently delete your account and all associated records at any time."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="m-0 space-y-3.5 focus-visible:outline-none">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1.5">
                  <Lock className="h-4 w-4 text-primary" />
                  {isAr ? "1. حماية الخصوصية وعدم بيع البيانات" : "1. Zero Ads & No Selling of Data"}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {isAr
                    ? "نحن لا نبيع بياناتكِ الشخصية أو نشاركها مع جهات إعلانية إطلاقاً. لا توجد أي إعلانات متطفلة أو برمجيات تتبع طرف ثالث داخل التطبيق."
                    : "We never sell your personal data or share it with third-party advertisers. AYXA Planner contains no invasive ad networks or third-party tracking brokers."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  {isAr ? "2. التشفير وأمان الاتصال" : "2. Modern Encryption & Security"}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {isAr
                    ? "جميع الاتصالات بين التطبيق وخوادم المصادقة محمية بأعلى معايير التشفير (SSL/TLS 256-bit). كلمات المرور تشفر بنظام الهاش غير القابل للعكس."
                    : "All communication between the application and authentication infrastructure is encrypted via strict SSL/TLS standards. Passwords are cryptographically hashed and never stored in plain text."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {isAr ? "3. شفافية التخزين المحلي" : "3. Local Storage Disclosure"}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {isAr
                    ? "عند استخدامكِ للتطبيق كضيفة، تُحفظ بياناتكِ في الذاكرة المحلية لجهازكِ (IndexedDB/Dexie). مسح بيانات المتصفح أو التطبيق قد يؤدي لفقدانها، لذا ننصح بإنشاء حساب لحفظها سحابياً."
                    : "As a guest, your records reside exclusively within your device's sandboxed storage. Clearing app cache or local storage will delete these records unless transferred to a verified account."}
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="pt-3 border-t border-border/40 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full py-2.5 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm active:scale-[0.98] transition-transform"
          >
            {isAr ? "فهمت وموافقة" : "I Understand & Agree"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
