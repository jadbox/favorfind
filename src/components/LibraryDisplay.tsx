import React, { useState, useEffect } from "react";
import SearchResultCard from "./SearchResultCard";
import type { SearchResult } from "../types";
import { getSavedLibrary } from "../utils/localStorage";

const LibraryDisplay: React.FC = () => {
  const [savedLibrary, setSavedLibrary] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved library from localStorage
    const library = getSavedLibrary();
    setSavedLibrary(library);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="loading loading-spinner loading-lg text-medical-600"></div>
        <div className="text-gray-500 text-lg mt-4">
          Loading your library...
        </div>
      </div>
    );
  }

  if (savedLibrary.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your library is empty
        </h3>
        <p className="text-gray-600 mb-6">
          Start saving articles from your search results to build your personal
          research library.
        </p>
        <a href="/" className="btn btn-primary">
          Start Searching
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {savedLibrary.map((item) => (
        <SearchResultCard key={item.id} result={item} isSaved={true} />
      ))}
    </div>
  );
};

export default LibraryDisplay;
