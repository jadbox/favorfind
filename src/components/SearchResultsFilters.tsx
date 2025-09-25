import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { LoadingUtils } from "../utils/loadingUtils";

interface SearchResultsFiltersProps {
  selectedType: string;
  primaryTumorSite: string;
  ageGroup: string;
  gender: string;
  sortBy: "relevance" | "date" | "citations";
}

const generalFilters = [
  "Guidelines (Default)",
  "Genetic Mutations",
  "Histology / Pathology",
  "Imaging",
  "Overview",
  "Prognostic Factors",
  "Risk Factors",
  "Staging",
  // "Wikipedia",
];

const therapyFilters = [
  "Adjuvant Therapy",
  "Clinical Trials",
  "Hormone Therapy",
  "Immunotherapy",
  "Local Recurrence",
  "Management of Primary",
  "Metastatic Disease",
  "Neoadjuvant Therapy",
  "Reconstruction",
  "Regional Metastasis",
  "Role of Chemotherapy",
  "Role of Radiation",
  "Role of Surgery",
  "Targeted Therapy",
  // "Surgical Video", // video not supported yet
  // "Reconstructive Video",
];

const primaryTumorSites = [
  "All",
  "Breast",
  "Colorectal",
  "Kidney",
  "Leukemia",
  "Liver",
  "Lung",
  "Ovarian",
  "Pancreatic",
  "Prostate",
  "Skin",
  "Thyroid",
];
const ageGroups = [
  "All",
  "ages 0-12",
  "ages 13-21",
  "ages 22-44",
  "ages 45-64",
  "ages 65+",
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
  const [sortBy, setSortBy] = useState<string>(props.sortBy);
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
    // Show loading overlay using the centralized utility
    LoadingUtils.show();

    const createHiddenInput = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      return input;
    };

    const form = document.createElement("form");
    form.method = "GET";
    form.action = "/search";
    form.style.display = "none";

    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get("q");
    if (query) {
      form.appendChild(createHiddenInput("q", query));
    }

    const filters = {
      filter_type: { value: selectedType, default: "Guidelines (Default)" },
      primaryTumorSite: { value: primaryTumorSite, default: "All" },
      ageGroup: { value: ageGroup, default: "All" },
      gender: { value: gender, default: "All" },
      sortBy: { value: sortBy, default: "relevance" },
    };

    for (const [name, { value, default: defaultValue }] of Object.entries(
      filters
    )) {
      if (value !== defaultValue) {
        form.appendChild(createHiddenInput(name, value));
      }
    }

    document.body.appendChild(form);
    form.submit();
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
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="relevance">Relevance</option>
                  <option
                    value={`recent_trending_${new Date().getFullYear()}_articles`}
                  >
                    Recent Publication Date
                  </option>
                  <option value="most_citations">Popular Articles</option>
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
