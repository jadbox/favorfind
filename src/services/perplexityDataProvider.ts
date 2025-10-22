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
    limit = 6; // Search API max is 20

    const isProductQuery = searchQuery.toLowerCase().includes("buy") || 
      searchQuery.toLowerCase().includes("shopping");
    const isNews = searchQuery.toLowerCase().includes("news");
    const isLatest = searchQuery.toLowerCase().includes("latest") || isNews;

    console.log("isProductQuery:", isProductQuery);

      const prompt = isProductQuery
        ? `What is the top ${limit} recommended specific products and where to buy it for this user search: "${q}". Each item should have a "title" (product name), a "description" (brief explanation of why it's recommended), and a "url" (Google Shopping link for the product). No preamble.`
        : `Provide direct answers for the user request for searching: "${q}".`;

    const searchResponse = await this.client.chat.completions.create({
      model: "sonar-pro", // sonar-pro
      messages: [
            { role: "system", content: 
              "You are a helpful assistant that provides concise results in JSON format { results: [ {title, description, url} ] }." },
            { role: "user", content: prompt }],
      return_images: true,
      search_mode: "web",
      search_recency_filter: isLatest ? "week" : "year",
    });

    // Map search results to SearchResult format
    const content = searchResponse?.choices[0]?.message.content as string;

    console.log("Perplexity API response content:", content);

    let parsed = content;
    parsed = parsed.slice(parsed.indexOf('{'), parsed.lastIndexOf('}') + 1); // Ensure we only have the JSON object

    const entries: SearchResult[] = JSON.parse(parsed).results.map(
      (result: { title: string; description: string; url: string }, index: number) => ({
        id: `perplexity-${Date.now()}-${index + 1}`, // Map to id
        source: "Perplexity",
        title: result.title,
        publisher: "Perplexity AI", // Use hostname as publisher
        publicationDate: "Unknown",
        abstract: result.description || "No abstract available",
        url: result.url,
        category: "article",
      })
    );

    return entries;
  }
}

