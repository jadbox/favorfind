import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  // Kept for backwards compatibility; no-op in SSR-only usage
  onSearch?: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  // Add a prop to pass the name attribute for the input when used within a Form
  inputName?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  // onSearch,
  placeholder = "Ask Medeligo a question",
  defaultValue = "",
  inputName = "q", // Default to "q" for SSR /search route
}) => {
  return (
    <form action="/search" method="get">
      <div className="relative flex items-center">
        <input
          type="text"
          name={inputName} // Use the inputName prop
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="input input-bordered w-full pr-24 pl-6 text-lg h-16 bg-white border-2 border-gray-300 focus:border-medical-600 focus:outline-none rounded-xl"
        />
        <div className="absolute right-3 flex items-center">
          {/* Optional voice button could go here */}
          <button
            type="submit" // Submits the form to /search?q=...
            aria-label="Search"
            className="inline-flex items-center gap-2 bg-medical-600 hover:bg-medical-700 text-white text-sm font-medium px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-medical-500 focus:ring-offset-2 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
