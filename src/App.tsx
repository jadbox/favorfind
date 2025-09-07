import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom"; // Use Outlet for nested routes
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Disclaimer from "./components/Disclaimer";
import { getStoredUserData } from "./utils/localStorage";
import type { SearchHistory } from "./types";

function App() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  useEffect(() => {
    const userData = getStoredUserData();
    setSearchHistory(userData.searchHistory);
  }, []);

  const handleHistoryClick = (query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const refreshSearchHistory = () => {
    const userData = getStoredUserData();
    setSearchHistory(userData.searchHistory);
  };

  useEffect(() => {
    // Listen for storage changes to update search history
    const handleStorageChange = () => {
      refreshSearchHistory();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar
          searchHistory={searchHistory}
          onHistoryClick={handleHistoryClick}
        />

        <main className="flex-1 flex flex-col">
          <Outlet /> {/* Render nested routes here */}
        </main>
      </div>

      <Disclaimer />
    </div>
  );
}

export default App;
