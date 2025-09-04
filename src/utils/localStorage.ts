import { UserData, SearchHistory, SearchResult } from '../types';

const STORAGE_KEY = 'medeligo-user-data';

export const getStoredUserData = (): UserData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  return {
    firstName: 'Frank',
    searchHistory: [],
    savedLibrary: []
  };
};

export const saveUserData = (data: UserData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const addSearchToHistory = (query: string, resultsCount: number): void => {
  const userData = getStoredUserData();
  const newSearch: SearchHistory = {
    id: Date.now().toString(),
    query,
    timestamp: new Date().toISOString(),
    resultsCount
  };
  
  // Add to beginning of array and limit to 20 items
  userData.searchHistory = [newSearch, ...userData.searchHistory.slice(0, 19)];
  saveUserData(userData);
};

export const saveToLibrary = (result: SearchResult): void => {
  const userData = getStoredUserData();
  const exists = userData.savedLibrary.find(item => item.id === result.id);
  
  if (!exists) {
    userData.savedLibrary = [result, ...userData.savedLibrary];
    saveUserData(userData);
  }
};