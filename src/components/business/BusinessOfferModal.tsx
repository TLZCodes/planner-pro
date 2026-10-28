import React, { useState } from "react";
import { X, Receipt, Plus, Trash2 } from "lucide-react";
import { useApp, toMinorUnits, type OfferType } from "@/lib/store";

export interface BusinessOfferModalProps {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

export function BusinessOfferModal({ open, onClose, isAr, t }: BusinessOfferModalProps) {
  const { state, addBusinessOffer } = useApp();
  const baseCurrency = state.financeSettings?.baseCurrency || state.prefs?.currency || "MAD";

  const [title, setTitle] = useState("");
  const [type, setType] = useState<OfferType>("service");
  const [price, setPrice] = useState("");
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<string[]>([""]);

  if (!open) return null;

  const handleAddItem = () => {
    setItems([...items, ""]);
  };

  const handleItemChange = (idx: number, val: string) => {
    const updated = [...items];
    updated[idx] = val;
    setItems(updated);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const priceMinor = toMinorUnits(parseFloat(price) || 0);
    const includedItems = items.map((i) => i.trim()).filter(Boolean);

    addBusinessOffer({
      title: title.trim(),
      type,
      priceMinor,
      currency: baseCurrency,
      deliveryEstimate: deliveryEstimate.trim() || undefined,
      description: description.trim() || undefined,
      includedItems,
      status: "active",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-rose-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Receipt size={18} />
            </div>
            <h3 className="text-base font-extrabold text-ink">{t("addOfferBtn")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1 rounded-full text-ink-light hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "عنوان العرض أو الباقة *" : "Offer / Package Title *"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? "مثال: باقة الهوية المتكاملة" : "e.g. Complete Branding Package"}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "النوع" : "Type"}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OfferType)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              >
                <option value="service">{isAr ? "خدمة" : "Service"}</option>
                <option value="package">{isAr ? "باقة" : "Package"}</option>
                <option value="product">{isAr ? "منتج" : "Product"}</option>
                <option value="digital_product">{isAr ? "منتج رقمي" : "Digital Product"}</option>
                <option value="custom">{isAr ? "مخصص" : "Custom"}</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "السعر" : "Price"}
              </label>
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "مدة التسليم المقدرة" : "Delivery Estimate"}
            </label>
            <input
              type="text"
              value={deliveryEstimate}
              onChange={(e) => setDeliveryEstimate(e.target.value)}
              placeholder={isAr ? "مثال: 5 إلى 7 أيام عمل" : "e.g. 5-7 business days"}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "الوصف" : "Description"}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "وصف مختصر لما تقدمه هذه الباقة..." : "Brief summary of what this offer provides..."}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-gold resize-none"
            />
          </div>

          {/* Included Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-ink-light">
                {isAr ? "ما يتضمنه العرض" : "What's Included"}
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="cursor-pointer text-[11px] font-bold text-gold hover:underline flex items-center gap-0.5"
              >
                <Plus size={12} />
                <span>{isAr ? "إضافة عنصر" : "Add item"}</span>
              </button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(idx, e.target.value)}
                  placeholder={isAr ? `عنصر ${idx + 1}...` : `Item ${idx + 1}...`}
                  className="w-full rounded-xl bg-surface border border-border px-3 py-1.5 text-xs font-medium text-ink outline-none focus:border-gold"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="cursor-pointer text-ink-light hover:text-rose-500 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 rounded-2xl bg-surface border border-border py-2.5 text-xs font-bold text-ink-light hover:text-ink"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="cursor-pointer flex-1 rounded-2xl grad-theme py-2.5 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
            >
              {isAr ? "إضافة العرض" : "Add Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
