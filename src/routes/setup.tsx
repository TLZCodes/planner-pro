import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/setup")({
  component: SetupRedirect,
});

function SetupRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({
      to: "/onboarding",
      replace: true,
    });
  }, [navigate]);

  return null;
}
