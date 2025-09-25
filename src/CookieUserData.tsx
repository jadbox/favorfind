import type { SearchHistory, SearchResult } from "./types";

// ---------- Cookie helpers ----------

export type CookieUserData = {
  searchHistory: SearchHistory[];
  savedLibrary: SearchResult[];
} & Record<string, unknown>;

export function readUserDataCookie(
  cookieHeader: string | null
): CookieUserData {
  const empty: CookieUserData = { searchHistory: [], savedLibrary: [] };
  if (!cookieHeader) return empty;
  const m = cookieHeader.match(/(?:^|; )user_data=([^;]+)/);
  if (!m || !m[1]) return empty;
  try {
    const json = decodeURIComponent(m[1]);
    const parsed = JSON.parse(json) as Partial<CookieUserData>;
    if (!Array.isArray(parsed.searchHistory)) parsed.searchHistory = [];
    if (!Array.isArray(parsed.savedLibrary)) parsed.savedLibrary = [];

    return parsed as CookieUserData;
  } catch {
    return empty;
  }
}

export function serializeUserDataCookie(data: CookieUserData): string {
  const payload = encodeURIComponent(JSON.stringify(data));
  return `user_data=${payload}; Path=/; Max-Age=${
    365 * 24 * 60 * 60
  }; SameSite=Lax`;
}

export function addToHistory(
  history: SearchHistory[],
  query: string,
  resultsCount: number,
  filters?: {
    selectedType?: string;
    primaryTumorSite?: string;
    ageGroup?: string;
    gender?: string;
    sortBy?: string;
  }
): SearchHistory[] {
  const filtered = history.filter(
    (h) => h.query.toLowerCase() !== query.toLowerCase()
  );
  const entry: SearchHistory = {
    id: Date.now().toString(),
    query,
    timestamp: new Date().toISOString(),
    resultsCount,
    filters,
  };
  return [entry, ...filtered].slice(0, 20);
}
// ---------- Saved Library helpers ----------

export function upsertSaved(
  list: SearchResult[],
  item: SearchResult
): SearchResult[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    const copy = list.slice();
    copy[idx] = item;
    return copy;
  }
  return [item, ...list].slice(0, 200);
}

export function removeSaved(list: SearchResult[], id: string): SearchResult[] {
  return list.filter((x) => x.id !== id);
}
