import Perplexity from "@perplexity-ai/perplexity_ai";
import type { DataProvider } from "./dataProviderInterface";
import type { SearchResult } from "../types"; // Import SearchResult

// The Perplexity SDK reads the API key from the PERPLEXITY_API_KEY environment variable.
// No need to check for it manually if the SDK handles it.

export class PerplexityDataProvider implements DataProvider {
  private client: Perplexity;

  constructor() {
    this.client = new Perplexity();
  }

  async fetchPapers(
    query: string,
    limit: number,
    filter_type: string = ""
  ): Promise<SearchResult[]> {
    const q = query.trim();

    if (!q) {
      return [];
    }

    try {
      // Build the search query with domain filtering
      let searchQuery = `Top rated sources for ${q}`;

      // Add filter type if provided
      if (filter_type) {
        searchQuery += ` ${filter_type}`;
      }

      console.log(
        "Using PerplexityDataProvider with query:",
        q,
        "filter:",
        filter_type
      );

      // Use the Search API for direct web search results
      const effectiveLimit = Math.min(limit, 20); // Search API max is 20

      const searchResponse = await this.client.search.create({
        query: searchQuery,
        max_results: effectiveLimit,
        max_tokens_per_page: 1024, // Balanced extraction for abstracts 1024
      });

      //filter results at a root domain without a page path
      searchResponse.results = (searchResponse.results || []).filter(
        (result) => {
          const url = new URL(result.url || "");
          return url.pathname.split("/").filter(Boolean).length > 0; // Ensure there's a path after the domain
        }
      );

      // Map search results to SearchResult format
      const searchResults: SearchResult[] = (searchResponse.results || []).map(
        (result, index) => {
          // Extract year from date if available
          let publicationDate: string = (result.date as string) || String(new Date().getFullYear());

          // Determine category (Perplexity doesn't provide this directly, default to "article")
          const category: SearchResult["category"] = "article";

          return {
            id: `perplexity-${Date.now()}-${index}`, // Map to id
            source: "Perplexity",
            title: result.title?.replace("www.", " ") || "Untitled",
            publisher: new URL(result.url || "http://example.com").hostname || "Perplexity AI", // Use hostname as publisher
            publicationDate,
            abstract: extractSummary(result.snippet) || "No abstract available",
            citationCount: 0, // Search API doesn't provide citation counts
            url: result.url || "",
            category,
          };
        }
      );

      return searchResults;
    } catch (error) {
      console.error("Perplexity API error:", error);
      throw new Error(
        `Failed to fetch papers from Perplexity: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

export function extractSummary(snippet: string): string {
  if (!snippet) {
    return "";
  }

  // 1. Prioritized Keyword Search
  const summaryMarkers = [
    "This article ",
    "**Conclusions:**",
    "# Editorial: ",
    "# Abstract",
    "## Abstract",
    "**Summary**",
    "**Background:**",
    "# Summary",
    "# ",
  ];

  for (const marker of summaryMarkers) {
    const markerIndex = snippet.indexOf(marker);
    if (markerIndex !== -1) {
      if (marker === "# " && markerIndex > 0) continue; // only accept # at start of snippet
      let summaryText = snippet.substring(markerIndex + marker.length).trim();
      if (marker === "This article ")
        summaryText = "This article " + summaryText;

      // if summaryTexts starts with a number, skip
      if (/^\d/.test(summaryText)) continue;

      const nextSectionIndex = summaryText.indexOf("\n# ");
      if (nextSectionIndex !== -1) {
        summaryText = summaryText.substring(0, nextSectionIndex).trim();
      }
      return cleanText(summaryText);
    }
  }

  // 2. First Meaningful Paragraph Fallback
  const paragraphs = snippet.split("\n\n");
  for (const paragraph of paragraphs) {
    if (/^\d/.test(paragraph)) continue;

    const cleaned = cleanText(paragraph);
    if (cleaned.length > 200) {
      // Heuristic for a "meaningful" paragraph
      return cleaned;
    }
  }

  return cleanText(snippet); // Fallback to cleaning the whole snippet
}

function cleanText(text: string): string {
  let cleanedText = text;

  // Remove markdown, tables, and other noise
  cleanedText = cleanedText
    .replace(/(\*\*|##|###)/g, "") // Bold and headers
    .replace(/\^(\d+|\^|,|✉|\*)\^/g, "") // Caret-enclosed characters
    .replace(/\[\d+\]/g, "") // Numbered citations
    .replace(/https?:\/\/[^\s]+/g, "") // URLs
    .replace(/\|--*\|/g, "") // Table lines
    .replace(/\|/g, " ") // Table pipes
    .replace(/\b(p-value|<0.0001)\b/g, ""); // Specific noise

  // Normalize whitespace
  cleanedText = cleanedText.replace(/\s+/g, " ").trim();

  // Remove first sentance if it's lower case
  if (cleanedText.startsWith(cleanedText.charAt(0).toLowerCase())) {
    const firstPeriod = cleanedText.indexOf(". ");
    if (firstPeriod !== -1) {
      cleanedText = cleanedText.substring(firstPeriod + 2).trim();
    }
  }

  // Truncate if it's too long
  if (cleanedText.length > 800) {
    cleanedText = cleanedText.substring(0, 800) + "...";
  }

  return cleanedText;
}
