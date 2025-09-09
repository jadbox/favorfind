import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css"; // globals
import SearchPage from "./pages/SearchPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import LibraryPage from "./pages/LibraryPage";
// Optional: read SSR JSON props if present (non-blocking)
function readSSRProps<T = unknown>(): T | undefined {
  const el = document.getElementById("ssr-props");
  if (!el) return undefined;
  try {
    return JSON.parse(el.textContent || "");
  } catch {
    return undefined;
  }
}

// Example usage later if needed:
// const ssrData = readSSRProps<{ lastSearch?: { query: string; count: number; ts: number } }>();
// You can pass this into context or state when booting the app.


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <SearchPage />,
      },
      {
        path: "api/search",
      },
  { path: "search", element: <SearchResultsPage /> },
      {
        path: "library",
        element: <LibraryPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
