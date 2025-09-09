import React from "react";
import type { SearchResult, SearchHistory } from "../types";
import Header from "../components/Header";
import Disclaimer from "../components/Disclaimer";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";

export function HomePage({
  searchHistory = [],
}: {
  searchHistory?: SearchHistory[];
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <Sidebar searchHistory={searchHistory} />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Welcome to Medeligo Research.
              </h1>
              <h2 className="text-2xl text-gray-600 font-medium">
                What do you want to search today?
              </h2>
            </div>
            <SearchBar />
          </div>
        </div>
      </main>
      <Disclaimer />
    </div>
  );
}
