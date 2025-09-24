import React from "react";
import type { SearchHistory } from "../types";

const Sidebar = ({ searchHistory }: { searchHistory: SearchHistory[] }) => {
  const today = new Date().toDateString();
  const todayHistory = searchHistory.filter(
    (item) => new Date(item.timestamp).toDateString() === today
  );
  const olderHistory = searchHistory.filter(
    (item) => new Date(item.timestamp).toDateString() !== today
  );

  const buildSearchUrl = (item: SearchHistory) => {
    const params = new URLSearchParams();
    params.set("q", item.query);

    if (item.filters) {
      if (
        item.filters.selectedType &&
        item.filters.selectedType !== "Guidelines (Default)"
      ) {
        params.set("filter_type", item.filters.selectedType);
      }
      if (
        item.filters.primaryTumorSite &&
        item.filters.primaryTumorSite !== "All"
      ) {
        params.set("primaryTumorSite", item.filters.primaryTumorSite);
      }
      if (item.filters.ageGroup && item.filters.ageGroup !== "All") {
        params.set("ageGroup", item.filters.ageGroup);
      }
      if (item.filters.gender && item.filters.gender !== "All") {
        params.set("gender", item.filters.gender);
      }
      if (item.filters.sortBy && item.filters.sortBy !== "relevance") {
        params.set("sortBy", item.filters.sortBy);
      }
    }

    return `/search?${params.toString()}`;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 min-h-screen">
      <div className="text-center mb-6">
        <a href="/" className="btn btn-primary btn-outline btn-sm px-4 py-2 hover:text-medical-600 hover:bg-gray-50">
          New Search
        </a>
      </div>
      {/* <div className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-2">Prepared for You</h3>
        <div className="text-sm text-gray-600">
          Personalized recommendations will appear here based on your search
          patterns.
        </div>
      </div> */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          Your Search History
        </h3>
        {todayHistory.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Today</h4>
            <div className="space-y-2">
              {todayHistory.map((item) => (
                <a
                  key={item.id}
                  href={buildSearchUrl(item)}
                  className="block text-sm text-gray-700 hover:text-medical-600 hover:bg-gray-50 p-2 rounded"
                >
                  <div className="truncate">{item.query}</div>
                  <div className="text-xs text-gray-500">
                    {item.resultsCount} results
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        {olderHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Earlier</h4>
            <div className="space-y-2">
              {olderHistory.slice(0, 10).map((item) => (
                <a
                  key={item.id}
                  href={buildSearchUrl(item)}
                  className="block text-sm text-gray-700 hover:text-medical-600 hover:bg-gray-50 p-2 rounded"
                >
                  <div className="truncate">{item.query}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString()} •{" "}
                    {item.resultsCount} results
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        {searchHistory.length === 0 && (
          <div className="text-sm text-gray-500">
            Your recent searches will appear here.
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
