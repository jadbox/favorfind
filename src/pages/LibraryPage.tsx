import React from "react";
import type { SearchResult, SearchHistory } from "../types";
import Header from "../components/Header";
import Disclaimer from "../components/Disclaimer";
import Sidebar from "../components/Sidebar";
import SearchResultCard from "../components/SearchResultCard";

const LibraryPage = ({
  savedLibrary,
  searchHistory = [],
}: {
  savedLibrary: SearchResult[];
  searchHistory?: SearchHistory[];
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <Sidebar searchHistory={searchHistory} />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Library</h1>
            </div>
            {savedLibrary.length > 0 ? (
              <div className="grid gap-4">
                {savedLibrary.map((item) => (
                  <SearchResultCard
                    key={item.id}
                    result={item}
                    isSaved={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your library is empty
                </h3>
                <p className="text-gray-600 mb-6">
                  Start saving articles from your search results to build your
                  personal research library.
                </p>
                <a href="/" className="btn btn-primary">
                  Start Searching
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Disclaimer />
    </div>
  );
};

export default LibraryPage;

// Server route handler for "/library"
export async function handleLibraryRequest({
  user,
}: import("@/server/context").RequestContext) {
  const { renderDocument } = await import("@/Document");
  return renderDocument({
    title: "Your Library",
    content: (
      <LibraryPage
        savedLibrary={user.savedLibrary}
        searchHistory={user.searchHistory}
      />
    ),
  });
}
