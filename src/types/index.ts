export interface SearchResult {
  id: string;
  title: string;
  source: string;
  publisher: string;
  publicationDate: string;
  abstract: string;
  citationCount: number;
  url: string;
  category: "article" | "trial" | "guideline";
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultsCount: number;
  filters?: {
    selectedType?: string;
    primaryTumorSite?: string;
    ageGroup?: string;
    gender?: string;
    sortBy?: string;
  };
}

export interface UserData {
  firstName: string;
  searchHistory: SearchHistory[];
  savedLibrary: SearchResult[];
}
