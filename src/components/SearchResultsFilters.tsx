import React from "react";
import { Filter, SortDesc } from "lucide-react";

interface SearchResultsFiltersProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: "relevance" | "date" | "citations";
  setSortBy: (sortBy: "relevance" | "date" | "citations") => void;
  uniqueCategories: string[];
}

const SearchResultsFilters: React.FC<SearchResultsFiltersProps> = ({
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  uniqueCategories,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>

      {/* Type Filter */}
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="select select-sm select-bordered bg-white"
      >
        <option value="all">All Types</option>
        <option value="article">Articles</option>
        <option value="trial">Clinical Trials</option>
        <option value="guideline">Guidelines</option>
      </select>

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="select select-sm select-bordered bg-white"
      >
        <option value="all">All Categories</option>
        {uniqueCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* Sort */}
      <div className="flex items-center space-x-2 ml-auto">
        <SortDesc className="h-4 w-4 text-gray-500" />
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "relevance" | "date" | "citations")
          }
          className="select select-sm select-bordered bg-white"
        >
          <option value="relevance">Relevance</option>
          <option value="date">Publication Date</option>
          <option value="citations">Citation Count</option>
        </select>
      </div>
    </div>
  );
};

export default SearchResultsFilters;
