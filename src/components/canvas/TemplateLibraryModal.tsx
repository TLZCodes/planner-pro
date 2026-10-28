import React, { useState } from "react";
import { useCanvasState } from "@/lib/canvasStore";
import { TEMPLATES_DATA, getUserCustomTemplates, saveCustomUserTemplate } from "@/lib/templatesData";
import type { TemplateCategory } from "@/types/canvasTypes";
import { cn } from "@/lib/utils";

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATE_CATEGORIES = [
  { key: "all", label: "All (~60 Spreads)", icon: "✨" },
  { key: "planning", label: "Planning & Spreads", icon: "📅" },
  { key: "trackers", label: "Trackers", icon: "✅" },
  { key: "finance", label: "Finance", icon: "💵" },
  { key: "study", label: "Study & Work", icon: "📚" },
  { key: "goals", label: "Goals & Reflection", icon: "🎯" },
  { key: "decorative", label: "Covers & Quotes", icon: "🌸" },
  { key: "my-templates", label: "My Templates", icon: "⭐" },
];

export function TemplateLibraryModal({ isOpen, onClose }: TemplateLibraryModalProps) {
  const state = useCanvasState();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  if (!isOpen) return null;

  const customTemplates = getUserCustomTemplates();
  const allAvailableTemplates = [...TEMPLATES_DATA, ...customTemplates];

  const filteredTemplates = allAvailableTemplates.filter((t) => {
    const matchesCat = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleApplyTemplate = (tmplPage: any) => {
    state.addPage(tmplPage);
    onClose();
  };

  const handleSaveActivePageAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const activePage = state.journal.pages[state.journal.activePageIndex];
    if (!activePage || !saveTitle.trim()) return;
    saveCustomUserTemplate(activePage, saveTitle.trim());
    setSaveTitle("");
    setShowSaveForm(false);
    setActiveCategory("my-templates");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border/60 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-rose-lg text-ink">
        {/* Header */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧩</span>
            <h2 className="text-lg font-extrabold text-ink">Template Gallery (~60 Spreads)</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-ghost flex items-center justify-center font-bold text-xs hover:bg-hotpink hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-border/40 space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search 60+ spreads: Weekly, Habit Grid, Budget, Pomodoro, Vision Board..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-2xl bg-surface border border-border/60 px-4 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
            />
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="grad-theme text-white px-3.5 py-2.5 rounded-2xl text-xs font-extrabold shadow-rose-sm shrink-0"
            >
              + Save Active Page
            </button>
          </div>

          {showSaveForm && (
            <form onSubmit={handleSaveActivePageAsTemplate} className="flex items-center gap-2 bg-surface p-2.5 rounded-2xl border border-hotpink animate-fade-in">
              <input
                type="text"
                placeholder="Template name (e.g. My Pink Habit Spread)..."
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                className="flex-1 bg-card border border-border/40 px-3 py-1.5 rounded-xl text-xs font-bold text-ink outline-none"
              />
              <button type="submit" className="bg-hotpink text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                Save
              </button>
            </form>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                  activeCategory === cat.key
                    ? "bg-hotpink text-white border-hotpink shadow-rose-sm"
                    : "bg-ghost border-transparent text-ink-light hover:text-ink hover:bg-surface"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleApplyTemplate(tmpl.page)}
              className="flex flex-col justify-between p-4 rounded-2xl bg-surface border border-border/40 hover:border-hotpink hover:scale-102 transition-all cursor-pointer shadow-sm group min-h-[140px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{tmpl.icon}</span>
                  <span className="text-[10px] font-bold uppercase text-hotpink bg-hotpink/10 px-2 py-0.5 rounded-full">
                    {tmpl.category}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-extrabold text-ink group-hover:text-hotpink line-clamp-1">
                  {tmpl.title}
                </h3>
                <p className="mt-1 text-xs font-semibold text-ink-light line-clamp-2">
                  {tmpl.description}
                </p>
              </div>

              {/* Color Swatch Preview */}
              <div className="mt-3 flex items-center gap-1">
                {tmpl.palette.map((c, i) => (
                  <span key={i} style={{ backgroundColor: c }} className="h-2.5 w-2.5 rounded-full border border-black/20" />
                ))}
                <span className="ml-auto text-[10px] font-bold text-hotpink">Load Layout →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
