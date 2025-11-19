export interface SearchResult {
  id: string;
  title: string;
  source: string;
  publisher: string;
  publicationDate: string;
  abstract: string;
  url: string;
  category: "article" | "trial" | "guideline" | "product";
  pros?: string[];
  cons?: string[];
  best_for?: string;
  image_url?: string;
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
  searchHistory: SearchHistory[];
  savedLibrary: SearchResult[];
}
