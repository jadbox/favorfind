import type { UserData, SearchHistory, SearchResult } from "../types";

const STORAGE_KEY = "favorfind-user-data";

const defaultUserData: UserData = {
  searchHistory: [],
  savedLibrary: [],
};

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export const getStoredUserData = (): UserData => {
  if (!hasLocalStorage()) return defaultUserData;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }
  return defaultUserData;
};

export const saveUserData = (data: UserData): void => {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const addSearchToHistory = (
  query: string,
  resultsCount: number,
  filters?: {
    selectedType?: string;
    primaryTumorSite?: string;
    ageGroup?: string;
    gender?: string;
    sortBy?: string;
  }
): void => {
  if (!hasLocalStorage()) return;
  const userData = getStoredUserData();

  // Remove any existing search with the same query (case-insensitive)
  userData.searchHistory = userData.searchHistory.filter(
    (item) => item.query.toLowerCase() !== query.toLowerCase()
  );

  const newSearch: SearchHistory = {
    id: Date.now().toString(),
    query,
    timestamp: new Date().toISOString(),
    resultsCount,
    filters,
  };

  // Add to beginning of array and limit to 5 items
  userData.searchHistory = [newSearch, ...userData.searchHistory.slice(0, 4)];
  saveUserData(userData);
};

export const saveToLibrary = (result: SearchResult): void => {
  if (!hasLocalStorage()) return;
  const userData = getStoredUserData();
  const exists = userData.savedLibrary.find((item) => item.id === result.id);

  if (!exists) {
    userData.savedLibrary = [result, ...userData.savedLibrary];
    saveUserData(userData);
  }
};

export const removeFromLibrary = (resultId: string): void => {
  if (!hasLocalStorage()) return;
  const userData = getStoredUserData();
  userData.savedLibrary = userData.savedLibrary.filter(
    (item) => item.id !== resultId
  );
  saveUserData(userData);
};

export const toggleSaveToLibrary = (result: SearchResult): void => {
  if (!hasLocalStorage()) return;
  const userData = getStoredUserData();
  const exists = userData.savedLibrary.find((item) => item.id === result.id);
  if (exists) {
    // Remove from library
    userData.savedLibrary = userData.savedLibrary.filter(
      (item) => item.id !== result.id
    );
  } else {
    // Add to top of library
    userData.savedLibrary = [result, ...userData.savedLibrary];
  }
  saveUserData(userData);
};

export const getSavedLibrary = (): SearchResult[] => {
  if (!hasLocalStorage()) return [];
  const userData = getStoredUserData();
  return userData.savedLibrary;
};

export const isArticleSaved = (resultId: string): boolean => {
  if (!hasLocalStorage()) return false;
  const userData = getStoredUserData();
  return userData.savedLibrary.some((item) => item.id === resultId);
};

export const getSavedStatus = (
  resultIds: string[]
): Record<string, boolean> => {
  if (!hasLocalStorage()) return {};
  const userData = getStoredUserData();
  const savedIds = new Set(userData.savedLibrary.map((item) => item.id));
  const result: Record<string, boolean> = {};
  resultIds.forEach((id) => {
    result[id] = savedIds.has(id);
  });
  return result;
};
