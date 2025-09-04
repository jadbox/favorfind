import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, SortDesc } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SearchResultCard from '../components/SearchResultCard';
import { SearchResult } from '../types';
import { searchPapers } from '../services/semanticScholar';
import { addSearchToHistory, saveToLibrary } from '../utils/localStorage';

interface SearchResultsPageProps {
  onSearch: (query: string) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ onSearch }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'citations'>('relevance');
  const [loading, setLoading] = useState<boolean>(false);
  
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const performSearch = async () => {
      if (query) {
        setLoading(true);
        try {
          const searchResults = await searchPapers(query);
          setResults(searchResults);
          setFilteredResults(searchResults);
          
          // Add to search history
          addSearchToHistory(query, searchResults.length);
          
          // Trigger custom storage event to update sidebar
          window.dispatchEvent(new Event('storage'));
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    performSearch();
  }, [query]);


  useEffect(() => {
    let filtered = results;
    
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(result => result.type === selectedType);
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(result => result.category === selectedCategory);
    }
    
    // Sort results
    switch (sortBy) {
      case 'date':
        filtered = [...filtered].sort((a, b) => 
          new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
        );
        break;
      case 'citations':
        filtered = [...filtered].sort((a, b) => b.citationCount - a.citationCount);
        break;
      default:
        // Keep original relevance order
        break;
    }
    
    setFilteredResults(filtered);
  }, [results, selectedType, selectedCategory, sortBy]);

  const handleNewSearch = (newQuery: string) => {
    onSearch(newQuery);
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handleSaveToLibrary = (result: SearchResult) => {
    saveToLibrary(result);
    // You could add a toast notification here
  };

  const uniqueCategories = Array.from(new Set(results.map(r => r.category).filter(Boolean)));

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button and search */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/')}
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
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          {/* Sort */}
          <div className="flex items-center space-x-2 ml-auto">
            <SortDesc className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date' | 'citations')}
              className="select select-sm select-bordered bg-white"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Publication Date</option>
              <option value="citations">Citation Count</option>
            </select>
          </div>
        </div>
        
        {/* Results Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="loading loading-spinner loading-lg text-medical-600"></div>
              <div className="text-gray-500 text-lg mt-4">Searching medical literature...</div>
            </div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map(result => (
              <SearchResultCard
                key={result.id}
                result={result}
                onSaveToLibrary={handleSaveToLibrary}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No results found</div>
              <div className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;