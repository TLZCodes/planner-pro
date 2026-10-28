import React, { useState } from "react";
import {
  type WheelAreaConfig,
  DEFAULT_WHEEL_AREAS,
  normalizeWheelAreas,
} from "@/lib/wheelOfBecomingEngine";
import {
  X,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Edit2,
  Plus,
  RotateCcw,
  Check,
} from "lucide-react";

interface WheelCustomAreasModalProps {
  open: boolean;
  onClose: () => void;
  currentAreas: WheelAreaConfig[];
  onSaveAreas: (newAreas: WheelAreaConfig[]) => void;
  isAr?: boolean;
}

export function WheelCustomAreasModal({
  open,
  onClose,
  currentAreas,
  onSaveAreas,
  isAr = false,
}: WheelCustomAreasModalProps) {
  const [areas, setAreas] = useState<WheelAreaConfig[]>(() =>
    normalizeWheelAreas(currentAreas)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameEn, setEditNameEn] = useState("");
  const [editNameAr, setEditNameAr] = useState("");

  // New Area form
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  if (!open) return null;

  const handleToggleHide = (id: string) => {
    setAreas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, hidden: !a.hidden } : a))
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= areas.length) return;
    const next = [...areas];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setAreas(next.map((a, i) => ({ ...a, order: i })));
  };

  const handleStartRename = (area: WheelAreaConfig) => {
    setEditingId(area.id);
    setEditNameEn(area.nameEn);
    setEditNameAr(area.nameAr);
  };

  const handleSaveRename = (id: string) => {
    setAreas((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              nameEn: editNameEn.trim() || a.nameEn,
              nameAr: editNameAr.trim() || a.nameAr,
            }
          : a
      )
    );
    setEditingId(null);
  };

  const handleAddCustomArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newArea: WheelAreaConfig = {
      id: `custom_${Date.now()}`,
      nameEn: newTitle.trim(),
      nameAr: newTitle.trim(),
      icon: "Sparkles",
      color: "#EC4899",
      order: areas.length,
      isCustom: true,
    };
    setAreas([...areas, newArea]);
    setNewTitle("");
    setIsAdding(false);
  };

  const handleResetDefaults = () => {
    setAreas(DEFAULT_WHEEL_AREAS.map((a, i) => ({ ...a, order: i })));
  };

  const handleSaveAndClose = () => {
    onSaveAreas(areas);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md max-h-[88vh] flex flex-col bg-[#FFF9F6] rounded-t-3xl sm:rounded-3xl border border-[#F2E5E3] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F2E5E3] flex items-center justify-between bg-white/80">
          <div>
            <h3 className="text-sm font-bold text-[#3D1E28]">
              {isAr ? "تخصيص جوانب دائرة التوازن 🌸" : "Customize Wheel Areas 🌸"}
            </h3>
            <p className="text-[11px] text-[#7A5B64]">
              {isAr
                ? "يمكنكِ إعادة تسمية أي جانب أو إخفائه أو إضافة جوانب خاصة بكِ."
                : "Rename, reorder, hide, or add areas to fit your personal life."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-black/5 text-[#7A5B64] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable list of areas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {areas.map((area, index) => {
            const isEditing = editingId === area.id;

            return (
              <div
                key={area.id}
                className={`p-3 rounded-2xl border transition-all ${
                  area.hidden
                    ? "bg-stone-50/60 border-stone-200/60 opacity-60"
                    : "bg-white border-[#F2E5E3] shadow-2xs"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-semibold text-[#7A5B64] block">
                        {isAr ? "الاسم بالعربية:" : "Arabic Name:"}
                      </label>
                      <input
                        type="text"
                        value={editNameAr}
                        onChange={(e) => setEditNameAr(e.target.value)}
                        dir="rtl"
                        className="w-full p-1.5 text-xs rounded-lg border border-[#F2E5E3] bg-[#FFF9F6]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[#7A5B64] block">
                        {isAr ? "الاسم بالإنجليزية:" : "English Name:"}
                      </label>
                      <input
                        type="text"
                        value={editNameEn}
                        onChange={(e) => setEditNameEn(e.target.value)}
                        dir="ltr"
                        className="w-full p-1.5 text-xs rounded-lg border border-[#F2E5E3] bg-[#FFF9F6]"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-xs text-[#7A5B64]"
                      >
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveRename(area.id)}
                        className="px-3 py-1 text-xs font-bold bg-[#9D174D] text-white rounded-lg shadow-2xs"
                      >
                        {isAr ? "حفظ" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: area.color }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#3D1E28] block truncate">
                          {isAr ? area.nameAr : area.nameEn}
                        </span>
                        {area.hidden && (
                          <span className="text-[10px] text-[#A89297]">
                            {isAr ? "(مخفي من الدائرة)" : "(Hidden from wheel)"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Rename button */}
                      <button
                        type="button"
                        onClick={() => handleStartRename(area)}
                        title={isAr ? "إعادة تسمية" : "Rename"}
                        className="p-1.5 text-[#7A5B64] hover:text-[#3D1E28]"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Move up / down */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, "up")}
                        className="p-1 text-[#7A5B64] disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={index === areas.length - 1}
                        onClick={() => handleMove(index, "down")}
                        className="p-1 text-[#7A5B64] disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>

                      {/* Hide / Unhide */}
                      <button
                        type="button"
                        onClick={() => handleToggleHide(area.id)}
                        title={area.hidden ? (isAr ? "إظهار" : "Show") : (isAr ? "إخفاء" : "Hide")}
                        className={`p-1.5 rounded-lg ${
                          area.hidden ? "text-[#A89297]" : "text-[#E87A90]"
                        }`}
                      >
                        {area.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add custom area form */}
          {isAdding ? (
            <form
              onSubmit={handleAddCustomArea}
              className="p-3 rounded-2xl bg-white border border-rose-300 shadow-xs space-y-2"
            >
              <label className="text-xs font-bold text-[#3D1E28] block">
                {isAr ? "عنوان الجانب الجديد:" : "New area title:"}
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={isAr ? "مثال: القراءة والإبداع..." : "e.g., Creativity, Community..."}
                autoFocus
                dir="auto"
                className="w-full p-2 text-xs rounded-xl border border-[#F2E5E3] bg-[#FFF9F6]"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs text-[#7A5B64]"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3 py-1 text-xs font-bold bg-[#9D174D] text-white rounded-lg disabled:opacity-40"
                >
                  {isAr ? "+ إضافة" : "+ Add"}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 rounded-2xl border border-dashed border-[#F2E5E3] text-xs font-bold text-[#E87A90] hover:bg-rose-50/40 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>{isAr ? "+ إضافة جانب مخصص" : "+ Add custom area"}</span>
            </button>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#F2E5E3] bg-white/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-[#A89297] hover:text-rose-700 flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>{isAr ? "استعادة الجوانب الافتراضية" : "Reset defaults"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-4 py-2 rounded-xl bg-[#9D174D] text-white text-xs font-bold shadow-rose active:scale-95 transition-all"
          >
            {isAr ? "تطبيق التعديلات" : "Apply Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
