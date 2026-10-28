import React, { useState } from "react";
import { MessageSquare, Plus, Trash2, Edit2, Check, X, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { type AiConversation } from "@/lib/aiPlannerEngine";

interface AiConversationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: AiConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
}

export function AiConversationsDrawer({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onClearAll,
}: AiConversationsDrawerProps) {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  if (!isOpen) return null;

  const startRename = (conv: AiConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="relative w-full max-w-xs h-full bg-card border-s border-pink-200/80 dark:border-pink-900/60 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-4 bg-surface/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-hotpink" />
            <h2 id="drawer-title" className="text-sm font-bold text-ink">
              {isAr ? "سجل المحادثات ✨" : "Saved Chats ✨"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-light hover:bg-surface hover:text-ink transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-border/50">
          <button
            type="button"
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full grad-theme flex items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold text-white shadow-rose active:scale-95 transition-transform cursor-pointer"
          >
            <Plus size={16} />
            <span>{isAr ? "محادثة جديدة" : "New Conversation"}</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-ink-light text-xs">
              <Sparkles className="mx-auto h-8 w-8 text-pink-300 mb-2" />
              <p>{isAr ? "لا توجد محادثات سابقة بعد." : "No saved conversations yet."}</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  className={`group rounded-2xl border p-2.5 transition-all ${
                    isActive
                      ? "border-pink-300 dark:border-pink-700 bg-pink-50/40 dark:bg-pink-950/20 shadow-sm"
                      : "border-border/60 bg-card hover:border-pink-200"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-surface px-2 py-1 text-xs rounded-lg text-ink font-bold outline-none border border-hotpink"
                        autoFocus
                      />
                      <button
                        onClick={() => saveRename(conv.id)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-ink-light hover:text-ink"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectConversation(conv.id);
                          onClose();
                        }}
                        className="flex-1 text-start min-w-0 cursor-pointer"
                      >
                        <p className="text-xs font-bold text-ink truncate">{conv.title}</p>
                        <p className="text-[10px] text-ink-light mt-0.5">
                          {conv.messages.length}{" "}
                          {isAr ? "رسائل" : "messages"} •{" "}
                          {new Date(conv.updatedAt).toLocaleDateString(
                            isAr ? "ar-SA" : "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </p>
                      </button>

                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => startRename(conv)}
                          aria-label="Rename"
                          className="p-1 text-ink-light hover:text-hotpink transition-colors cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteConversation(conv.id)}
                          aria-label="Delete"
                          className="p-1 text-ink-light hover:text-danger transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="border-t border-border/80 p-3 bg-surface/40">
            <button
              type="button"
              onClick={onClearAll}
              className="w-full text-center text-xs font-semibold text-danger hover:underline cursor-pointer py-1"
            >
              {isAr ? "مسح جميع المحادثات" : "Clear All Conversations"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
