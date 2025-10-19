import React, { useState } from "react";
import { Filter } from "lucide-react";
import { LoadingUtils } from "../utils/loadingUtils";
import { filterConfig } from "../config/filterConfig";

interface SearchResultsFiltersProps {
  contentType: string;
  sourceType: string;
  datePublished: string;
  sortBy: "relevance" | "popular" | "date";
}

const SearchResultsFilters: React.FC<SearchResultsFiltersProps> = (props) => {
  const initialFilters = {
    contentType: props.contentType,
    sourceType: props.sourceType,
    datePublished: props.datePublished,
    sortBy: props.sortBy,
  };

  const [contentType, setContentType] = useState(props.contentType);
  const [sourceType, setSourceType] = useState(props.sourceType);
  const [datePublished, setDatePublished] = useState(props.datePublished);
  const [sortBy, setSortBy] = useState<string>(props.sortBy);

  const hasChanges =
    contentType !== initialFilters.contentType ||
    sourceType !== initialFilters.sourceType ||
    datePublished !== initialFilters.datePublished ||
    sortBy !== initialFilters.sortBy;

  const handleUpdateFilters = () => {
    LoadingUtils.show();

    const createHiddenInput = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      return input;
    };

    const form = document.createElement("form");
    form.method = "GET";
    form.action = "/search";
    form.style.display = "none";

    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get("q");
    if (query) {
      form.appendChild(createHiddenInput("q", query));
    }

    const filters = {
      contentType: { value: contentType, default: "All" },
      sourceType: { value: sourceType, default: "All" },
      datePublished: { value: datePublished, default: "any" },
      sortBy: { value: sortBy, default: "relevance" },
    };

    for (const [name, { value, default: defaultValue }] of Object.entries(
      filters
    )) {
      if (value !== defaultValue) {
        form.appendChild(createHiddenInput(name, value));
      }
    }

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="h-4 w-4 text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">Filters:</span>
      </div>

      <div className="filter-panel border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">
              Content Type:
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border-subtle rounded-md bg-base-300 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {filterConfig.contentType.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">
              Source Type:
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border-subtle rounded-md bg-base-300 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {filterConfig.sourceType.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">
              Date Published:
            </label>
            <select
              value={datePublished}
              onChange={(e) => setDatePublished(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border-subtle rounded-md bg-base-300 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {filterConfig.datePublished.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border-subtle rounded-md bg-base-300 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {filterConfig.sortBy.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleUpdateFilters}
            className="px-6 py-2 bg-primary hover:bg-opacity-90 text-white text-sm font-medium rounded-md shadow-sm transition-all hover:shadow-lg"
          >
            Update Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsFilters;
