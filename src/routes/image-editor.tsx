import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Screen, PageHeader } from "@/components/kit";
import { ImageEditorPro } from "@/components/ImageEditorPro";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/image-editor")({
  head: () => ({
    meta: [
      { title: "Image Editor & PDF Studio Pro — AYXA Planner Pro" },
      {
        name: "description",
        content: "Professional Image Editor and PDF Studio: crop, resize, rotate, filters, annotations, text overlays, shapes, and multi-image PDF export.",
      },
    ],
  }),
  component: ImageEditorPage,
});

function ImageEditorPage() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  return (
    <MobileShell>
      <Screen>
        <PageHeader
          title={isAr ? "محرر الصور واستوديو PDF" : "Image Editor & PDF Studio Pro"}
          subtitle={isAr ? "قص، تعديل الأبعاد، فلاتر، رسم، نصوص وتصدير عالي الدقة" : "Crop, resize, filters, drawing, annotations & PDF export"}
        />
        <ImageEditorPro />
      </Screen>
    </MobileShell>
  );
}
