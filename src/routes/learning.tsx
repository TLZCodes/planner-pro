import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, memo } from "react";
import { Plus } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, PageHeader, FilterPills } from "@/components/kit";
import {
  useApp,
  type LearningItem,
  type LearningItemType,
  type FlashDeck,
  type FlashCard,
  type Book,
} from "@/lib/store";
import { useLang } from "@/lib/i18n";

import { BookshelfTab } from "@/components/learning/bookshelf/BookshelfTab";
import { LearningOverviewTab } from "@/components/learning/LearningOverviewTab";
import { LearningSubjectsTab } from "@/components/learning/LearningSubjectsTab";
import { LearningFlashcardsTab } from "@/components/learning/LearningFlashcardsTab";
import { LearningReviewTab } from "@/components/learning/LearningReviewTab";
import { LearningProgressTab } from "@/components/learning/LearningProgressTab";
import { LearningItemDetailModal } from "@/components/learning/LearningItemDetailModal";
import { LearningItemFormModal } from "@/components/learning/LearningItemFormModal";
import { FlashcardDeckModal } from "@/components/learning/FlashcardDeckModal";
import { FlashcardFormModal } from "@/components/learning/FlashcardFormModal";
import { FlashcardImportModal } from "@/components/learning/FlashcardImportModal";
import { LearningPlanModal } from "@/components/learning/LearningPlanModal";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: "Learning Hub — AYXA Planner Pro" },
      {
        name: "description",
        content:
          "Comprehensive learning system for subjects, courses, books, skills, exam prep, spaced repetition, flashcards and study analytics.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: (search.tab as string) || undefined,
  }),
  component: Learning,
});

type TabKey = "overview" | "bookshelf" | "subjects" | "flashcards" | "review" | "progress";

