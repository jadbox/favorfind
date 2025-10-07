import Perplexity from "@perplexity-ai/perplexity_ai";
import type { DataProvider } from "./dataProviderInterface";
import type { SemanticScholarPaper } from "./semanticScholarMapper";

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
  ): Promise<SemanticScholarPaper[]> {
    const q = query.trim();

    if (!q) {
      return [];
    }

    try {
      // Build the search query with domain filtering
      let searchQuery = `${q} PubMed article for cancer clinicians.`; //  -site:cancer.gov

      // Add filter type if provided
      if (filter_type) {
        searchQuery += ` ${filter_type}`;
      }

      searchQuery += ` (site:pubmed.ncbi.nlm.nih.gov OR site:nih.gov)`;

      // Add domain filtering to restrict to PubMed and NIH sites
      searchQuery += ` (site:pubmed.ncbi.nlm.nih.gov OR site:nih.gov)`;

      console.log("::Perplexity Search Query::");
      console.log(searchQuery);

      // Use the Search API for direct web search results
      const effectiveLimit = Math.min(limit, 20); // Search API max is 20

      const searchResponse = await this.client.search.create({
        query: searchQuery,
        max_results: effectiveLimit,
        max_tokens_per_page: 1024, // Balanced extraction for abstracts 1024
      });

      console.log("Perplexity search response:", searchResponse);

      //filter results at a root domain without a page path
      searchResponse.results = (searchResponse.results || []).filter(
        (result) => {
          const url = new URL(result.url || "");
          return url.pathname.split("/").filter(Boolean).length > 0; // Ensure there's a path after the domain
        }
      );

      // Map search results to SemanticScholarPaper format
      const papers: SemanticScholarPaper[] = (searchResponse.results || []).map(
        (result, index) => {
          // Extract year from date if available
          let year: string = (result.date as string) || "";
          // if (result.date) {
          //   const yearMatch = result.date.match(/\d{4}/);
          //   if (yearMatch) {
          //     year = parseInt(yearMatch[0], 10);
          //   }
          // }

          // search for most common word in title and snippet that matches "article", "trial", "guideline"
          const category = getMostCommonCategory(result.title, result.snippet);

          // result.snippet = result.snippet.split("^")[0] as string; // Remove any trailing "^ " and beyond

          // if (result.snippet.includes("# ")) {
          //   result.snippet = result.snippet.split("# ")[1] as string; // Remove any leading "# " if present
          //   // cut anything after \n line break
          //   result.snippet = result.snippet.split("\n")[0] as string;
          // }

          return {
            paperId: `perplexity-${Date.now()}-${index}`,
            source: "Perplexity",
            title: result.title?.replace("www.", " ") || "Untitled",
            category, // Default category since search API doesn't provide this
            year: year, // Default to current year if not available
            url: result.url || "",
            abstract: extractSummary(result.snippet) || "No abstract available",
            citationCount: 0, // Search API doesn't provide citation counts
          };
        }
      );

      return papers;
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

function getMostCommonCategory(
  title: string,
  text_body: string
): "article" | "trial" | "guideline" {
  const text = title + ": " + text_body;
  const textLower = text.toLowerCase();

  // Define category patterns with alternates
  const categoryPatterns: Array<{
    category: "article" | "trial" | "guideline";
    patterns: string[];
  }> = [
    {
      category: "article",
      patterns: ["research", "Trends", "wikipedia", "article"],
    },
    { category: "trial", patterns: ["trial", "study", "case report"] },
    {
      category: "guideline",
      patterns: [
        "insights",
        "basics",
        "causes",
        "Risk Factor",
        "Diagnosis",
        "Epidemiology",
        "Meta-Analysis",
        "Systematic Review",
        "review",
        "of the Literature",
        "recommendations",
        "guidance",
        "consensus",
        "guideline",
        "review",
        "recommendation",
        "overview",
      ],
    },
  ];

  // Find the first occurrence of any category word
  let firstMatch: {
    position: number;
    category: "article" | "trial" | "guideline";
  } | null = null;

  for (const { category, patterns } of categoryPatterns) {
    for (const pattern of patterns) {
      // Allow a simple plural form by matching an optional trailing 's' when the pattern
      // itself does not already end with 's'.
      const needsPlural = !/[sS]$/.test(pattern);
      const patternWithPlural = needsPlural ? `${pattern}(s)?` : pattern;
      const regex = new RegExp(`\\b${patternWithPlural}\\b`, "i");
      const match = textLower.match(regex);

      if (match && match.index !== undefined) {
        if (!firstMatch || match.index < firstMatch.position) {
          firstMatch = { position: match.index, category };
        }
      }
    }
  }

  return firstMatch ? firstMatch.category : "article";
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
