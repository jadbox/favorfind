import React from "react";
import SearchBar from "../components/SearchBar";
import FeatureCard from "../components/FeatureCard";

const SearchPage: React.FC = () => {
  // SearchPage now delegates search behavior to the shared SearchBar component

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

        {/* Search Bar component */}
        <div className="mb-12">
          <SearchBar onSearch={() => {}} />
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
