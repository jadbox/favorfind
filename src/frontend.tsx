import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css"; // globals
import SearchPage from "./pages/SearchPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import LibraryPage from "./pages/LibraryPage";
import { fetchSearchResults } from "./api/search";

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
      {
        path: "search",
        element: <SearchResultsPage />,
        loader: async ({ request }: { request: Request }) => {
          console.log("Frontend: Loader for /search triggered.");
          const url = new URL(request.url);
          const query = url.searchParams.get("q");
          console.log("Frontend: Loader query:", query);

          if (query) {
            try {
              const results = await fetchSearchResults(query);
              console.log("Frontend: Loader fetched results:", results);
              return { query, results };
            } catch (error) {
              console.error(
                "Frontend: Error fetching search results in loader:",
                error
              );
              return { query, results: [] };
            }
          }
          console.log("Frontend: Loader returning no query or empty results.");
          return { query, results: [] };
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
