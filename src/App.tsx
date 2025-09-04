import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Disclaimer from './components/Disclaimer';
import SearchPage from './pages/SearchPage';
import SearchResultsPage from './pages/SearchResultsPage';
import LibraryPage from './pages/LibraryPage';
import { getStoredUserData } from './utils/localStorage';
import { SearchHistory } from './types';

function App() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  useEffect(() => {
    const userData = getStoredUserData();
    setSearchHistory(userData.searchHistory);
  }, []);

  const handleSearch = (query: string) => {
    // This will be called from search components
    // The actual history saving happens in the SearchResultsPage
  };

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
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <div className="flex flex-1">
          <Sidebar 
            searchHistory={searchHistory}
            onHistoryClick={handleHistoryClick}
          />
          
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route 
                path="/" 
                element={<SearchPage onSearch={handleSearch} />} 
              />
              <Route 
                path="/search" 
                element={<SearchResultsPage onSearch={handleSearch} />} 
              />
              <Route 
                path="/library" 
                element={<LibraryPage />} 
              />
            </Routes>
          </main>
        </div>
        
        <Disclaimer />
      </div>
    </Router>
  );
}

export default App;