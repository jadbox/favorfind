import React, { useEffect, useState } from "react";
import { useNavigate, useFetcher } from "react-router"; // Removed Form
import { Mic, Search } from "lucide-react";

interface SearchPageProps {
  // onSearch is no longer needed as search is handled by React Router action
}

const SearchPage: React.FC<SearchPageProps> = () => {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [searchQuery, setSearchQuery] = useState<string>(""); // State to hold the query

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("handleSearchSubmit triggered!");
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get("query") as string;
    console.log("Query from form data:", query); // Log the query
    if (query) {
      setSearchQuery(query); // Update the state with the query
      fetcher.submit(formData, { method: "post", action: "/search" }); // Submit to the /search action
    } else {
      console.log("Query is empty, not submitting.");
    }
  };

  useEffect(() => {
    console.log("SearchPage useEffect - fetcher.state:", fetcher.state);
    console.log("SearchPage useEffect - fetcher.data:", fetcher.data);
    console.log("SearchPage useEffect - searchQuery:", searchQuery);

    if (fetcher.state === "idle" && fetcher.data && searchQuery) {
      console.log("SearchPage: Navigating to search results page.");
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [fetcher.state, fetcher.data, navigate, searchQuery]); // Use searchQuery in dependencies

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Medeligo Research.
          </h1>
          <h2 className="text-2xl text-gray-600 font-medium">
            What do you want to search today?
          </h2>
        </div>

        {/* Search Bar using HTML Form */}
        <div className="mb-12">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative flex items-center">
              <input
                type="text"
                name="query" // Important: name attribute for form data
                placeholder="Ask Medeligo a question"
                className="input input-bordered w-full pr-24 text-lg h-16 bg-white border-2 border-gray-300 focus:border-medical-600 focus:outline-none rounded-xl"
              />
              <div className="absolute right-3 flex items-center space-x-2">
                {/* <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle hover:bg-gray-100"
                  title="Voice search"
                >
                  <Mic className="h-5 w-5 text-gray-500" />
                </button> */}
                <button type="submit" className="btn btn-primary btn-sm">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Disabled Feature Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Most Recent Articles in Your Field"
            subtitle="Stay updated with the latest research"
            icon={FileText}
            gradient="bg-gradient-to-br from-medical-500 to-medical-600"
            onClick={() => handleFeatureClick("latest oncology research 2024")}
          />
          <FeatureCard
            title="Clinical Trials and Guidelines"
            subtitle="Find current protocols and standards"
            icon={Stethoscope}
            gradient="bg-gradient-to-br from-medical-600 to-medical-700"
            onClick={() => handleFeatureClick("clinical trials cancer treatment guidelines")}
          />
          <FeatureCard
            title="Rewind Your 2024 Searches"
            subtitle="Review your research journey"
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-medical-500 to-medical-600"
            onClick={() => navigate('/history')}
          />
        </div> */}
      </div>
    </div>
  );
};

export default SearchPage;
