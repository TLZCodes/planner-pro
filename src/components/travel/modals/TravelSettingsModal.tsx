import React, { useState } from "react";
import { X, Settings, Shield, Moon, DollarSign, Bell } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { DEFAULT_TRAVEL_SETTINGS } from "@/lib/travelEngine";

interface TravelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TravelSettingsModal({ isOpen, onClose }: TravelSettingsModalProps) {
  const { state, updateTravelSettings } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const settings = state.travelSettings || DEFAULT_TRAVEL_SETTINGS;

  const [travelLock, setTravelLock] = useState(settings.travelLockEnabled);
  const [hidePreview, setHidePreview] = useState(settings.hideAppSwitcherPreview);
  const [hideNotifDetails, setHideNotifDetails] = useState(settings.hideNotificationDetails);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency || "MAD");
  const [quietHours, setQuietHours] = useState(settings.quietHours);

  if (!isOpen) return null;

  const handleSave = () => {
    updateTravelSettings({
      travelLockEnabled: travelLock,
      hideAppSwitcherPreview: hidePreview,
      hideNotificationDetails: hideNotifDetails,
      defaultCurrency: defaultCurrency.toUpperCase(),
      quietHours,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-surface-cream text-ink border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="text-base font-bold text-ink flex items-center gap-1.5">
            <Settings size={16} className="text-hotpink" />
            <span>{isAr ? "إعدادات السفر والخصوصية" : "Travel & Privacy Settings"}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Default Currency */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "العملة الافتراضية للسفر" : "Default Travel Currency"}
            </label>
            <input
              type="text"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink uppercase"
            />
          </div>

          {/* Privacy & App Switcher */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border">
            <div className="pr-3">
              <p className="text-xs font-bold text-ink flex items-center gap-1">
                <Shield size={13} className="text-emerald-500" />
                <span>{isAr ? "إخفاء التفاصيل في مبدل التطبيقات" : "Hide Details in App Switcher"}</span>
              </p>
              <p className="text-[10px] text-ink-light mt-0.5">
                {isAr
                  ? "حجب الوجهات والتواريخ في شاشة المعاينة المتعددة"
                  : "Blurs destination and dates in recent apps preview"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={hidePreview}
              onChange={(e) => setHidePreview(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
          </div>

          {/* Hide Sensitive Notification Details */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border">
            <div className="pr-3">
              <p className="text-xs font-bold text-ink flex items-center gap-1">
                <Bell size={13} className="text-purple-500" />
                <span>{isAr ? "إخفاء التفاصيل من الإشعارات" : "Private Notification Previews"}</span>
              </p>
              <p className="text-[10px] text-ink-light mt-0.5">
                {isAr
                  ? "عدم عرض مراجع الحجز أو أرقام التذاكر في الإشعارات العامة"
                  : "Hides booking references and flight numbers from notification previews"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={hideNotifDetails}
              onChange={(e) => setHideNotifDetails(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
          </div>

          {/* Quiet hours */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border">
            <div className="pr-3">
              <p className="text-xs font-bold text-ink flex items-center gap-1">
                <Moon size={13} className="text-amber-500" />
                <span>{isAr ? "ساعات الهدوء الليلية" : "Quiet Hours Protection"}</span>
              </p>
              <p className="text-[10px] text-ink-light mt-0.5">
                {isAr
                  ? "عدم إرسال تنبيهات السفر أثناء ساعات النوم"
                  : "Silences travel checklist reminders during nighttime"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={quietHours}
              onChange={(e) => setQuietHours(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="cursor-pointer w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all"
          >
            {isAr ? "حفظ التفضيلات ✨" : "Save Preferences ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}
