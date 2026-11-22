import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  SendHorizontal,
  Sparkles,
  Check,
  Copy,
  Plus,
  ArrowLeft,
  MessageSquare,
  Square,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sliders,
  ThumbsUp,
  ThumbsDown,
  Zap,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useLang } from "@/lib/i18n";
import { useApp, type AiSettings } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  type AiProposal,
  type AiMessage,
  type ContextPermissionScope,
  DEFAULT_CONTEXT_SCOPE,
  STARTER_PROMPTS,
  BUILT_IN_TEMPLATES,
  extractProposalsFromText,
  formatPlanTextWithoutRawJson,
  buildUserContextSummary,
  buildFullAppOmniContext,
  applyProposalToStore,
  type BuiltInTemplate,
} from "@/lib/aiPlannerEngine";
import {
  streamCoarenaChat,
  submitCoarenaFeedback,
} from "@/lib/coarenaClient";
import { AI_DIALECT_OPTIONS } from "@/lib/aiDialects";
import { AiContextModal } from "@/components/ai/AiContextModal";
import { AiPlanReviewSheet } from "@/components/ai/AiPlanReviewSheet";
import { AiConversationsDrawer } from "@/components/ai/AiConversationsDrawer";
import { AiProposalCard } from "@/components/ai/AiProposalCard";
import { AiCreditsModal } from "@/components/ai/AiCreditsModal";
import { AiSettingsModal } from "@/components/ai/AiSettingsModal";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AYXA Muse Pro ✨ — Luxury AI Planning & Glow Companion" },
      {
        name: "description",
        content:
          "AYXA Muse Pro — Luxury AI planning companion with full app management for aesthetic, mindful women.",
      },
    ],
  }),
  component: AiScreen,
});

const FEMININE_VIBE_MODES: Array<{
  id: AiSettings["tone"];
  emoji: string;
  labelEn: string;
  labelAr: string;
}> = [
  { id: "gentle", emoji: "🌸", labelEn: "Soft Glow", labelAr: "نعومة وهدوء" },
  { id: "action", emoji: "👑", labelEn: "That Girl Pro", labelAr: "طموح وإنجاز" },
  { id: "barakah", emoji: "🌙", labelEn: "Barakah Soul", labelAr: "بركة وسكينة" },
];

const OMNI_QUICK_ACTIONS = [
  {
    id: "omni_audit",
    ar: "حلّلي حالة تطبيقي اليوم ورتّبي أولوياتي وعاداتي ✨",
    en: "Analyze my entire app today & organize my priorities ✨",
  },
  {
    id: "omni_morning",
    ar: "أضيفي روتين صباحي أنثوي + 500 مل ماء + مهمة تركيز 🌸",
    en: "Add a morning glow routine + log 500ml water + 1 focus task 🌸",
  },
  {
    id: "omni_deen",
    ar: "نسّقي جدول مهامي اليوم بين أوقات الصلوات الخمس + ورد القرآن 🕌",
    en: "Schedule my tasks today around the 5 prayers + Quran pages 🕌",
  },
  {
    id: "omni_selfcare",
    ar: "أضيفي جلسة عناية ذاتية وملاحظة امتنان في جرّة النِّعم 🤍",
    en: "Add a self-care ritual & a gratitude note to my Barakah Jar 🤍",
  },
];

