export interface SearchResult {
  id: string;
  title: string;
  source: string;
  publisher: string;
  publicationDate: string;
  abstract: string;
  citationCount: number;
  url: string;
  type: 'article' | 'trial' | 'guideline';
  category?: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultsCount: number;
}

export interface UserData {
  firstName: string;
  searchHistory: SearchHistory[];
  savedLibrary: SearchResult[];
}