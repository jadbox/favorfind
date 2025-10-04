import React, { useState, useEffect } from "react";
import SearchResultCard from "./SearchResultCard";
import type { SearchResult } from "../types";
import { getSavedStatus } from "../utils/localStorage";

interface SearchResultsDisplayProps {
  loading: boolean;
  filteredResults: SearchResult[];
}

const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({
  loading,
  filteredResults = [],
}) => {
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Get saved status from localStorage whenever results change
    if (filteredResults.length > 0) {
      const ids = filteredResults.map((r) => r.id);
      const status = getSavedStatus(ids);
      setSavedStatus(status);
    }
  }, [filteredResults]);

  return (
    <div className="grid gap-6" data-results-count={filteredResults.length}>
      {loading ? (
        <div className="text-center py-12">
          <div className="loading loading-spinner loading-lg text-medical-600"></div>
          <div className="text-gray-500 text-lg mt-4">
            Searching medical literature...
          </div>
        </div>
      ) : filteredResults.length > 0 ? (
        filteredResults.map((result) => (
          <SearchResultCard
            key={result.id}
            result={result}
            isSaved={savedStatus[result.id] || false}
          />
        ))
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No results found</div>
          <div className="text-gray-400 text-sm mt-2">
            Try adjusting your filters or search terms
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsDisplay;
