import { StartClient } from "@tanstack/react-start/client";
import { hydrateRoot, createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  // Pure SPA / Capacitor client mount — always createRoot cleanly
  const router = getRouter();
  const root = createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
} else {
  // TanStack Start full-document SSR hydration
  hydrateRoot(document, <StartClient />);
}
