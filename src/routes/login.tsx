import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";

interface LoginSearchParams {
  redirect?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearchParams => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginRedirect,
});

function LoginRedirect() {
  const { redirect } = useSearch({ from: "/login" });
  const navigate = useNavigate();

  useEffect(() => {
    navigate({
      to: "/auth/sign-in",
      search: redirect ? { redirect } : undefined,
      replace: true,
    });
  }, [redirect, navigate]);

  return null;
}
