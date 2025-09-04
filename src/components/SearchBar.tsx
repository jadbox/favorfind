import React, { useState } from 'react';
import { Mic, Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Ask Medeligo a question", 
  defaultValue = ""
}) => {
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input input-bordered w-full pr-24 text-lg h-16 bg-white border-2 border-gray-300 focus:border-medical-600 focus:outline-none rounded-xl"
        />
        <div className="absolute right-3 flex items-center space-x-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle hover:bg-gray-100"
            title="Voice search"
          >
            <Mic className="h-5 w-5 text-gray-500" />
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!query.trim()}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;