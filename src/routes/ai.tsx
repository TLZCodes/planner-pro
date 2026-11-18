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
  Shield,
  MessageSquare,
  Square,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Coins,
  Sliders,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
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
  type BuiltInTemplate,
} from "@/lib/aiPlannerEngine";
import {
  COARENA_DEFAULT_MODEL,
  streamCoarenaChat,
  submitCoarenaFeedback,
} from "@/lib/coarenaClient";
import { AiContextModal } from "@/components/ai/AiContextModal";
import { AiPlanReviewSheet } from "@/components/ai/AiPlanReviewSheet";
import { AiConversationsDrawer } from "@/components/ai/AiConversationsDrawer";
import { AiProposalCard } from "@/components/ai/AiProposalCard";
import { AiCreditsModal } from "@/components/ai/AiCreditsModal";
import { AiSettingsModal } from "@/components/ai/AiSettingsModal";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AYXA Pro Helper ✨ — Executive AI Planning Helper" },
      {
        name: "description",
        content:
          "AYXA Pro Helper — Executive AI planning helper for Muslim women and ambitious planners: gentle day planning, night shift schedules, goal breakdown, and study routines.",
      },
    ],
  }),
  component: AiScreen,
});

function AiScreen() {
  const navigate = useNavigate();
  const { t, lang, dir } = useLang();
  const {
    state,
    saveAiConversation,
    deleteAiConversation,
    renameAiConversation,
    clearAiConversations,
    updateAiContextConsent,
    revokeAiContextConsent,
    useAiCredit,
    setAiPersona,
  } = useApp();
  const isAr = lang === "ar";
  const isFeminine = (state.aiPersona || "feminine") === "feminine";

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

  // Offline & Provider Status Detection
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
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

  // Build context summary if user granted permission
  const contextSummaryText = useMemo(() => {
    if (!contextScope.granted) return "";
    return buildUserContextSummary(state, contextScope).summaryText;
  }, [state, contextScope]);

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
          ? "محادثة AYXA Pro"
          : "AYXA Pro Session";

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

  // Handle Send with Coarena streaming + credits verification
  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    const cost = state.aiSettings?.level === "deep" ? 2 : 1;
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

    if (contextScope.granted && contextScope.mode === "single_request") {
      updateAiContextConsent({ granted: false });
    }

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
        persona: state.aiPersona || "feminine",
        level: state.aiSettings?.level || "balanced",
        tone: state.aiSettings?.tone || "barakah",
        model: state.aiSettings?.model || COARENA_DEFAULT_MODEL,
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
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: result.fullText,
                requestId: result.requestId || m.requestId,
                proposals: finalProposals.length > 0 ? finalProposals : undefined,
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
        // Remove empty placeholder on error
        setMessages((prev) =>
          prev.filter((m) => !(m.id === assistantMsgId && !m.content.trim()))
        );
        if (msg.includes("429")) {
          setCustomError(
            isAr
              ? "طلبات متتالية — يرجى الانتظار لحظات بسيطة والمحاولة مجدداً."
              : "Too many requests — please wait a moment and try again.",
          );
        } else {
          setCustomError(
            isAr
              ? "تعذر الاتصال بمحرك AYXA Pro Helper حالياً — يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً."
              : "Unable to reach AYXA Pro Helper right now — please check your internet connection and try again.",
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
    // Optimistically update message rating
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
      title: isAr ? "مراجعة مقترحات الخطة 📋" : "Review Plan Proposals 📋",
      sourceType: "ai_suggestion",
      proposals,
    });
  };

  return (
    <MobileShell hideFooter>
      <div className="flex h-screen max-h-screen flex-col bg-canvas text-ink overflow-hidden">
        {/* Compact Calm Header */}
        <header className="flex items-center justify-between border-b border-border/80 bg-card px-4 py-3 shadow-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 border border-border/80 text-ink shadow-sm hover:bg-surface active:scale-90 transition-transform shrink-0 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180 transition-transform" />
            </button>

            <span className="grad-theme flex h-9 w-9 items-center justify-center rounded-2xl text-base shadow-rose shrink-0">
              ✨
            </span>

            <div className="min-w-0">
              <h1 className="font-display text-base font-bold text-ink leading-tight truncate">
                {isAr
                  ? isFeminine
                    ? "مساعدة AYXA Pro ✨"
                    : "مساعد AYXA Pro ✨"
                  : "AYXA Pro Helper ✨"}
              </h1>
              <p className="text-[11px] font-semibold text-ink-light truncate mt-0.5">
                {isGenerating
                  ? t("thinking")
                  : isAr
                    ? isFeminine
                      ? "مساعدتكِ الذكية الاحترافية لتصبح خطوتكِ القادمة أوضح."
                      : "مساعدك الذكي الاحترافي لتصبح خطوتك القادمة أوضح."
                    : "Executive Pro AI helper to make your next step clearer."}
              </p>
            </div>
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Credits Display */}
            <button
              type="button"
              onClick={() => setShowCreditsModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
              title={isAr ? "رصيد نقاط الذكاء الاصطناعي" : "AI Credits"}
            >
              <Coins size={13} className="text-amber-500" />
              <span>{state.aiCredits ?? 50}</span>
            </button>

            {/* Context Selector Button */}
            <button
              type="button"
              onClick={() => setShowContextModal(true)}
              aria-label={isAr ? "صلاحيات سياق التخطيط" : "Planner Context Settings"}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors cursor-pointer ${
                contextScope.granted
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                  : "border-border/80 bg-surface/80 text-ink-light hover:text-ink"
              }`}
              title={
                contextScope.granted
                  ? isAr
                    ? "سياق التخطيط مفعّل"
                    : "Planner context active"
                  : isAr
                    ? "السياق الشخصي غير مشارك (افتراضي)"
                    : "No personal context shared (default)"
              }
            >
              <Shield size={16} />
              {contextScope.granted && (
                <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Saved Chats Drawer Button */}
            <button
              type="button"
              onClick={() => setShowDrawer(true)}
              aria-label={isAr ? "المحادثات السابقة" : "Saved conversations"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-surface/80 text-ink-light hover:text-ink transition-colors cursor-pointer"
            >
              <MessageSquare size={16} />
            </button>

            {/* AI Agent Settings Button */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              aria-label={isAr ? "إعدادات المساعد وحماية الرصيد" : "AI Settings"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-surface/80 text-ink-light hover:text-ink transition-colors cursor-pointer"
              title={isAr ? "إعدادات AYXA Pro Helper ⚙️" : "AYXA Pro Helper Settings ⚙️"}
            >
              <Sliders size={16} />
            </button>

            {/* New Conversation Button */}
            <button
              type="button"
              onClick={handleNewConversation}
              aria-label={isAr ? "محادثة جديدة" : "New conversation"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-hotpink text-white shadow-rose hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus size={18} />
            </button>
          </div>
        </header>

        {/* Persona Selector & Credits Balance Control Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-surface/50 px-4 py-2 shrink-0">
          <div className="flex items-center gap-1 bg-canvas/80 p-0.5 rounded-full border border-border/80">
            <button
              type="button"
              onClick={() => setAiPersona("feminine")}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                isFeminine
                  ? "bg-hotpink text-white shadow-rose"
                  : "text-ink-light hover:text-ink",
              )}
            >
              <span>🌸</span>
              <span>{isAr ? "مساعدة AYXA Pro" : "AYXA Pro Helper (Sister)"}</span>
            </button>
            <button
              type="button"
              onClick={() => setAiPersona("masculine")}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                !isFeminine
                  ? "bg-slate-700 text-white shadow-sm dark:bg-slate-600"
                  : "text-ink-light hover:text-ink",
              )}
            >
              <span>🌿</span>
              <span>{isAr ? "مساعد AYXA Pro" : "AYXA Pro Helper (Brother)"}</span>
            </button>
          </div>

          {/* Credits Recharge Link */}
          <button
            type="button"
            onClick={() => setShowCreditsModal(true)}
            className="flex items-center gap-1 text-xs font-bold text-hotpink hover:underline active:scale-95 transition-transform cursor-pointer"
          >
            <span>{isAr ? "شحن نقاط ⚡" : "Recharge ⚡"}</span>
          </button>
        </div>

        {/* Active AI Status Pill */}
        {isOnline && !customError && (
          <div className="mx-4 mt-2.5 rounded-2xl border border-pink-200/80 dark:border-pink-900/50 bg-gradient-to-r from-pink-50/70 via-rose-50/40 to-pink-50/70 dark:bg-card px-3.5 py-2 text-xs text-ink flex items-center justify-between shadow-2xs animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-ink text-[11px]">
                {isAr
                  ? isFeminine
                    ? "مساعدة AYXA Pro نشطة وجاهزة لمساعدتكِ ✨"
                    : "مساعد AYXA Pro نشط وجاهز لمساعدتك ✨"
                  : "AYXA Pro Helper Active & Ready ✨"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="text-[10px] font-bold text-hotpink bg-white/90 dark:bg-card/90 px-2.5 py-0.5 rounded-full border border-pink-200/70 dark:border-pink-800/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
              title={isAr ? "اضغط لتعديل مستوى الاستهلاك أو المحرك" : "Click to adjust level or model"}
            >
              <span>
                {state.aiSettings?.level === "saver"
                  ? isAr ? "💡 اقتصادي (1 نقطة)" : "💡 Saver (1 pt)"
                  : state.aiSettings?.level === "deep"
                    ? isAr ? "🚀 مفصّل (2 نقطة)" : "🚀 Pro (2 pts)"
                    : isAr ? "⚖️ متوازن (1 نقطة)" : "⚖️ Balanced (1 pt)"}
              </span>
            </button>
          </div>
        )}

        {!isOnline && (
          <div className="mx-4 mt-2.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 px-3.5 py-2 text-xs text-ink flex items-center gap-2 shadow-2xs shrink-0">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              {isAr
                ? "لا يوجد اتصال بالإنترنت — يمكنكِ استخدام قوالب التخطيط المدمجة بدون انقطاع."
                : "Offline mode — you can continue using built-in planning templates seamlessly."}
            </p>
          </div>
        )}

        {customError && (
          <div className="mx-4 mt-2.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 px-3.5 py-2 text-xs text-ink flex items-start gap-2 shadow-2xs shrink-0">
            <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] text-rose-800 dark:text-rose-300">{customError}</p>
            </div>
          </div>
        )}

        {/* Scrollable Conversation Area */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        >
          {/* Welcome Screen & Starter Prompts (When messages is empty) */}
          {messages.length === 0 && (
            <div className="space-y-4 py-2 animate-fade-in">
              {/* Islamic Spiritual Barakah Banner Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/15 via-rose-500/10 to-amber-500/15 border border-pink-300/70 dark:border-pink-900/60 p-5 text-center shadow-rose-sm">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-sm">
                  <span>✨</span>
                  <span className="text-2xl">{isFeminine ? "🌸" : "🌿"}</span>
                  <span>✨</span>
                </div>
                <p className="font-script text-2xl text-hotpink leading-snug tracking-wide">
                  {t("bismillahHelp")}
                </p>
                <p className="mt-1 text-[12px] font-medium text-ink-light max-w-sm mx-auto leading-relaxed">
                  {isAr
                    ? isFeminine
                      ? "مرحباً بكِ في AYXA Pro Helper — مساعدتكِ الذكية الاحترافية لتنظيم يومكِ بعقلية البركة، تيسير الخطوات القادمة، وبناء روتين متوازن يجمع بين الطمأنينة والإنجاز ♡"
                      : "مرحباً بك في AYXA Pro Helper — مساعدك الذكي الاحترافي لتنظيم يومك بعقلية البركة، تيسير الخطوات القادمة، وبناء روتين متوازن يجمع بين الطمأنينة والإنجاز ♡"
                    : "Welcome to AYXA Pro Helper — your executive AI helper to clarify your next step with calm structure, mindful routines, and Barakah ♡"}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold">
                  <span className="bg-white/85 dark:bg-card/85 px-3 py-1 rounded-full border border-pink-200/70 dark:border-pink-800/50 shadow-2xs text-amber-700 dark:text-amber-300">
                    🪙 {state.aiCredits ?? 50} {isAr ? "نقطة رصيد" : "credits"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(true)}
                    className="bg-white/85 dark:bg-card/85 px-3 py-1 rounded-full border border-pink-200/70 dark:border-pink-800/50 shadow-2xs hover:text-hotpink transition-colors cursor-pointer"
                  >
                    ⚙️{" "}
                    {state.aiSettings?.level === "saver"
                      ? isAr
                        ? "نظام اقتصادي"
                        : "Saver"
                      : state.aiSettings?.level === "deep"
                        ? isAr
                          ? "نظام مفصل"
                          : "Pro Deep"
                        : isAr
                          ? "نظام متوازن"
                          : "Balanced"}
                  </button>
                </div>
              </div>

              {/* Starter Prompts */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-light flex items-center gap-1.5">
                  <Sparkles size={12} className="text-hotpink" />
                  {isAr ? "بدايات مقترحة:" : "Starter Prompts:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STARTER_PROMPTS.map((p) => {
                    const promptText = isAr ? p.ar : p.en;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => void handleSend(promptText)}
                        className="flex items-center justify-between text-start p-3 rounded-2xl border border-pink-200/80 dark:border-pink-900/60 bg-card hover:border-pink-400 hover:shadow-rose transition-all cursor-pointer group"
                      >
                        <span className="text-xs font-semibold text-ink group-hover:text-hotpink transition-colors">
                          {promptText}
                        </span>
                        <span className="text-ink-light group-hover:text-hotpink text-xs rtl:rotate-180">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mindset & Life Routine Questions */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-light flex items-center gap-1.5">
                  <Bookmark size={12} className="text-hotpink" />
                  {isAr ? "أسئلة العقلية والروتين المتوازن:" : "Mindset & Daily Routine Topics:"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      ar: "كيف أعيش بعقلية البركة والإنتاجية الهادئة؟ 🌿",
                      en: "How do I cultivate the Barakah Mindset? 🌿",
                    },
                    {
                      ar: "اقترحي روتيناً صباحياً هادئاً قبل العمل ☕",
                      en: "Suggest a calm morning routine before work ☕",
                    },
                    {
                      ar: "كيف أتغلب على التسويف دون قسوة على نفسي؟ 🌸",
                      en: "How to overcome procrastination with self-compassion? 🌸",
                    },
                    {
                      ar: "كيف أنسق مهامي بين أوقات الصلوات الخمس؟ 🕌",
                      en: "How to arrange my day between prayer times? 🕌",
                    },
                    {
                      ar: "أشعر بالتشتت والإرهاق، كيف أبدأ خطوة صغيرة؟ ✨",
                      en: "I feel overwhelmed, how to take a tiny gentle step? ✨",
                    },
                  ].map((topic, i) => {
                    const text = isAr ? topic.ar : topic.en;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => void handleSend(text)}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-pink-200/90 dark:border-pink-900/60 bg-surface/70 hover:bg-card hover:border-hotpink hover:text-hotpink text-ink transition-all cursor-pointer shadow-2xs"
                      >
                        {text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collapsible Deterministic Built-in Templates Section */}
              <div className="rounded-2xl border border-border/80 bg-surface/50 p-3.5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setTemplatesExpanded(!templatesExpanded)}
                  className="flex items-center justify-between w-full text-start cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Bookmark size={14} className="text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-ink">
                      {isAr
                        ? "قوالب التخطيط المدمجة (الجاهزة)"
                        : "Built-in Templates (Deterministic)"}
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">
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
                        className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-2 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-ink">
                              {isAr ? tmpl.titleAr : tmpl.titleEn}
                            </h4>
                            <p className="text-[11px] text-ink-light mt-0.5 leading-relaxed">
                              {isAr ? tmpl.descAr : tmpl.descEn}
                            </p>
                          </div>
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
                            className="flex items-center gap-1 rounded-full bg-ghost px-3 py-1.5 text-xs font-bold text-ink hover:bg-surface transition-colors cursor-pointer"
                          >
                            <Sparkles size={12} className="text-hotpink" />
                            <span>{isAr ? "توسيع بالسؤال ✨" : "Ask AYXA Pro ✨"}</span>
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

            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-sm shadow-sm">
                    {isFeminine ? "🌸" : "🌿"}
                  </span>
                )}

                <div
                  className={`relative max-w-[85%] rounded-3xl p-3.5 text-sm ${
                    isUser
                      ? "grad-theme rounded-br-sm text-white shadow-rose font-medium"
                      : "rounded-bl-sm border border-pink-200/70 dark:border-pink-900/50 bg-card text-ink shadow-sm"
                  }`}
                >
                  <div className="prose prose-sm max-w-none text-inherit leading-relaxed [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-1 [&_strong]:font-bold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5">
                    <ReactMarkdown>{displayText}</ReactMarkdown>
                  </div>

                  {/* Proposals Preview Card (If model returned a plan) */}
                  {!isUser && proposals.length > 0 && (
                    <AiProposalCard
                      proposals={proposals}
                      onReview={() => handleOpenMessageProposalsReview(proposals)}
                    />
                  )}

                  {/* Assistant Message Actions (Signature, Feedback Rating & Copy) */}
                  {!isUser && (
                    <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-ink-light gap-2">
                      <span className="font-bold text-ink-light truncate">
                        {isAr
                          ? isFeminine
                            ? "مساعدة AYXA Pro ✨"
                            : "مساعد AYXA Pro ✨"
                          : "AYXA Pro Helper ✨"}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Coarena Reply Rating Buttons (POST /api/v1/feedback) */}
                        <div className="flex items-center gap-1 bg-surface/80 rounded-full px-1.5 py-0.5 border border-border/60">
                          <button
                            type="button"
                            onClick={() => void handleRateReply(m, "good")}
                            title={isAr ? "رد مفيد" : "Helpful reply"}
                            className={cn(
                              "p-1 rounded-full transition-colors cursor-pointer",
                              m.feedbackRating === "good"
                                ? "text-emerald-600 bg-emerald-100/80 dark:bg-emerald-950/60"
                                : "text-ink-light hover:text-emerald-600"
                            )}
                          >
                            <ThumbsUp size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRateReply(m, "bad")}
                            title={isAr ? "رد غير دقيق" : "Needs improvement"}
                            className={cn(
                              "p-1 rounded-full transition-colors cursor-pointer",
                              m.feedbackRating === "bad"
                                ? "text-rose-600 bg-rose-100/80 dark:bg-rose-950/60"
                                : "text-ink-light hover:text-rose-600"
                            )}
                          >
                            <ThumbsDown size={11} />
                          </button>
                          {ratingToastId === m.id && (
                            <span className="text-[9px] font-bold text-emerald-600 px-1">
                              {isAr ? "تم التقييم ✓" : "Rated ✓"}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, displayText)}
                          className="flex items-center gap-1 font-semibold hover:text-hotpink transition-colors cursor-pointer"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check size={12} className="text-emerald-600" />
                              <span className="text-emerald-600">{isAr ? "تم النسخ" : "Copied"}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>{isAr ? "نسخ" : "Copy"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Generation Indicator */}
          {isGenerating && (
            <div className="flex gap-2.5 items-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-sm">
                {isFeminine ? "🌸" : "🌿"}
              </span>
              <div className="flex items-center gap-1.5 rounded-full bg-card px-4 py-2.5 border border-pink-200/70 dark:border-pink-900/50 shadow-sm text-xs font-semibold text-ink-light">
                <span className="h-2 w-2 rounded-full bg-hotpink animate-ping" />
                <span>
                  {isAr
                    ? "مساعدة AYXA Pro تحلل وتصوغ الخطة..."
                    : "AYXA Pro Helper is thinking & drafting..."}
                </span>
              </div>
            </div>
          )}

          {/* Error Message with Clear Retry */}
          {customError && (
            <div className="rounded-2xl bg-danger/10 border border-danger/20 p-3.5 text-center text-xs text-danger space-y-2">
              <p className="leading-relaxed">{customError}</p>
              {lastSubmittedText && (
                <button
                  type="button"
                  onClick={() => void handleSend(lastSubmittedText)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-danger text-white px-4 py-1.5 text-xs font-bold shadow-sm active:scale-95 transition-transform cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>{isAr ? "إعادة المحاولة" : "Retry"}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Persistent Accessible Composer */}
        <div className="border-t border-border/80 bg-card px-4 pt-3 pb-[calc(80px+env(safe-area-inset-bottom,12px))] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend(input);
            }}
            className="flex items-center gap-2 rounded-full border-2 border-pink-200/80 dark:border-pink-900/70 bg-canvas px-4 py-1.5 focus-within:border-hotpink shadow-sm transition-all"
          >
            <input
              value={input}
              dir={dir}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isAr
                  ? "اسألي مساعدة AYXA Pro عن أي شيء..."
                  : "Ask AYXA Pro Helper anything..."
              }
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-light/70 py-1.5"
            />

            {/* Stop Generation or Send Button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                aria-label={isAr ? "إيقاف التوليد" : "Stop generation"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-danger text-white shadow-sm hover:opacity-90 active:scale-90 transition-transform cursor-pointer"
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label={isAr ? "إرسال" : "Send"}
                className="flex h-10 w-10 items-center justify-center rounded-full text-hotpink disabled:opacity-40 hover:bg-surface active:scale-90 transition-transform cursor-pointer"
              >
                <SendHorizontal size={20} className="flip-x" />
              </button>
            )}
          </form>

          {/* Minimal Safe Privacy & Zero-XP Note + Quick Credits Top-up */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-ink-light px-2">
            <span>
              {contextScope.granted
                ? isAr
                  ? "🔒 السياق مفعّل بنطاق محدد"
                  : "🔒 Defined context enabled"
                : isAr
                  ? "🔒 سياق التخطيط الشخصي مغلق"
                  : "🔒 Personal context closed"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100/80 dark:bg-pink-950/60 text-hotpink hover:underline transition-all cursor-pointer"
                title={isAr ? "تغيير مستوى الاستهلاك" : "Change level"}
              >
                {state.aiSettings?.level === "saver"
                  ? isAr ? "💡 اقتصادي" : "💡 Saver"
                  : state.aiSettings?.level === "deep"
                    ? isAr ? "🚀 مفصّل" : "🚀 Pro"
                    : isAr ? "⚖️ متوازن" : "⚖️ Balanced"}
              </button>

              <button
                type="button"
                onClick={() => setShowCreditsModal(true)}
                className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 hover:text-amber-600 transition-colors cursor-pointer"
              >
                <Coins size={11} className="text-amber-500" />
                <span>
                  {state.aiCredits ?? 50} {isAr ? "نقطة" : "pts"}
                </span>
              </button>

              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {isAr ? "0 XP للإضافة" : "0 XP"}
              </span>
            </div>
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