function AiScreen() {
  const navigate = useNavigate();
  const { t, lang, dir } = useLang();
  const appStore = useApp();
  const {
    state,
    saveAiConversation,
    deleteAiConversation,
    renameAiConversation,
    clearAiConversations,
    updateAiContextConsent,
    revokeAiContextConsent,
    useAiCredit,
    updateAiSettings,
  } = appStore;

  const isAr = lang === "ar";
  const activeTone: AiSettings["tone"] = state.aiSettings?.tone || "barakah";
  const activeLevel: AiSettings["level"] = state.aiSettings?.level || "balanced";
  const activeDialect: string = state.aiSettings?.dialect || "auto";
  const fullAppAccess = state.aiSettings?.fullAppAccess !== false;
  const autoExecuteActions = state.aiSettings?.autoExecuteActions !== false;

  // Navigation back handler
  const handleBack = () => {
    const historyIdx = typeof window !== "undefined" ? (window.history.state?.idx ?? -1) : -1;
    if (historyIdx > 0) {
      window.history.back();
    } else {
      navigate({ to: "/" });
    }
  };

  // State management
  const [activeConvId, setActiveConvId] = useState<string>(() => {
    return state.aiConversations && state.aiConversations.length > 0
      ? state.aiConversations[0].id
      : `conv_${Date.now()}`;
  });

  const [messages, setMessages] = useState<AiMessage[]>(() => {
    const saved = (state.aiConversations || []).find((c) => c.id === activeConvId);
    return saved?.messages || [];
  });

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSubmittedText, setLastSubmittedText] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ratingToastId, setRatingToastId] = useState<string | null>(null);
  const [showContextModal, setShowContextModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [templatesExpanded, setTemplatesExpanded] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Review Sheet State
  const [reviewSheetConfig, setReviewSheetConfig] = useState<{
    isOpen: boolean;
    title?: string;
    sourceType: "ai_suggestion" | "built_in_template";
    proposals: AiProposal[];
  }>({
    isOpen: false,
    sourceType: "ai_suggestion",
    proposals: [],
  });

  // Offline Detection (SSR-safe: always starts true to avoid hydration mismatch)
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Context permissions
  const contextScope: ContextPermissionScope = state.aiContextConsent || DEFAULT_CONTEXT_SCOPE;

  // Build full Omni-App context summary when fullAppAccess is enabled
  const contextSummaryText = useMemo(() => {
    if (fullAppAccess) {
      return buildFullAppOmniContext(state);
    }
    if (!contextScope.granted) return "";
    return buildUserContextSummary(state, contextScope).summaryText;
  }, [state, fullAppAccess, contextScope]);

  // Sync loaded conversation messages when activeConvId changes
  useEffect(() => {
    const saved = (state.aiConversations || []).find((c) => c.id === activeConvId);
    if (saved && saved.messages) {
      setMessages(saved.messages);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Auto-persist conversation messages to store when updated
  useEffect(() => {
    if (messages.length > 0 && !isGenerating) {
      const enrichedMessages: AiMessage[] = messages.map((m) => {
        const proposals =
          m.role === "assistant" ? extractProposalsFromText(m.content, state) : [];
        return {
          ...m,
          proposals: proposals.length > 0 ? proposals : m.proposals,
          status: m.status || ("complete" as const),
        };
      });

      const firstUserMsg = enrichedMessages.find((m) => m.role === "user");
      const derivedTitle = firstUserMsg
        ? firstUserMsg.content.slice(0, 32)
        : isAr
          ? "جلسة تخطيط AYXA Pro"
          : "AYXA Muse Pro Session";

      saveAiConversation({
        id: activeConvId,
        title: derivedTitle,
        messages: enrichedMessages,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [messages, isGenerating, activeConvId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Stop active generation
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Handle Send with streaming + auto-pilot execution
  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    const cost = activeLevel === "deep" ? 2 : 1;
    const currentCredits = typeof state.aiCredits === "number" ? state.aiCredits : 50;
    if (currentCredits < cost) {
      setShowCreditsModal(true);
      return;
    }

    const deducted = useAiCredit(cost);
    if (!deducted) {
      setShowCreditsModal(true);
      return;
    }

    setCustomError(null);
    setLastSubmittedText(trimmed);
    setInput("");

    const userMsg: AiMessage = {
      id: `msg_u_${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
      status: "complete",
    };

    const assistantMsgId = `msg_a_${Date.now() + 1}`;
    const initialAssistantMsg: AiMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      status: "incomplete",
    };

    const updatedHistory = [...messages, userMsg];
    setMessages([...updatedHistory, initialAssistantMsg]);
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await streamCoarenaChat({
        messages: updatedHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        persona: "feminine",
        level: activeLevel,
        tone: activeTone,
        dialect: activeDialect,
        contextSummary: contextSummaryText,
        signal: controller.signal,
        onUpdate: (partialText, reqId) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: partialText,
                    requestId: reqId || m.requestId,
                  }
                : m
            )
          );
        },
      });

      const finalProposals = extractProposalsFromText(result.fullText, state);
      const appliedIds: string[] = [];

      // If Auto-Pilot is active, execute proposed actions directly into the app store
      if (autoExecuteActions && finalProposals.length > 0) {
        const appliedSet = new Set<string>();
        for (const prop of finalProposals) {
          const mut = applyProposalToStore(prop, appStore as any, appliedSet, state);
          if (mut.success) {
            appliedIds.push(prop.id);
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: result.fullText,
                requestId: result.requestId || m.requestId,
                proposals: finalProposals.length > 0 ? finalProposals : undefined,
                appliedProposalIds: appliedIds.length > 0 ? appliedIds : undefined,
                status: "complete",
              }
            : m
        )
      );
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, status: "complete" } : m
          )
        );
      } else {
        const msg = err?.message || "";
        setMessages((prev) =>
          prev.filter((m) => !(m.id === assistantMsgId && !m.content.trim()))
        );
        if (msg.includes("429")) {
          setCustomError(
            isAr
              ? "طلبات متتالية — يرجى الانتظار لحظات بسيطة والمحاولة مجدداً 🌸"
              : "Too many requests — please wait a moment and try again 🌸",
          );
        } else {
          setCustomError(
            isAr
              ? "تعذر الاتصال بـ AYXA Muse Pro حالياً — يرجى التحقق من اتصالكِ بالإنترنت والمحاولة مجدداً."
              : "Unable to reach AYXA Muse Pro right now — please check your internet connection and try again.",
          );
        }
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Rate an assistant reply via POST https://coarena.ai/api/v1/feedback
  const handleRateReply = async (message: AiMessage, rating: "good" | "bad") => {
    const reqId = message.requestId || message.id;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id ? { ...m, feedbackRating: rating } : m
      )
    );
    setRatingToastId(message.id);
    setTimeout(() => {
      setRatingToastId((curr) => (curr === message.id ? null : curr));
    }, 2200);

    await submitCoarenaFeedback({
      requestId: reqId,
      rating,
    });
  };

  // Start a new conversation
  const handleNewConversation = () => {
    if (isGenerating) stopGeneration();
    const newId = `conv_${Date.now()}`;
    setActiveConvId(newId);
    setMessages([]);
    setCustomError(null);
    setInput("");
  };

  // Switch conversation safely
  const handleSelectConversation = (id: string) => {
    if (isGenerating) stopGeneration();
    setActiveConvId(id);
    setCustomError(null);
  };

  // Copy assistant response
  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Open Template Review
  const handleOpenTemplateReview = (template: BuiltInTemplate) => {
    const initializedProposals: AiProposal[] = template.proposals.map((p, idx) => ({
      ...p,
      id: `tmpl_${template.id}_${idx}_${Date.now()}`,
      reminder: false,
    }));

    setReviewSheetConfig({
      isOpen: true,
      title: isAr ? template.titleAr : template.titleEn,
      sourceType: "built_in_template",
      proposals: initializedProposals,
    });
  };

  // Open Message Proposals Review
  const handleOpenMessageProposalsReview = (proposals: AiProposal[]) => {
    setReviewSheetConfig({
      isOpen: true,
      title: isAr ? "مراجعة وتخصيص الإجراءات 📋" : "Review & Customize Actions 📋",
      sourceType: "ai_suggestion",
      proposals,
    });
  };

  const activeVibeObj =
    FEMININE_VIBE_MODES.find((v) => v.id === activeTone) || FEMININE_VIBE_MODES[2];

  return (
    <MobileShell hideFooter>
      <div className="flex h-screen max-h-screen flex-col bg-canvas text-ink overflow-hidden">
        {/* Luxury Aesthetic Header */}
        <header className="flex items-center justify-between border-b border-pink-200/50 dark:border-pink-900/40 bg-card/95 backdrop-blur-md px-3.5 py-3 shadow-2xs shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={handleBack}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 border border-pink-200/60 dark:border-pink-800/50 text-ink shadow-2xs hover:border-hotpink active:scale-90 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </button>

            <div className="relative shrink-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-lg text-white shadow-rose">
                🌸
              </span>
              <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-400" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-sm sm:text-base font-extrabold text-ink leading-tight truncate">
                  {isAr ? "مساعدة AYXA Muse Pro" : "AYXA Muse Pro"}
                </h1>
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border border-pink-400/40 px-2 py-0.5 text-[9px] font-extrabold text-hotpink uppercase tracking-wider shrink-0">
                  OMNI ✨
                </span>
              </div>
              <p className="text-[11px] font-medium text-ink-light truncate mt-0.5">
                {isGenerating
                  ? isAr
                    ? "تنسّق وتدير تطبيقكِ بكل ذكاء..."
                    : "Managing your planner with grace..."
                  : isAr
                    ? "تحكم ذكي شامل بمخططكِ بكل اللغات واللهجات ♡"
                    : "Full app intelligence & glow companion ♡"}
              </p>
            </div>
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Glow Credits Pill */}
            <button
              type="button"
              onClick={() => setShowCreditsModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-pink-500/15 to-amber-500/15 border border-pink-300/60 dark:border-pink-800/60 text-hotpink text-xs font-extrabold hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={isAr ? "رصيد نقاطكِ" : "Your Glow Credits"}
            >
              <Sparkles size={11} className="text-hotpink" />
              <span>{state.aiCredits ?? 50}</span>
            </button>

            {/* Saved Chats Drawer Button */}
            <button
              type="button"
              onClick={() => setShowDrawer(true)}
              aria-label={isAr ? "المحادثات السابقة" : "Saved conversations"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-200/60 dark:border-pink-900/50 bg-surface/80 text-ink-light hover:text-hotpink transition-colors cursor-pointer"
            >
              <MessageSquare size={15} />
            </button>

            {/* AI Studio Settings Button */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              aria-label={isAr ? "إعدادات AYXA Muse Pro" : "AYXA Muse Pro Settings"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-200/60 dark:border-pink-900/50 bg-surface/80 text-ink-light hover:text-hotpink transition-colors cursor-pointer"
              title={isAr ? "إعدادات الاستوديو والصلاحيات ⚙️" : "Studio & Omni-Access Settings ⚙️"}
            >
              <Sliders size={15} />
            </button>

            {/* New Conversation Button */}
            <button
              type="button"
              onClick={handleNewConversation}
              aria-label={isAr ? "محادثة جديدة" : "New conversation"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-rose hover:opacity-90 active:scale-90 transition-all cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </div>
        </header>

        {/* Feminine Aesthetic Vibe Selector Ribbon */}
        <div className="border-b border-pink-200/40 dark:border-pink-900/30 bg-surface/40 backdrop-blur-xs px-4 py-2 shrink-0">
          <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-1.5 flex-1 bg-canvas/90 p-1 rounded-2xl border border-pink-200/60 dark:border-pink-900/50">
              {FEMININE_VIBE_MODES.map((vibe) => {
                const isSelected = activeTone === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => updateAiSettings({ tone: vibe.id })}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate",
                      isSelected
                        ? "bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-rose"
                        : "text-ink-light hover:text-ink hover:bg-surface/60"
                    )}
                  >
                    <span className="text-xs shrink-0">{vibe.emoji}</span>
                    <span className="truncate">{isAr ? vibe.labelAr : vibe.labelEn}</span>
                  </button>
                );
              })}
            </div>

            <select
              value={activeDialect}
              onChange={(e) => updateAiSettings({ dialect: e.target.value })}
              aria-label={isAr ? "اللهجة أو اللغة" : "Dialect or Language"}
              className="shrink-0 max-w-[125px] sm:max-w-[160px] rounded-2xl border border-pink-300/60 dark:border-pink-800/50 bg-canvas/95 px-2.5 py-2 text-[10px] font-extrabold text-hotpink hover:border-hotpink focus:outline-none transition-all cursor-pointer truncate"
              title={isAr ? "اختيار اللهجة العربية أو اللغة العالمية 🌍" : "Choose Arabic Dialect or World Language 🌍"}
            >
              {AI_DIALECT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.flag} {isAr ? opt.labelAr : opt.labelEn}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="shrink-0 flex items-center gap-1 rounded-2xl border border-pink-300/50 dark:border-pink-800/50 bg-canvas/90 px-2.5 py-2 text-[10px] font-extrabold text-hotpink hover:border-hotpink transition-all cursor-pointer"
              title={isAr ? "عمق الذكاء والتنفيذ" : "Intelligence Depth"}
            >
              <span>
                {activeLevel === "saver"
                  ? isAr
                    ? "✨ سريع"
                    : "✨ Spark"
                  : activeLevel === "deep"
                    ? isAr
                      ? "👑 ملكي"
                      : "👑 Royal"
                    : isAr
                      ? "🌷 متوازن"
                      : "🌷 Glow"}
              </span>
            </button>
          </div>
        </div>

        {/* Offline Banner */}
        {!isOnline && (
          <div className="mx-4 mt-2.5 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-2 text-xs text-ink flex items-center gap-2 shrink-0">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-[11px] text-amber-700 dark:text-amber-200">
              {isAr
                ? "لا يوجد اتصال بالإنترنت — يمكنكِ استخدام قوالب التخطيط الجاهزة بدون انقطاع."
                : "Offline mode — you can continue using built-in planning templates seamlessly."}
            </p>
          </div>
        )}

        {/* Scrollable Conversation Area */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-pink-500/25 hover:[&::-webkit-scrollbar-thumb]:bg-pink-500/40"
        >
          {/* Welcome Screen & Omni-App Quick Commands (When messages is empty) */}
          {messages.length === 0 && (
            <div className="space-y-5 py-1 max-w-2xl mx-auto animate-fade-in">
              {/* Luxury Feminine Hero Card (100% White-Labeled — Zero Model/Provider Names) */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/15 via-rose-500/10 to-fuchsia-500/15 dark:from-pink-950/50 dark:via-rose-950/35 dark:to-purple-950/45 border border-pink-300/60 dark:border-pink-800/50 p-5 text-center shadow-rose-sm">
                <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-2xl text-white shadow-rose">
                  {activeVibeObj.emoji}
                </div>
                <p className="font-script text-2xl text-hotpink leading-snug tracking-wide">
                  {t("bismillahHelp")}
                </p>
                <h2 className="mt-1 font-display text-sm font-extrabold text-ink">
                  {isAr
                    ? "أهلاً بكِ في استوديو AYXA Muse Pro الذكي ✨"
                    : "Welcome to Your AYXA Muse Pro Sanctuary ✨"}
                </h2>
                <p className="mt-1.5 text-[12px] font-medium text-ink-light max-w-md mx-auto leading-relaxed">
                  {isAr
                    ? "وكيلتكِ الذكية المتكاملة متصلة بجميع أقسام تطبيقكِ: اكتبي لها بأي لهجة أو لغة لإضافة مهام، تسجيل عادات، شرب الماء، ترتيب الصلوات، أو تنظيم أهدافكِ وماليتكِ فوراً ♡"
                    : "Your genius AI companion has full access to manage your entire app: write in any language or dialect to schedule tasks, log habits & water, sync prayers, or organize your goals & finances ♡"}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-[10px] font-extrabold">
                  <span className="bg-card/90 px-3 py-1 rounded-full border border-pink-300/50 dark:border-pink-800/50 text-hotpink">
                    {fullAppAccess
                      ? isAr
                        ? "🌟 تحكم شامل بالتطبيق مفعّل"
                        : "🌟 Full App Access Active"
                      : isAr
                        ? "🔒 وصول محدود"
                        : "🔒 Scoped Access"}
                  </span>
                  <span className="bg-card/90 px-3 py-1 rounded-full border border-pink-300/50 dark:border-pink-800/50 text-emerald-600 dark:text-emerald-400">
                    {autoExecuteActions
                      ? isAr
                        ? "⚡ التنفيذ التلقائي الفوري مفعّل"
                        : "⚡ Auto-Pilot Execution On"
                      : isAr
                        ? "📋 مراجعة يدوية"
                        : "📋 Manual Review"}
                  </span>
                </div>
              </div>

              {/* Omni-App Smart Agent Commands */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-hotpink flex items-center gap-1.5 px-1">
                  <Zap size={13} />
                  <span>
                    {isAr
                      ? "أوامر الإدارة الشاملة للتطبيق بلمسة واحدة:"
                      : "1-Tap Full App Management Commands:"}
                  </span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OMNI_QUICK_ACTIONS.map((cmd) => {
                    const promptText = isAr ? cmd.ar : cmd.en;
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={() => void handleSend(promptText)}
                        className="flex items-center justify-between text-start p-3.5 rounded-2xl border border-pink-200/70 dark:border-pink-900/50 bg-card/90 hover:border-hotpink hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-transparent transition-all cursor-pointer group shadow-2xs"
                      >
                        <span className="text-xs font-bold text-ink group-hover:text-hotpink transition-colors leading-relaxed">
                          {promptText}
                        </span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/10 text-hotpink text-xs rtl:rotate-180 group-hover:bg-hotpink group-hover:text-white transition-all shrink-0 ms-2">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feminine Mindset & Glow Topics */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-light flex items-center gap-1.5 px-1">
                  <Sparkles size={12} className="text-hotpink" />
                  <span>
                    {isAr ? "تخطيط اليوم، الدراسة، والروتين الأنثوي:" : "Daily Glow, Study & Routine Prompts:"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map((p) => {
                    const text = isAr ? p.ar : p.en;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => void handleSend(text)}
                        className="text-xs font-semibold px-3.5 py-2 rounded-2xl border border-pink-200/70 dark:border-pink-900/50 bg-surface/60 hover:bg-card hover:border-hotpink hover:text-hotpink text-ink transition-all cursor-pointer shadow-2xs"
                      >
                        {text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collapsible Deterministic Built-in Templates Section */}
              <div className="rounded-3xl border border-pink-200/60 dark:border-pink-900/40 bg-card/70 p-4 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setTemplatesExpanded(!templatesExpanded)}
                  className="flex items-center justify-between w-full text-start cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-pink-500/15 text-hotpink text-xs">
                      🎀
                    </span>
                    <span className="text-xs font-extrabold text-ink">
                      {isAr
                        ? "قوالب AYXA الجاهزة للتطبيق الفوري"
                        : "Ready-to-Use AYXA Signature Templates"}
                    </span>
                    <span className="text-[10px] bg-pink-500/15 text-hotpink font-extrabold px-2 py-0.5 rounded-full">
                      {BUILT_IN_TEMPLATES.length}
                    </span>
                  </div>
                  {templatesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {templatesExpanded && (
                  <div className="space-y-3 pt-2">
                    {BUILT_IN_TEMPLATES.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="rounded-2xl border border-pink-200/60 dark:border-pink-900/40 bg-surface/60 p-3.5 space-y-2.5 shadow-2xs"
                      >
                        <div>
                          <h4 className="text-xs font-extrabold text-ink">
                            {isAr ? tmpl.titleAr : tmpl.titleEn}
                          </h4>
                          <p className="text-[11px] text-ink-light mt-0.5 leading-relaxed">
                            {isAr ? tmpl.descAr : tmpl.descEn}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                          <button
                            type="button"
                            onClick={() => handleOpenTemplateReview(tmpl)}
                            className="grad-theme flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-rose active:scale-95 transition-transform cursor-pointer"
                          >
                            <span>{isAr ? "استعراض وإضافة لجدولي 📋" : "Review & Add 📋"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleSend(isAr ? tmpl.promptAr : tmpl.promptEn)}
                            className="flex items-center gap-1 rounded-full bg-card border border-pink-200/60 dark:border-pink-800/50 px-3 py-1.5 text-xs font-bold text-ink hover:border-hotpink transition-colors cursor-pointer"
                          >
                            <Sparkles size={12} className="text-hotpink" />
                            <span>{isAr ? "تخصيص مع AYXA ✨" : "Customize with AYXA ✨"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Render Messages */}
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((m) => {
              const rawText = m.content;
              if (!rawText) return null;

              const isUser = m.role === "user";
              const displayText = formatPlanTextWithoutRawJson(rawText);
              const proposals = !isUser
                ? m.proposals && m.proposals.length > 0
                  ? m.proposals
                  : extractProposalsFromText(rawText, state)
                : [];
              const wasAutoApplied =
                Array.isArray(m.appliedProposalIds) && m.appliedProposalIds.length > 0;

              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-2.5 animate-fade-in",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!isUser && (
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-sm text-white shadow-rose">
                      🌸
                    </span>
                  )}

                  <div
                    className={cn(
                      "relative max-w-[88%] sm:max-w-[82%] rounded-3xl p-4 text-sm transition-all",
                      isUser
                        ? "bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 rounded-br-xs text-white shadow-rose font-medium"
                        : "rounded-bl-xs border border-pink-200/80 dark:border-pink-800/50 bg-card/95 text-ink shadow-md"
                    )}
                  >
                    {/* Top Muse Badge inside Assistant Bubble */}
                    {!isUser && (
                      <div className="mb-2 flex items-center justify-between border-b border-pink-200/40 dark:border-pink-900/40 pb-1.5 gap-2">
                        <span className="text-[11px] font-extrabold text-hotpink flex items-center gap-1">
                          <span>✨ AYXA Muse Pro</span>
                        </span>

                        <span className="text-[10px] font-bold text-ink-light bg-surface/90 px-2 py-0.5 rounded-full border border-pink-200/50 dark:border-pink-900/40">
                          {activeVibeObj.emoji} {isAr ? activeVibeObj.labelAr : activeVibeObj.labelEn}
                        </span>
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none text-inherit leading-relaxed [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-1.5 [&_strong]:font-extrabold [&_strong]:text-hotpink [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5 [&_ul]:marker:text-hotpink">
                      <ReactMarkdown>{displayText}</ReactMarkdown>
                    </div>

                    {/* Proposals Preview & Instant Action Card */}
                    {!isUser && proposals.length > 0 && (
                      <AiProposalCard
                        proposals={proposals}
                        isApplied={wasAutoApplied}
                        onReview={() => handleOpenMessageProposalsReview(proposals)}
                      />
                    )}

                    {/* Assistant Message Actions (Feedback Rating & Copy) */}
                    {!isUser && (
                      <div className="mt-3 flex items-center justify-between border-t border-pink-200/40 dark:border-pink-900/40 pt-2 text-[10px] text-ink-light gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-ink-light font-semibold">
                            {isAr ? "تقييم الرد:" : "Rate reply:"}
                          </span>
                          <div className="flex items-center gap-1 bg-surface/90 rounded-full px-1.5 py-0.5 border border-pink-200/50 dark:border-pink-900/40">
                            <button
                              type="button"
                              onClick={() => void handleRateReply(m, "good")}
                              title={isAr ? "رد رائع ومفيد" : "Love this reply"}
                              className={cn(
                                "p-1 rounded-full transition-colors cursor-pointer",
                                m.feedbackRating === "good"
                                  ? "text-hotpink bg-pink-500/20"
                                  : "text-ink-light hover:text-hotpink"
                              )}
                            >
                              <ThumbsUp size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRateReply(m, "bad")}
                              title={isAr ? "يحتاج تحسين" : "Needs improvement"}
                              className={cn(
                                "p-1 rounded-full transition-colors cursor-pointer",
                                m.feedbackRating === "bad"
                                  ? "text-rose-500 bg-rose-500/20"
                                  : "text-ink-light hover:text-rose-500"
                              )}
                            >
                              <ThumbsDown size={11} />
                            </button>
                            {ratingToastId === m.id && (
                              <span className="text-[9px] font-extrabold text-hotpink px-1">
                                {isAr ? "شكراً لكِ ♡" : "Saved ♡"}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, displayText)}
                          className="flex items-center gap-1 font-bold text-ink-light hover:text-hotpink transition-colors cursor-pointer px-2 py-0.5 rounded-full hover:bg-surface"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check size={12} className="text-emerald-500" />
                              <span className="text-emerald-500">{isAr ? "تم النسخ" : "Copied"}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>{isAr ? "نسخ" : "Copy"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Active Generation Indicator */}
            {isGenerating && (
              <div className="flex gap-2.5 items-center animate-fade-in">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-sm text-white shadow-rose">
                  🌸
                </span>
                <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 border border-pink-300/60 dark:border-pink-800/50 shadow-rose-sm text-xs font-bold text-hotpink">
                  <span className="h-2 w-2 rounded-full bg-hotpink animate-ping" />
                  <span>
                    {isAr
                      ? "AYXA Muse Pro تحلل بيانات تطبيقكِ وتنسّق خطتكِ..."
                      : "AYXA Muse Pro is analyzing your planner & curating..."}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message with Clear Retry */}
            {customError && (
              <div className="rounded-3xl bg-rose-500/10 border border-rose-400/30 p-4 text-center text-xs text-rose-600 dark:text-rose-300 space-y-2.5">
                <p className="leading-relaxed font-semibold">{customError}</p>
                {lastSubmittedText && (
                  <button
                    type="button"
                    onClick={() => void handleSend(lastSubmittedText)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-2 text-xs font-bold shadow-rose active:scale-95 transition-transform cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>{isAr ? "إعادة المحاولة ✨" : "Try Again ✨"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Luxury Glassmorphic Text Composer */}
        <div className="border-t border-pink-200/50 dark:border-pink-900/40 bg-card/95 backdrop-blur-md px-4 pt-3 pb-[max(14px,env(safe-area-inset-bottom,14px))] shrink-0">
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend(input);
              }}
              className="flex items-center gap-2 rounded-full border-2 border-pink-300/70 dark:border-pink-800/60 focus-within:border-hotpink focus-within:shadow-rose-sm bg-canvas px-4 py-1.5 transition-all"
            >
              <input
                value={input}
                dir={dir}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isAr
                    ? "اكتبي لـ AYXA لإضافة مهام، عادات، ماء، أو خطة يومية..."
                    : "Write to AYXA to add tasks, habits, water, or plan your day..."
                }
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-light/65 py-1.5"
              />

              {/* Stop Generation or Glowing Send Button */}
              {isGenerating ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  aria-label={isAr ? "إيقاف التوليد" : "Stop generation"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:opacity-90 active:scale-90 transition-transform cursor-pointer shrink-0"
                >
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label={isAr ? "إرسال" : "Send"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-rose disabled:opacity-35 hover:scale-105 active:scale-90 transition-all cursor-pointer shrink-0"
                >
                  <SendHorizontal size={16} className="flip-x" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Modals & Drawers */}
        <AiSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />

        <AiCreditsModal
          isOpen={showCreditsModal}
          onClose={() => setShowCreditsModal(false)}
        />

        <AiContextModal
          isOpen={showContextModal}
          onClose={() => setShowContextModal(false)}
          scope={contextScope}
          onUpdateScope={updateAiContextConsent}
          onRevoke={revokeAiContextConsent}
        />

        <AiPlanReviewSheet
          isOpen={reviewSheetConfig.isOpen}
          onClose={() => setReviewSheetConfig((prev) => ({ ...prev, isOpen: false }))}
          title={reviewSheetConfig.title}
          sourceType={reviewSheetConfig.sourceType}
          initialProposals={reviewSheetConfig.proposals}
        />

        <AiConversationsDrawer
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          conversations={state.aiConversations || []}
          activeConversationId={activeConvId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onRenameConversation={renameAiConversation}
          onDeleteConversation={deleteAiConversation}
          onClearAll={clearAiConversations}
        />
      </div>
    </MobileShell>
  );
}
