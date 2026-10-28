import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BujoCanvasEditor } from "@/components/canvas/BujoCanvasEditor";

export const Route = createFileRoute("/bujo")({
  head: () => ({
    meta: [
      { title: "Bullet Journal Studio — AYXA Planner Pro" },
      {
        name: "description",
        content: "Classic Pastel Hello Brio Digital Bullet Journal & Pro Designer Studio.",
      },
    ],
  }),
  component: BujoStudio,
});

function BujoStudio() {
  const navigate = useNavigate();

  const handleBack = () => {
    try {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        navigate({ to: "/more" });
      }
    } catch {
      navigate({ to: "/more" });
    }
  };

  useEffect(() => {
    (window as any).__onBackOverlayDismiss = () => {
      navigate({ to: "/more" });
      return true;
    };

    return () => {
      (window as any).__onBackOverlayDismiss = null;
    };
  }, [navigate]);

  return (
    <MobileShell>
      <div className="w-full h-[calc(100vh-80px)] flex flex-col bg-[#FAF6F0] overflow-hidden">
        <BujoCanvasEditor onBack={handleBack} />
      </div>
    </MobileShell>
  );
}
