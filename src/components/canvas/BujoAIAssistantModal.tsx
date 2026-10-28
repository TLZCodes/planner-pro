import React, { useState } from "react";
import { useCanvasState } from "@/lib/canvasStore";
import { createNewPage } from "@/lib/canvasStore";
import { cn } from "@/lib/utils";

interface BujoAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BujoAIAssistantModal({ isOpen, onClose }: BujoAIAssistantModalProps) {
  const state = useCanvasState();
  const [activeTab, setActiveTab] = useState<"generate" | "typography" | "autofix" | "quotes">("generate");
  const [promptInput, setPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  if (!isOpen) return null;

  const activePage = state.journal.pages[state.journal.activePageIndex];

  // 1. AI Custom Page Layout Generator
  const handleGenerateLayout = (presetPrompt?: string) => {
    const text = presetPrompt || promptInput.trim();
    if (!text) return;

    setIsGenerating(true);
    setStatusMessage("جارٍ تحليل فكرتك وتصميم الصفحة بالذكاء الاصطناعي... ✨");

    setTimeout(() => {
      const W = 1240;
      const H = 1754;
      const newPage = createNewPage(`✨ ${text.slice(0, 20)}`);
      newPage.background = { type: "dotted", color: "#FFFBF7", gridColor: "#E2D9D0", gridSize: 24 };

      let layers: any[] = [];

      if (text.includes("دراسي") || text.includes("Study") || text.includes("مذاكرة")) {
        layers = [
          {
            name: "Header Washi Tape",
            type: "washiTape",
            x: W / 2 - 250,
            y: 80,
            width: 500,
            height: 44,
            rotation: -1,
            props: { pattern: "stripes", tapeColor: "#FF69B4" },
          },
          {
            name: "Header Title",
            type: "text",
            x: W / 2 - 350,
            y: 70,
            width: 700,
            height: 70,
            props: {
              text: "📚 جدول الدراسة والمذاكرة الأسبوعي",
              fontFamily: "Hacen Tehran",
              fontSize: 38,
              fontWeight: "bold",
              color: "#1E1220",
              textAlign: "center",
            },
          },
          ...["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"].flatMap((day, i) => [
            {
              name: `Card ${day}`,
              type: "shape",
              x: 80,
              y: 190 + i * 280,
              width: W - 160,
              height: 240,
              props: {
                shapeKind: "rounded-rectangle",
                fillColor: "#FFFFFF",
                borderColor: "#FF1493",
                borderWidth: 2,
                borderRadius: 24,
              },
            },
            {
              name: `Title ${day}`,
              type: "text",
              x: 120,
              y: 210 + i * 280,
              width: 300,
              height: 40,
              props: {
                text: `📖 ${day}`,
                fontFamily: "Hacen Tehran",
                fontSize: 26,
                fontWeight: "bold",
                color: "#FF1493",
              },
            },
            {
              name: `Tasks ${day}`,
              type: "text",
              x: 140,
              y: 260 + i * 280,
              width: W - 280,
              height: 140,
              props: {
                text: "☐ مراجعة الفصل الأول + حل التمارين (09:00)\n☐ تلخيص المحاضرة وإعداد بطاقات المراجعة (14:30)\n☐ اختبار تجريبي مدته 45 دقيقة (20:00)",
                fontFamily: "Almarai",
                fontSize: 20,
                fontWeight: "normal",
                color: "#332233",
              },
            },
          ]),
          {
            name: "Sticker Decor",
            type: "sticker",
            x: W - 180,
            y: 80,
            width: 100,
            height: 100,
            props: { stampSymbol: "🎓" },
          },
        ];
      } else if (text.includes("عناية") || text.includes("Self-Care") || text.includes("هدوء")) {
        layers = [
          {
            name: "Header Title",
            type: "text",
            x: W / 2 - 350,
            y: 80,
            width: 700,
            height: 70,
            props: {
              text: "🧘‍♀️ روتين العناية بالنفس والتأمل Daily Self-Care",
              fontFamily: "Hacen Tehran",
              fontSize: 36,
              fontWeight: "bold",
              color: "#A78BFA",
              textAlign: "center",
            },
          },
          {
            name: "Quote Card",
            type: "shape",
            x: 80,
            y: 180,
            width: W - 160,
            height: 160,
            props: {
              shapeKind: "rounded-rectangle",
              fillColor: "#F3E8FF",
              borderColor: "#A78BFA",
              borderWidth: 2,
              borderRadius: 24,
            },
          },
          {
            name: "Quote Text",
            type: "text",
            x: 120,
            y: 210,
            width: W - 240,
            height: 100,
            props: {
              text: "“اعتني بروحك ونقاء قلبك، فالجمال الحقيقي يبدأ من الداخل.” 🌿✨",
              fontFamily: "Hacen Tehran",
              fontSize: 24,
              fontWeight: "bold",
              color: "#5B21B6",
              textAlign: "center",
            },
          },
          ...[
            { title: "💧 شرب الماء والعناية بالبشرة", desc: "☐ 8 أكواب ماء نقية\n☐ غسول البشرة والمُرطب اليومي\n☐ 15 دقيقة قناع النضارة" },
            { title: "📖 القراءة والكتابة اليومية Journaling", desc: "☐ كتابة 3 أشياء ممتنة لها اليوم\n☐ قراءة 10 صفحات من الكتاب المفضل\n☐ التأمل لمدة 10 دقائق قبل النوم" },
            { title: "🏃‍♀️ الرياضة والاسترخاء Sport & Relax", desc: "☐ 30 دقيقة مشي في الهواء الطلق\n☐ تمارين الإطالة والاسترخاء\n☐ نوم هادئ 8 ساعات" },
          ].map((sec, idx) => ({
            name: `Section ${idx}`,
            type: "shape",
            x: 80,
            y: 380 + idx * 420,
            width: W - 160,
            height: 380,
            props: {
              shapeKind: "rounded-rectangle",
              fillColor: "#FFFFFF",
              borderColor: "#E9D5FF",
              borderWidth: 2,
              borderRadius: 24,
            },
          })),
          ...[
            { title: "💧 شرب الماء والعناية بالبشرة", desc: "☐ 8 أكواب ماء نقية\n☐ غسول البشرة والمُرطب اليومي\n☐ 15 دقيقة قناع النضارة" },
            { title: "📖 القراءة والكتابة اليومية Journaling", desc: "☐ كتابة 3 أشياء ممتنة لها اليوم\n☐ قراءة 10 صفحات من الكتاب المفضل\n☐ التأمل لمدة 10 دقائق قبل النوم" },
            { title: "🏃‍♀️ الرياضة والاسترخاء Sport & Relax", desc: "☐ 30 دقيقة مشي في الهواء الطلق\n☐ تمارين الإطالة والاسترخاء\n☐ نوم هادئ 8 ساعات" },
          ].flatMap((sec, idx) => [
            {
              name: `Sec Title ${idx}`,
              type: "text",
              x: 120,
              y: 410 + idx * 420,
              width: W - 240,
              height: 50,
              props: {
                text: sec.title,
                fontFamily: "Hacen Tehran",
                fontSize: 26,
                fontWeight: "bold",
                color: "#7E22CE",
              },
            },
            {
              name: `Sec Text ${idx}`,
              type: "text",
              x: 140,
              y: 470 + idx * 420,
              width: W - 280,
              height: 250,
              props: {
                text: sec.desc,
                fontFamily: "Almarai",
                fontSize: 22,
                fontWeight: "normal",
                color: "#4C1D95",
              },
            },
          ]),
          {
            name: "Sticker Decor 1",
            type: "sticker",
            x: W - 160,
            y: 190,
            width: 100,
            height: 100,
            props: { stampSymbol: "🌸" },
          },
        ];
      } else {
        // Default Romantic AYXA General Planner
        layers = [
          {
            name: "Header Title",
            type: "text",
            x: W / 2 - 350,
            y: 80,
            width: 700,
            height: 70,
            props: {
              text: `✨ ${text} — AYXA Planner`,
              fontFamily: "Hacen Tehran",
              fontSize: 38,
              fontWeight: "bold",
              color: "#FF1493",
              textAlign: "center",
            },
          },
          {
            name: "Top Card",
            type: "shape",
            x: 80,
            y: 180,
            width: W - 160,
            height: 450,
            props: {
              shapeKind: "rounded-rectangle",
              fillColor: "#FFFFFF",
              borderColor: "#FF1493",
              borderWidth: 2,
              borderRadius: 24,
            },
          },
          {
            name: "Top Card Title",
            type: "text",
            x: 120,
            y: 210,
            width: 400,
            height: 50,
            props: {
              text: "🎯 المهام والأولويات الرئيسية",
              fontFamily: "Hacen Tehran",
              fontSize: 26,
              fontWeight: "bold",
              color: "#FF1493",
            },
          },
          {
            name: "Top Card Content",
            type: "text",
            x: 140,
            y: 270,
            width: W - 280,
            height: 320,
            props: {
              text: "☐ المهمة الأولى الأكثر أهمية وإلحاحاً\n☐ المهمة الثانية لتطوير المهارات والتعلّم\n☐ ترتيب الجدول والأولويات الأسبوعية\n☐ مراجعة الإنجازات والاحتفال بالنجاح",
              fontFamily: "Almarai",
              fontSize: 22,
              color: "#332233",
            },
          },
          {
            name: "Bottom Left Card",
            type: "shape",
            x: 80,
            y: 670,
            width: (W - 200) / 2,
            height: 800,
            props: {
              shapeKind: "rounded-rectangle",
              fillColor: "#FFF5F7",
              borderColor: "#FFA07A",
              borderWidth: 2,
              borderRadius: 24,
            },
          },
          {
            name: "Bottom Right Card",
            type: "shape",
            x: (W - 200) / 2 + 120,
            y: 670,
            width: (W - 200) / 2,
            height: 800,
            props: {
              shapeKind: "rounded-rectangle",
              fillColor: "#FAF5FF",
              borderColor: "#A78BFA",
              borderWidth: 2,
              borderRadius: 24,
            },
          },
          {
            name: "Sticker Decor",
            type: "sticker",
            x: W / 2 - 50,
            y: 1520,
            width: 100,
            height: 100,
            props: { stampSymbol: "💖" },
          },
        ];
      }

      newPage.layers = layers.map((l, idx) => ({
        id: `ai_layer_${Date.now()}_${idx}`,
        name: l.name,
        type: l.type,
        x: l.x,
        y: l.y,
        width: l.width,
        height: l.height,
        rotation: l.rotation || 0,
        opacity: l.opacity ?? 1,
        zIndex: idx + 1,
        locked: l.locked ?? false,
        visible: true,
        blendMode: l.blendMode || "normal",
        props: l.props || {},
      }));

      state.addPage(newPage);
      setIsGenerating(false);
      setStatusMessage("");
      onClose();
    }, 1200);
  };

  // 2. AI Calligraphy Title Beautifier
  const handleApplyCalligraphy = () => {
    if (!activePage) return;
    const textLayers = activePage.layers.filter((l) => l.type === "text" && !l.locked);
    if (!textLayers.length) {
      alert("الرجاء إضافة طبقة نصية أو تحديد نص على الصفحة أولاً ليقوم الذكاء الاصطناعي بتحسينه.");
      return;
    }
    const targetLayer = textLayers[textLayers.length - 1];
    state.updateLayer(targetLayer.id, {
      props: {
        ...targetLayer.props,
        fontFamily: "Hacen Tehran",
        fontSize: Math.max(34, (targetLayer.props.fontSize || 28) * 1.25),
        fontWeight: "bold",
        color: "#FF1493",
      },
    });
    alert("✨ تم تحسين وتنسيق النص بالخط العربي (Hacen Tehran) بنجاح!");
    onClose();
  };

  // 3. AI Smart Auto-Fix Layout
  const handleAutoFixLayout = () => {
    if (!activePage) return;
    setIsGenerating(true);
    setStatusMessage("جارٍ إعادة ترتيب العناصر وتنسيق المسافات تلقائياً... 📐");

    setTimeout(() => {
      const W = activePage.size.width;
      activePage.layers.forEach((l, idx) => {
        if (l.type === "shape") {
          state.updateLayer(l.id, {
            x: Math.max(60, Math.min(W - l.width - 60, l.x)),
            props: { ...l.props, borderRadius: 24, borderWidth: 2 },
          });
        } else if (l.type === "text") {
          state.updateLayer(l.id, {
            props: { ...l.props, fontFamily: l.props.fontFamily || "Hacen Tehran" },
          });
        }
      });
      setIsGenerating(false);
      setStatusMessage("");
      alert("✨ تم ضبط وتنسيق الصفحة وترتيب الطبقات تلقائياً بواسطة الذكاء الاصطناعي!");
      onClose();
    }, 1000);
  };

  // 4. AI Quote Generator
  const handleInsertQuote = (quoteText: string) => {
    if (!activePage) return;
    state.addLayer({
      name: "AI Quote Card",
      type: "shape",
      x: activePage.size.width / 2 - 350,
      y: activePage.size.height / 2 - 100,
      width: 700,
      height: 200,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      blendMode: "normal",
      props: {
        shapeKind: "rounded-rectangle",
        fillColor: "#FFF5F7",
        borderColor: "#FF1493",
        borderWidth: 2,
        borderRadius: 24,
      },
    });
    state.addLayer({
      name: "AI Quote Text",
      type: "text",
      x: activePage.size.width / 2 - 320,
      y: activePage.size.height / 2 - 70,
      width: 640,
      height: 140,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      blendMode: "normal",
      props: {
        text: `💬 “${quoteText}”\n— AYXA Planner 🌸`,
        fontFamily: "Hacen Tehran",
        fontSize: 26,
        fontWeight: "bold",
        color: "#FF1493",
        textAlign: "center",
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden shadow-rose-lg text-ink">
        {/* Header */}
        <div className="p-4 grad-theme text-white flex items-center justify-between shadow-rose-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🪄</span>
            <div>
              <h2 className="text-base font-extrabold font-arabic">مساعد التصميم والتوليد بالذكاء الاصطناعي</h2>
              <p className="text-[11px] text-white/80 font-semibold font-arabic">خططي، أنجزي، تألقي مع AYXA AI 🌙</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center font-bold text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/40 bg-surface p-1 gap-1">
          {[
            { key: "generate", label: "توليد قالب", icon: "✨" },
            { key: "typography", label: "خطوط وزخرفة", icon: "✍️" },
            { key: "autofix", label: "تنسيق تلقائي", icon: "📐" },
            { key: "quotes", label: "اقتباسات", icon: "💬" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex-1 py-2 px-1 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all font-arabic",
                activeTab === tab.key
                  ? "bg-hotpink text-white shadow-rose-sm"
                  : "text-ink-light hover:text-ink hover:bg-ghost"
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 font-arabic">
          {isGenerating ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-hotpink border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-hotpink animate-pulse">{statusMessage}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: AI Custom Page Generator */}
              {activeTab === "generate" && (
                <div className="space-y-4">
                  <div className="bg-surface p-3.5 rounded-2xl border border-border/60 space-y-2">
                    <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <span>💭 ماذا تريدين أن يصمم لكِ الذكاء الاصطناعي؟</span>
                    </label>
                    <textarea
                      rows={3}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="مثال: مخطط دراسي لخمس مواد مع جدول مراجعة، أو مخطط روتين عناية بالبشرة..."
                      className="w-full bg-card border border-border/60 rounded-xl p-3 text-xs font-bold text-ink outline-none focus:border-hotpink"
                    />
                    <button
                      onClick={() => handleGenerateLayout()}
                      disabled={!promptInput.trim()}
                      className="w-full grad-theme text-white py-3 rounded-xl font-extrabold text-xs shadow-rose-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                    >
                      <span>✨ صممي هذه الصفحة الآن</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-ink-light">أو اختاري من نماذج القوالب الذكية الجاهزة:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { title: "📚 جدول الدراسة والمذاكرة", prompt: "جدول دراسي للمواد والواجبات" },
                        { title: "🧘‍♀️ روتين العناية بالنفس والتأمل", prompt: "روتين عناية بالنفس وتهدئة" },
                        { title: "💸 الميزانية والادخار الوردي", prompt: "مخطط ميزانية وادخار مالية" },
                        { title: "🎯 لوحة الأهداف والتطوير", prompt: "جدول أهداف وتحديات يومية" },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleGenerateLayout(item.prompt)}
                          className="p-3 rounded-2xl bg-surface border border-border/40 hover:border-hotpink hover:bg-ghost text-right text-xs font-bold text-ink transition-all flex items-center justify-between group"
                        >
                          <span>{item.title}</span>
                          <span className="text-hotpink font-mono group-hover:translate-x-1 transition-transform">←</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI Calligraphy & Typography */}
              {activeTab === "typography" && (
                <div className="space-y-4">
                  <div className="bg-surface p-4 rounded-2xl border border-border/60 space-y-3 text-center">
                    <span className="text-4xl block">✍️</span>
                    <h3 className="text-sm font-extrabold text-ink">تحسين وتنسيق النص بالخط العربي (Hacen Tehran)</h3>
                    <p className="text-xs text-ink-light leading-relaxed">
                      حدد أي نص في الصفحة وسيقوم الذكاء الاصطناعي بتحويله إلى عنوان جمالي عريض بخط Hacen Tehran مع تزيينه بألوان زهرية جذابة!
                    </p>
                    <button
                      onClick={handleApplyCalligraphy}
                      className="w-full grad-theme text-white py-3 rounded-xl font-extrabold text-xs shadow-rose-sm transition-all"
                    >
                      ✨ طبق الخط العربي الملكي على النص المحدد
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: AI Smart Auto-Layout */}
              {activeTab === "autofix" && (
                <div className="space-y-4">
                  <div className="bg-surface p-4 rounded-2xl border border-border/60 space-y-3 text-center">
                    <span className="text-4xl block">📐</span>
                    <h3 className="text-sm font-extrabold text-ink">إصلاح وتنسيق أبعاد العناصر تلقائياً</h3>
                    <p className="text-xs text-ink-light leading-relaxed">
                      يقوم الذكاء الاصطناعي بمحاذاة البطاقات والأشكال، ضبط هوامش الصفحات، وتعديل حواف الأشكال لتصبح متناسقة 100% مع التصميم.
                    </p>
                    <button
                      onClick={handleAutoFixLayout}
                      className="w-full grad-theme text-white py-3 rounded-xl font-extrabold text-xs shadow-rose-sm transition-all"
                    >
                      🪄 نسق الصفحة وأصلح الأبعاد الآن
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: AI Inspiration Quotes */}
              {activeTab === "quotes" && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-ink-light block">اضغطي على أي اقتباس لإضافته فوراً إلى صفحتك:</span>
                  {[
                    "الانضباط هو أسمى درجات الحب الذاتي.",
                    "صانعة أحلامك هي ذاتك اليومية، فاجعلي كل لحظة تتألق.",
                    "خططي بذكاء، أنجزي بحب، وكوني النسخة الأفضل من نفسك.",
                    "الجمال في الاستمرارية، وليس في الكمال.",
                    "كل خطوة صغيرة اليوم تقربك من هدفك الكبير غداً.",
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInsertQuote(q)}
                      className="w-full p-3.5 rounded-2xl bg-surface border border-border/40 hover:border-hotpink hover:bg-ghost text-right text-xs font-bold text-ink transition-all flex items-center justify-between group"
                    >
                      <span>💬 “{q}”</span>
                      <span className="text-hotpink text-[11px] font-bold group-hover:scale-110 transition-transform">إضافة +</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
