import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";

interface SearchResultsFiltersProps {
  selectedType: string;
  primaryTumorSite: string;
  ageGroup: string;
  gender: string;
  sortBy: "relevance" | "date" | "citations";
}

const generalFilters = [
  "Guidelines (Default)",
  "Recent Articles",
  "Overview",
  "Risk Factors",
  "Imaging",
  "Genetic Mutations",
  "Histology / Pathology",
  "Staging",
  "Prognostic Factors",
  "Societies",
  "Wikipedia",
];

const therapyFilters = [
  "Clinical Trials",
  "Management of Primary",
  "Local Recurrence",
  "Regional Metastasis",
  "Metastatic Disease",
  "Neoadjuvant Therapy",
  "Adjuvant Therapy",
  "Role of Surgery",
  "Surgical Video",
  "Reconstructive Video",
  "Role of Radiation",
  "Role of Chemotherapy",
  "Hormone Therapy",
  "Targeted Therapy",
  "Immunotherapy",
  "Reconstruction",
];

const primaryTumorSites = [
  "All",
  "Breast",
  "Lung",
  "Colorectal",
  "Prostate",
  "Skin",
];
const ageGroups = [
  "All",
  "ages_0-12",
  "ages_13-21",
  "ages_22-44",
  "ages_45-64",
  "ages_65+",
];
const genders = ["All", "male", "female"];

const SearchResultsFilters: React.FC<SearchResultsFiltersProps> = (props) => {
  // Store initial values for comparison
  const initialFilters = {
    selectedType: props.selectedType,
    primaryTumorSite: props.primaryTumorSite,
    ageGroup: props.ageGroup,
    gender: props.gender,
    sortBy: props.sortBy,
  };

  const [selectedType, setSelectedType] = useState(props.selectedType);
  const [primaryTumorSite, setPrimaryTumorSite] = useState(
    props.primaryTumorSite
  );
  const [ageGroup, setAgeGroup] = useState(props.ageGroup);
  const [gender, setGender] = useState(props.gender);
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "citations">(
    props.sortBy
  );
  const [activeTab, setActiveTab] = useState("general");

  // Check if filters have changed from initial values
  const hasChanges =
    selectedType !== initialFilters.selectedType ||
    primaryTumorSite !== initialFilters.primaryTumorSite ||
    ageGroup !== initialFilters.ageGroup ||
    gender !== initialFilters.gender ||
    sortBy !== initialFilters.sortBy;

  useEffect(() => {
    if (therapyFilters.includes(props.selectedType)) {
      setActiveTab("therapy");
    } else {
      setActiveTab("general");
    }
  }, [props.selectedType]);

  const handleUpdateFilters = () => {
    // Show loading state
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.classList.remove("opacity-0", "pointer-events-none");
      loadingOverlay.classList.add("opacity-100", "pointer-events-auto");
    }

    const params = new URLSearchParams(window.location.search);

    // Only set filter_type if it's not the default
    if (selectedType !== "Guidelines (Default)") {
      params.set("filter_type", selectedType);
    } else {
      params.delete("filter_type");
    }

    // Only set primaryTumorSite if it's not "All"
    if (primaryTumorSite !== "All") {
      params.set("primaryTumorSite", primaryTumorSite);
    } else {
      params.delete("primaryTumorSite");
    }

    // Only set ageGroup if it's not "All"
    if (ageGroup !== "All") {
      params.set("ageGroup", ageGroup);
    } else {
      params.delete("ageGroup");
    }

    // Only set gender if it's not "All"
    if (gender !== "All") {
      params.set("gender", gender);
    } else {
      params.delete("gender");
    }

    // Only set sortBy if it's not the default "relevance"
    if (sortBy !== "relevance") {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }

    window.location.search = params.toString();
  };

  return (
    <div className="mb-6">
      {/* Header with tabs */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Source Type Filters:
          </span>
        </div>
        <div className="flex bg-gray-100 rounded-md p-1">
          <button
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === "general"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === "therapy"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("therapy")}
          >
            Therapy
          </button>
        </div>
      </div>

      {/* Main filter content */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter options - left side */}
          <div className="lg:col-span-2">
            {activeTab === "general" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {generalFilters.map((filter) => (
                  <label
                    key={filter}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="filter-type"
                      className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                      value={filter}
                      checked={selectedType === filter}
                      onChange={() => setSelectedType(filter)}
                    />
                    <span className="text-sm text-gray-700">{filter}</span>
                  </label>
                ))}
              </div>
            )}
            {activeTab === "therapy" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {therapyFilters.map((filter) => (
                  <label
                    key={filter}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="filter-type"
                      className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                      value={filter}
                      checked={selectedType === filter}
                      onChange={() => setSelectedType(filter)}
                    />
                    <span className="text-sm text-gray-700">{filter}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown filters - right side */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Primary Tumor Site:
                </label>
                <select
                  value={primaryTumorSite}
                  onChange={(e) => setPrimaryTumorSite(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {primaryTumorSites.map((site) => (
                    <option key={site} value={site}>
                      {site}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Age Group:
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {ageGroups.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Gender:
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "relevance" | "date" | "citations"
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Publication Date</option>
                  <option value="citations">Citation Count</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Filters Button */}
      {hasChanges && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleUpdateFilters}
            className="px-6 py-2 bg-medical-600 hover:bg-medical-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            Update Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsFilters;
