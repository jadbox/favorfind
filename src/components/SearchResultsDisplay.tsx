import React from "react";
import SearchResultCard from "./SearchResultCard";
import type { SearchResult } from "../types";

interface SearchResultsDisplayProps {
  loading: boolean;
  filteredResults: SearchResult[];
  savedIds: string[];
}

const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({
  loading,
  filteredResults,
  savedIds,
}) => {
  return (
    <div className="grid gap-6">
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
            isSaved={savedIds.includes(result.id)}
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
