import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

interface BujoCanvasEditorProps {
  onBack?: () => void;
}

export function BujoCanvasEditor({ onBack }: BujoCanvasEditorProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      try {
        if (typeof window !== "undefined" && window.history.length > 1) {
          window.history.back();
        } else {
          navigate({ to: "/more" });
        }
      } catch {
        navigate({ to: "/more" });
      }
    }
  };

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data === "bujo-back") {
        handleBack();
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, [onBack]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#FAF6F0] overflow-hidden">
      <iframe
        src="/bujo-app.html"
        className="w-full h-full border-none flex-1"
        title="Pastel Hello Brio Bullet Journal & Pro Designer Studio"
      />
    </div>
  );
}

export default BujoCanvasEditor;
