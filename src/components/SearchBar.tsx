import React, { useState } from "react";
import { Mic, Search } from "lucide-react";
import { useNavigate } from "react-router";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  // Add a prop to pass the name attribute for the input when used within a Form
  inputName?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  // onSearch,
  placeholder = "Ask Medeligo a question",
  defaultValue = "",
  inputName = "query", // Default to "query" for form submissions
}) => {
  const navigator = useNavigate();
  const [query, setQuery] = useState(defaultValue);

  // No longer preventing default, relying on parent Form submission
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setQuery(e.target.value);
  // };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      // onSearch(query.trim());
      navigator(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // use react-router to nav

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative flex items-center">
        <input
          type="text"
          name={inputName} // Use the inputName prop
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
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
            type="submit" // This will now submit the parent Form
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