function Learning() {
  const navigate = useNavigate();
  const { startFocusSession } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const search = Route.useSearch();
  const initialTab: TabKey =
    search?.tab &&
    ["overview", "bookshelf", "subjects", "flashcards", "review", "progress"].includes(search.tab)
      ? (search.tab as TabKey)
      : "overview";

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Modals state
  const [selectedItemDetail, setSelectedItemDetail] = useState<LearningItem | null>(null);
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState<LearningItemType>("subject");

  const [editingDeck, setEditingDeck] = useState<FlashDeck | null>(null);
  const [deckModalOpen, setDeckModalOpen] = useState(false);

  const [activeDeckForCard, setActiveDeckForCard] = useState<string>("");
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);

  const [importDeckId, setImportDeckId] = useState<string>("");
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [defaultPlanItemId, setDefaultPlanItemId] = useState<string | undefined>(undefined);

  // Canonical Focus Session Launch Handlers
  const handleStartFocus = (item: LearningItem) => {
    startFocusSession({
      mode: "pomodoro",
      sourceType: "learning",
      sourceId: item.id,
      sourceLabelSnapshot: item.title,
      plannedFocusSeconds: 25 * 60,
    });
    navigate({ to: "/focus" });
  };

  const handleStartBookFocus = (book: Book) => {
    startFocusSession({
      mode: "pomodoro",
      sourceType: "learning",
      sourceId: book.id,
      sourceLabelSnapshot: book.title,
      plannedFocusSeconds: 25 * 60,
    });
    navigate({ to: "/focus" });
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: t("tabOverview") },
    { key: "bookshelf", label: t("tabBookshelf") },
    { key: "subjects", label: t("tabSubjects") },
    { key: "flashcards", label: t("tabFlashcards") },
    { key: "review", label: t("tabReview") },
    { key: "progress", label: t("tabProgress") },
  ];

  return (
    <MobileShell>
      <Screen className="pb-36">
        {/* ── Page Header ── */}
        <PageHeader
          title={t("learningHubTitle")}
          subtitle={t("learningHubSubtitle")}
          right={
            <button
              onClick={() => {
                setEditingItem(null);
                setDefaultItemType("subject");
                setItemFormOpen(true);
              }}
              className="flex items-center gap-1 px-3.5 py-2 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>{isAr ? "+ هدف جديد" : "+ Add Goal"}</span>
            </button>
          }
        />

        {/* ── 5 Primary Navigation Tabs ── */}
        <div className="mb-6">
          <FilterPills
            pills={tabs}
            active={activeTab}
            onChange={(k) => setActiveTab(k as TabKey)}
          />
        </div>

        {/* ── Tab Views ── */}
        {activeTab === "overview" && (
          <LearningOverviewTab
            onSelectTab={setActiveTab}
            onOpenItemDetail={(item) => setSelectedItemDetail(item)}
            onOpenNewItem={() => {
              setEditingItem(null);
              setDefaultItemType("subject");
              setItemFormOpen(true);
            }}
            onOpenNewPlan={() => {
              setDefaultPlanItemId(undefined);
              setPlanModalOpen(true);
            }}
            onStartFocus={handleStartFocus}
          />
        )}

        {activeTab === "bookshelf" && <BookshelfTab onStartFocus={handleStartBookFocus} />}

        {activeTab === "subjects" && (
          <LearningSubjectsTab
            onOpenItemDetail={(item) => setSelectedItemDetail(item)}
            onOpenNewItem={(type) => {
              setEditingItem(null);
              setDefaultItemType(type || "subject");
              setItemFormOpen(true);
            }}
            onStartFocus={handleStartFocus}
          />
        )}

        {activeTab === "flashcards" && (
          <LearningFlashcardsTab
            onSelectTab={setActiveTab}
            onOpenNewDeck={() => {
              setEditingDeck(null);
              setDeckModalOpen(true);
            }}
            onEditDeck={(deck) => {
              setEditingDeck(deck);
              setDeckModalOpen(true);
            }}
            onOpenNewCard={(deckId) => {
              setActiveDeckForCard(deckId);
              setEditingCard(null);
              setCardModalOpen(true);
            }}
            onEditCard={(deckId, card) => {
              setActiveDeckForCard(deckId);
              setEditingCard(card);
              setCardModalOpen(true);
            }}
            onOpenImport={(deckId) => {
              setImportDeckId(deckId);
              setImportModalOpen(true);
            }}
          />
        )}

        {activeTab === "review" && <LearningReviewTab onSelectTab={setActiveTab} />}

        {activeTab === "progress" && <LearningProgressTab />}

        {/* ── Modals ── */}
        <LearningItemDetailModal
          item={selectedItemDetail}
          open={Boolean(selectedItemDetail)}
          onClose={() => setSelectedItemDetail(null)}
          onEdit={(it) => {
            setSelectedItemDetail(null);
            setEditingItem(it);
            setItemFormOpen(true);
          }}
          onStartFocus={handleStartFocus}
        />

        <LearningItemFormModal
          item={editingItem}
          defaultType={defaultItemType}
          open={itemFormOpen}
          onClose={() => {
            setItemFormOpen(false);
            setEditingItem(null);
          }}
        />

        <FlashcardDeckModal
          deck={editingDeck}
          open={deckModalOpen}
          onClose={() => {
            setDeckModalOpen(false);
            setEditingDeck(null);
          }}
        />

        <FlashcardFormModal
          deckId={activeDeckForCard}
          card={editingCard}
          open={cardModalOpen}
          onClose={() => {
            setCardModalOpen(false);
            setEditingCard(null);
          }}
        />

        <FlashcardImportModal
          deckId={importDeckId}
          open={importModalOpen}
          onClose={() => {
            setImportModalOpen(false);
            setImportDeckId("");
          }}
        />

        <LearningPlanModal
          defaultLearningItemId={defaultPlanItemId}
          open={planModalOpen}
          onClose={() => setPlanModalOpen(false)}
        />
      </Screen>
    </MobileShell>
  );
}
