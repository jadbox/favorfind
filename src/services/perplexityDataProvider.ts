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
      let searchQuery = `${q} top PubMed articles, guidelines, trial study for clinicians for cancer Treatment and Analysis. site:fda.gov site:clinicaltrials.gov site:pubmed.ncbi.nlm.nih.gov site:nih.gov -site:cancer.gov`;

      // Add filter type if provided
      if (filter_type) {
        searchQuery = `${filter_type} for ${searchQuery}`;
      }

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

      // console.log("Perplexity search response:", searchResponse);

      // Map search results to SemanticScholarPaper format
      const papers: SemanticScholarPaper[] = (searchResponse.results || []).map(
        (result, index) => {
          // Extract year from date if available
          let year: number | undefined;
          if (result.date) {
            const yearMatch = result.date.match(/\d{4}/);
            if (yearMatch) {
              year = parseInt(yearMatch[0], 10);
            }
          }

          // search for most common word in title and snippet that matches "article", "trial", "guideline"
          const category = getMostCommonCategory(
            result.title + ": " + result.snippet
          );

          return {
            paperId: `perplexity-${Date.now()}-${index}`,
            source: "Perplexity",
            title: result.title?.replace("www.", " ") || "Untitled",
            category, // Default category since search API doesn't provide this
            year: year || new Date().getFullYear(), // Default to current year if not available
            url: result.url || "",
            abstract: result.snippet || "No abstract available",
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
  text: string
): "article" | "trial" | "guideline" {
  const textLower = text.toLowerCase();

  // Define category patterns with alternates
  const categoryPatterns: Array<{
    category: "article" | "trial" | "guideline";
    patterns: string[];
  }> = [
    {
      category: "article",
      patterns: ["article", "paper", "research", "analysis", "review"],
    },
    { category: "trial", patterns: ["trial", "study"] },
    {
      category: "guideline",
      patterns: ["guideline", "guidance", "recommendation", "overview"],
    },
  ];

  // Find the first occurrence of any category word
  let firstMatch: {
    position: number;
    category: "article" | "trial" | "guideline";
  } | null = null;

  for (const { category, patterns } of categoryPatterns) {
    for (const pattern of patterns) {
      const regex = new RegExp(`\\b${pattern}\\b`, "i");
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
