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
      let searchQuery = `${q} article, guideline, or trial study most helpful to clinicians. Must be a cancer treatment, trial report, and cancer research. site:fda.gov site:clinicaltrials.gov site:pubmed.ncbi.nlm.nih.gov site:nih.gov site:cancer.gov`;

      // Add filter type if provided
      if (filter_type) {
        searchQuery += ` ${filter_type}`;
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
            title: result.title || "Untitled",
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
  const categories: Array<"article" | "trial" | "guideline"> = [
    "article",
    "trial",
    "guideline",
  ];
  const textLower = text.toLowerCase();
  const counts: Record<"article" | "trial" | "guideline", number> = {
    article: 0,
    trial: 0,
    guideline: 0,
  };

  categories.forEach((category) => {
    const regex = new RegExp(`\\b${category}\\b`, "g");
    const matches = textLower.match(regex);
    counts[category] = matches ? matches.length : 0;
  });

  // Find the category with the highest count, fallback to "article" if all are zero
  let maxCategory: "article" | "trial" | "guideline" = "article";
  let maxCount = counts[maxCategory];

  for (const category of categories) {
    if (counts[category] > maxCount) {
      maxCategory = category;
      maxCount = counts[category];
    }
  }

  return maxCount > 0 ? maxCategory : "article";
}
