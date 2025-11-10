import React from "react";
import { Filter } from "lucide-react";
import { LoadingUtils } from "../utils/loadingUtils";
import QualitiesFilter from "./QualitiesFilter";
import LocationFilter from "./LocationFilter";
import { useInitialFilters } from "../hooks/useInitialFilters";
import { buildSearchQuery } from "../utils/searchQueryBuilder";

interface SearchResultsFiltersProps {
  contentType: string;
  sourceType: string;
  datePublished: string;
  sortBy: "relevance" | "popular" | "date";
}

const SearchResultsFilters: React.FC<SearchResultsFiltersProps> = (props) => {
  const {
    locationString,
    setLocationString,
    initialLocationString,
    locationEnabled,
    setLocationEnabled,
    preferences,
    setPreferences,
    initialPreferences,
  } = useInitialFilters();

  const handlePreferencesChange = (newPreferences: string[]) => {
    setPreferences(newPreferences);
  };

  const handleLocationChange = (newLocationString: string, enabled: boolean) => {
    setLocationString(newLocationString);
    setLocationEnabled(enabled);
    handleUpdateFilters(newLocationString, enabled, preferences);
  };

  const preferencesChanged = JSON.stringify([...preferences].sort()) !== JSON.stringify([...initialPreferences].sort());
  const locationChanged = locationString !== initialLocationString;
  const hasChanges = locationChanged || preferencesChanged;

  const handleUpdateFilters = (
    currentLocation = locationString,
    isLocationEnabled = locationEnabled,
    currentPreferences = preferences
  ) => {
    LoadingUtils.show();

    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get("q") || '';
    
    const finalQuery = buildSearchQuery(query, currentLocation, isLocationEnabled, currentPreferences);

    const form = document.createElement("form");
    form.method = "GET";
    form.action = "/search";
    form.style.display = "none";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "q";
    input.value = finalQuery;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">Filters</h2>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-6">
        <LocationFilter 
          initialLocationString={initialLocationString}
          onLocationChange={handleLocationChange}
        />
        <div className="border-t border-gray-700"></div>
        <QualitiesFilter 
          initialPreferences={initialPreferences}
          onPreferencesChange={handlePreferencesChange}
        />
      </div>

      {hasChanges && (
        <div className="flex justify-end mt-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => handleUpdateFilters()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsFilters;
