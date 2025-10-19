import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  query?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ query }) => {
  return (
    <form action="/search" method="get" className="mb-12">
      <div id="search" className="relative flex items-center">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Ask FavorFind a question"
          className="input input-bordered w-full pr-24 pl-6 text-lg h-16 rounded-xl"
        />
        <div className="absolute right-3 flex items-center">
          <button
            type="submit"
            aria-label="Search"
            className="inline-flex items-center gap-2 text-white text-sm font-medium px-4 rounded-lg shadow h-12"
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
