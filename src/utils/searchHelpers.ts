// CANNOT USE /api/ logic here in the frontend
import type { SearchResult } from "../types";
import { _fetchSearchResults as fetchSearchResults } from "../api/search";
// import { searchPapers } from "@/services/searchService";
import {
  readUserDataCookie,
  addToHistory,
  serializeUserDataCookie,
} from "../CookieUserData";

export interface SearchParams {
  query: string;
  selectedType: string;
  primaryTumorSite: string;
  ageGroup: string;
  gender: string;
  sortBy: string;
  limit: number;
}

export interface SearchData {
  results: SearchResult[];
  error: string | null;
  savedStatus: Record<string, boolean>;
}

export function parseSearchParams(url: URL): SearchParams {
  return {
    query: url.searchParams.get("q")?.trim() || "",
    selectedType: url.searchParams.get("filter_type") || "Guidelines (Default)",
    primaryTumorSite: url.searchParams.get("primaryTumorSite") || "All",
    ageGroup: url.searchParams.get("ageGroup") || "All",
    gender: url.searchParams.get("gender") || "All",
    sortBy: url.searchParams.get("sortBy") || "relevance",
    limit: parseInt(url.searchParams.get("limit") || "0"),
  };
}

export function buildFilterParams(params: SearchParams): string {
  return [
    params.selectedType !== "Guidelines (Default)" && params.selectedType,
    params.primaryTumorSite !== "All" && params.primaryTumorSite,
    params.ageGroup !== "All" && params.ageGroup,
    params.gender !== "All" && params.gender,
    params.sortBy !== "relevance" && `${params.sortBy}`,
  ]
    .filter(Boolean)
    .join(",");
}

export async function performSearch(
  params: SearchParams,
  cookieHeader: string | null,
  setCookieCallback: (cookie: string) => void
): Promise<SearchData> {
  let results: SearchResult[] = [];
  let error: string | null = null;
  let savedStatus: Record<string, boolean> = {};

  if (!params.query) {
    return { results, error, savedStatus };
  }

  try {
    const filterParams = buildFilterParams(params);
    results = await fetchSearchResults(
      params.query,
      params.limit,
      1,
      params.sortBy,
      filterParams
    );

    // Save search to history in cookies
    const userData = readUserDataCookie(cookieHeader);
    const filters = {
      selectedType:
        params.selectedType !== "Guidelines (Default)"
          ? params.selectedType
          : undefined,
      primaryTumorSite:
        params.primaryTumorSite !== "All" ? params.primaryTumorSite : undefined,
      ageGroup: params.ageGroup !== "All" ? params.ageGroup : undefined,
      gender: params.gender !== "All" ? params.gender : undefined,
      sortBy: params.sortBy !== "relevance" ? params.sortBy : undefined,
    };

    const updatedHistory = addToHistory(
      userData.searchHistory,
      params.query,
      results.length,
      filters
    );
    const updatedUserData = { ...userData, searchHistory: updatedHistory };
    const setCookie = serializeUserDataCookie(updatedUserData);
    setCookieCallback(setCookie);
  } catch (err) {
    console.error("Search error:", err);
    error = err instanceof Error ? err.message : "Search failed";
  }

  return { results, error, savedStatus };
}

export async function checkSavedStatus(
  results: SearchResult[],
  origin: string,
  cookieHeader: string | null
): Promise<Record<string, boolean>> {
  if (results.length === 0) return {};

  try {
    const response = await fetch(`${origin}/api/library/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader || "",
      },
      body: JSON.stringify({ ids: results.map((r) => r.id) }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to check saved status:", error);
  }

  return {};
}
