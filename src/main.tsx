import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App.tsx";
import "./index.css";
import SearchPage from "./pages/SearchPage.tsx";
import SearchResultsPage from "./pages/SearchResultsPage.tsx";
import LibraryPage from "./pages/LibraryPage.tsx";
import { searchAction } from "./actions/search.ts"; // Import the new action

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
        path: "search",
        element: <SearchResultsPage />, // onSearch prop will be handled by action
        action: searchAction, // Associate the action with this route
        loader: async ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get("q");
          return { query };
        },
      },
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
