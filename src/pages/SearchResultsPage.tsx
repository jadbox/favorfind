import React, { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
  useActionData,
  useNavigation,
  useLoaderData,
} from "react-router";
import { ArrowLeft } from "lucide-react";
import SearchBar from "../components/SearchBar";
import SearchResultsFilters from "../components/SearchResultsFilters";
import SearchResultsDisplay from "../components/SearchResultsDisplay";
import { SearchResult } from "../types";
import { useSearchPapers } from "../services/semanticScholar";
import {
  addSearchToHistory,
  toggleSaveToLibrary,
  getStoredUserData,
} from "../utils/localStorage";

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const actionData = useActionData() as SearchResult[] | undefined;
  const loaderData = useLoaderData() as { query: string } | undefined; // Get data from the loader
  const navigation = useNavigation();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "citations">(
    "relevance"
  );
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const query = searchParams.get("q") || loaderData?.query || ""; // Use loaderData for initial query
  const { searchPapers, fetcher } = useSearchPapers();

  const loading = navigation.state === "loading" || fetcher.state === "loading";

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

  // Update results when actionData or fetcher.data changes
  useEffect(() => {
    if (query) {
      console.log("Effect searchPapers", query);
      searchPapers(query);
    }
  }, [query]);

  useEffect(() => {
    const data = actionData || (fetcher.data as SearchResult[]);
    if (!data) return;
    setResults(data);
    setFilteredResults(data);
    addSearchToHistory(query, data.length);
    window.dispatchEvent(new Event("storage"));
  }, [actionData, fetcher.data, query]);

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
    // Trigger the search action via the hook
    searchPapers(newQuery);
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
            <SearchBar onSearch={handleNewSearch} defaultValue={query} />
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Search Results for "{query}"
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
