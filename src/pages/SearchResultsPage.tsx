import React, { useEffect, useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SearchBar from "../components/SearchBar";
import SearchResultsFilters from "../components/SearchResultsFilters";
import SearchResultsDisplay from "../components/SearchResultsDisplay";
import type { SearchResult } from "../types";
import {
  addSearchToHistory,
  toggleSaveToLibrary,
  getStoredUserData,
} from "../utils/localStorage";
// Note: data loading is handled via route loader and a client fallback to /api/search

interface LoaderData {
  query: string;
  results: SearchResult[];
}

const SearchResultsPage: React.FC = () => {
  const { query, results: initialResults } = useLoaderData() as LoaderData;
  const navigate = useNavigate();
  const currentQuery = query; // Use query from loader data
  console.log("SearchResultsPage: currentQuery from loader:", currentQuery);

  const [results, setResults] = useState<SearchResult[]>(initialResults);
  const [filteredResults, setFilteredResults] =
    useState<SearchResult[]>(initialResults);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "citations">(
    "relevance"
  );
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadSavedIds = () => {
    const userData = getStoredUserData();
    setSavedIds(userData.savedLibrary.map((item) => item.id));
  };

  useEffect(() => {
    loadSavedIds();

    const handleStorage = () => {
      loadSavedIds();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    // This effect will now only handle updates to results/filteredResults
    // when initialResults change (e.g., from a new search via loader)
    setResults(initialResults);
    setFilteredResults(initialResults);
    if (currentQuery && initialResults.length > 0) {
      addSearchToHistory(currentQuery, initialResults.length);
      window.dispatchEvent(new Event("storage"));
    }
  }, [initialResults, currentQuery]);

  // Fallback: on direct navigation, ensure we fetch via backend if loader returned no results
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q")?.trim();
    if (!q) return;
    // If we already have results from loader, skip
    if (results && results.length > 0) return;

    let cancelled = false;
    const fetchFromBackend = async () => {
      try {
        setLoading(true);
        const form = new FormData();
        form.append("query", q);
        const res = await fetch("/api/search", { method: "POST", body: form });
        if (!res.ok) throw new Error(`Backend error ${res.status}`);
        const data: SearchResult[] = await res.json();
        if (cancelled) return;
        setResults(data);
        setFilteredResults(data);
        addSearchToHistory(q, data.length);
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        console.error("SearchResultsPage: backend fetch failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFromBackend();
    return () => {
      cancelled = true;
    };
  }, [results]);

  useEffect(() => {
    let filtered = results;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((result) => result.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (result) => result.category === selectedCategory
      );
    }

    // Sort results
    switch (sortBy) {
      case "date":
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(b.publicationDate).getTime() -
            new Date(a.publicationDate).getTime()
        );
        break;
      case "citations":
        filtered = [...filtered].sort(
          (a, b) => b.citationCount - a.citationCount
        );
        break;
      default:
        // Keep original relevance order
        break;
    }

    setFilteredResults(filtered);
  }, [results, selectedType, selectedCategory, sortBy]);

  const handleNewSearch = (newQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handleToggleSave = (result: SearchResult) => {
    toggleSaveToLibrary(result);
    // Update saved IDs after toggling
    loadSavedIds();
  };

  const uniqueCategories = Array.from(
    new Set(results.map((r) => r.category).filter(Boolean) as string[])
  );

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button and search */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="flex-1">
            <SearchBar onSearch={handleNewSearch} defaultValue={currentQuery} />
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Search Results for "{currentQuery}"
          </h2>
          <div className="text-sm text-gray-600">
            {filteredResults.length} of {results.length} results
          </div>
        </div>

        {/* Filters and Sort */}
        <SearchResultsFilters
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          uniqueCategories={uniqueCategories}
        />

        {/* Results Grid */}
        <SearchResultsDisplay
          loading={loading}
          filteredResults={filteredResults}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
        />
      </div>
    </div>
  );
};

export default SearchResultsPage;
