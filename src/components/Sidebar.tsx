import React from "react";
import { Link } from "react-router-dom";
import { Grid3X3, History, Plus, Search } from "lucide-react";
import type { SearchHistory } from "../types";

interface SidebarProps {
  searchHistory: SearchHistory[];
  onHistoryClick: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ searchHistory, onHistoryClick }) => {
  const todayHistory = searchHistory.filter((item) => {
    const today = new Date().toDateString();
    const itemDate = new Date(item.timestamp).toDateString();
    return today === itemDate;
  });

  const olderHistory = searchHistory.filter((item) => {
    const today = new Date().toDateString();
    const itemDate = new Date(item.timestamp).toDateString();
    return today !== itemDate;
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 min-h-screen">
      {/* New Search Button */}
      <Link
        to="/"
        className="btn btn-primary btn-outline w-full mb-6 flex items-center space-x-2"
      >
        <Search className="h-4 w-4" />
        <span>New Search</span>
        <Plus className="h-4 w-4" />
      </Link>

      {/* Prepared for You Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-3">
          <Grid3X3 className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Prepared for You</h3>
        </div>
        <div className="text-sm text-gray-600">
          Personalized recommendations will appear here based on your search
          patterns.
        </div>
      </div>

      {/* Search History Section */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <History className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Your Search History</h3>
        </div>

        {/* Today's History */}
        {todayHistory.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Today</h4>
            <div className="space-y-2">
              {todayHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onHistoryClick(item.query)}
                  className="block w-full text-left text-sm text-gray-700 hover:text-medical-600 hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                >
                  <div className="truncate">{item.query}</div>
                  <div className="text-xs text-gray-500">
                    {item.resultsCount} results
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Older History */}
        {olderHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Earlier</h4>
            <div className="space-y-2">
              {olderHistory.slice(0, 10).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onHistoryClick(item.query)}
                  className="block w-full text-left text-sm text-gray-700 hover:text-medical-600 hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                >
                  <div className="truncate">{item.query}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString()} •{" "}
                    {item.resultsCount} results
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchHistory.length === 0 && (
          <div className="text-sm text-gray-500">
            Your recent searches will appear here.
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
