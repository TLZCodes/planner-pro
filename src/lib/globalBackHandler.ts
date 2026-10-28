import { useEffect } from "react";
import { App } from "@capacitor/app";
import { useRouter } from "@tanstack/react-router";

import { overlayManager } from "./overlayManager";

let lastBackPressTime = 0;

/**
 * GlobalBackHandler:
 * Registered ONCE at the application root (__root.tsx).
 * Handles native Android hardware/gesture back buttons and browser history cleanly with overlay stack.
 */
export function GlobalBackHandler() {
  const router = useRouter();

  useEffect(() => {
    let appListenerHandle: any = null;
    let isCancelled = false;

    const handleBackAction = () => {
      const now = Date.now();

      // 1. Priority 1: Check active overlayManager stack
      if (overlayManager.hasActiveOverlay()) {
        const handled = overlayManager.handleBack();
        if (handled) return true;
      }

      // Fallback legacy overlay dismiss callback
      if (typeof (window as any).__onBackOverlayDismiss === "function") {
        try {
          const handled = (window as any).__onBackOverlayDismiss();
          if (handled) return true;
        } catch (err) {
          console.warn("Error executing __onBackOverlayDismiss:", err);
        }
      }

      // 2. Priority 2: Check any DOM element marked with data-back-close="true"
      const activeCloseBtn = document.querySelector('[data-back-close="true"]') as HTMLElement;
      if (activeCloseBtn && typeof activeCloseBtn.click === "function") {
        activeCloseBtn.click();
        return true;
      }

      // 3. Priority 3: Subroute navigation (anything other than root "/")
      const currentPath = router.state.location.pathname;
      if (currentPath && currentPath !== "/" && currentPath !== "") {
        try {
          const tsrIndex = typeof window !== "undefined" ? (window.history.state?.__TSR_index ?? 0) : 0;
          if (tsrIndex > 0) {
            window.history.back();
          } else {
            router.navigate({ to: "/" });
          }
        } catch {
          router.navigate({ to: "/" });
        }
        return true;
      }

      // 4. Priority 4: At Root Home ("/") - Double tap within 2 seconds to exit app
      if (now - lastBackPressTime < 2000) {
        App.exitApp();
      } else {
        lastBackPressTime = now;
        const toastEl = document.createElement("div");
        toastEl.textContent = "Press back again to exit AYXA Planner";
        toastEl.style.cssText = "position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:bold;z-index:9999;pointer-events:none;transition:opacity 0.3s;box-shadow:0 4px 12px rgba(0,0,0,0.3);";
        document.body.appendChild(toastEl);
        setTimeout(() => {
          toastEl.style.opacity = "0";
          setTimeout(() => toastEl.remove(), 300);
        }, 1800);
      }
      return true;
    };

    const setupGlobalBack = async () => {
      try {
        appListenerHandle = await App.addListener("backButton", () => {
          handleBackAction();
        });

        if (isCancelled && appListenerHandle) {
          appListenerHandle.remove();
        }
      } catch {
        // Standard web browser fallback
      }
    };

    setupGlobalBack();

    // Attach window popstate listener for browser/web gesture back handling
    // IMPORTANT: popstate occurs AFTER history has already changed. Dismiss overlay cleanly without history recursion.
    const handlePopState = () => {
      if (typeof (window as any).__onBackOverlayDismiss === "function") {
        try {
          (window as any).__onBackOverlayDismiss();
        } catch (err) {
          console.warn("Error in popstate __onBackOverlayDismiss:", err);
        }
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      isCancelled = true;
      if (appListenerHandle && typeof appListenerHandle.remove === "function") {
        appListenerHandle.remove();
      }
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  return null;
}
