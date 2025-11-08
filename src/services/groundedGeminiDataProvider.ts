import type { DataProvider } from "./dataProviderInterface";
import type { SearchResult } from "../types"; // Using SearchResult for broader compatibility
import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

export class GroundedGeminiDataProvider implements DataProvider {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async fetchPapers(
    query: string,
    limit: number,
    filter_type: string = ""
  ): Promise<SearchResult[]> {
    return this._fetchAndParseWithRetry(query, limit, filter_type, 0, 2); // 2 retries means 3 attempts total (0, 1, 2)
  }

  private async _fetchAndParseWithRetry(
    query: string,
    limit: number,
    filter_type: string,
    currentRetry: number,
    maxRetries: number
  ): Promise<SearchResult[]> {
    const q = query.trim();

    limit = 5;

    if (!q) {
      return [];
    }

    try {
      console.log(
        `Using GroundedGeminiDataProvider with query: ${q}, filter: ${filter_type}, retry: ${currentRetry}/${maxRetries}`
      );

      let searchQuery = `${q}`;

      // Extract location from query if present (e.g., "(in Detroit Michigan)")
      const locationMatch = q.match(/\(in ([^)]+)\)/);
      const location = locationMatch ? locationMatch[1] : "";

      // Add filter type if provided
      if (filter_type) {
        searchQuery += `. preferences:${filter_type}`;
      }

      const isProductQuery =
        searchQuery.toLowerCase().includes("buy") ||
        searchQuery.toLowerCase().includes("shopping");

      const prompt = `What is the top ${limit} top recommended specific products for this search: "${q}". Each item should have a "title" (product name [DECISION CATEGORY top pick]), a "description" (brief explanation of why it's recommended), and a "url" (Google Shopping link for the product). No preamble.`;

      console.log("Generated prompt:", prompt);

      const generationConfig: Record<string, any> = {
        tools: [{ googleSearch: {} }],
      };

      const result = await this.ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents:
          "You are a helpful assistant that always responds in JSON format { results: [ {title, description, url} ] }. Start answer with:```json. <USE_SEARCH>" +
          prompt,
        config: {
          tools: generationConfig.tools,
        },
      });

      const response = result;
      console.log("Gemini API response received");
      console.log(JSON.stringify(response, null, 2));

      const groundingMetadata =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      console.log(
        "Grounding metadata:",
        JSON.stringify(groundingMetadata, null, 2)
      );
      const content = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let text = content;
      text = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
      text = text.replace(/\n/g, "");
      text = text.replace(/\\"/g, '"');

      console.log("Extracted text for parsing:", text);

      let parsed: any[] = [];

      try {
        parsed = JSON.parse(text.trim()).results;
      } catch (jsonError) {
        console.error("Failed to parse Gemini response as JSON:", jsonError);
        console.error("Raw Gemini response:", text);

        if (currentRetry < maxRetries) {
          const delay = Math.pow(2, currentRetry) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(
            `Retrying in ${delay / 1000} seconds... (Attempt ${
              currentRetry + 1
            }/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this._fetchAndParseWithRetry(
            query,
            limit,
            filter_type,
            currentRetry + 1,
            maxRetries
          );
        } else {
          console.error(
            "Max retries reached for JSON parsing. Returning empty array."
          );
          return [];
        }
      }

      if (!Array.isArray(parsed)) {
        console.warn("Gemini response was not an array", parsed);
        return [];
      }

      return parsed.map((item: Record<string, unknown>, index) => {
        const title: string =
          typeof item.title === "string" && item.title.trim().length > 0
            ? item.title
            : "Untitled";
        const description =
          typeof item.description === "string" &&
          item.description.trim().length > 0
            ? item.description
            : "No description available";

        console.log("Item title:", groundingMetadata, item);

        let searchTerm = location ? `${title} ${location}` : title;
        searchTerm = searchTerm.replace(/\[.*?\]/g, "").trim();

        let url = `https://www.google.com/search?udm=28&q=${encodeURIComponent(
          searchTerm
        )}&sjc=1`;

        return {
          id: `gemini-${Date.now()}-${index}`,
          source: "Gemini",
          title,
          publisher: "Google Gemini",
          publicationDate: String(new Date().getFullYear()),
          abstract: description,
          url,
          category: isProductQuery ? "product" : "article",
        } satisfies SearchResult;
      });
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(
        `Failed to fetch results from Gemini: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
