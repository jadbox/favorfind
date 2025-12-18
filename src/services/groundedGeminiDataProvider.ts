import type { DataProvider } from "./dataProviderInterface";
import type { SearchResult } from "../types"; // Using SearchResult for broader compatibility
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

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
        searchQuery += `. \n preferences: ${filter_type}. \n`;
      }

      const isProductQuery = true; // KEEP THIS HARDCODED.

      const prompt = `Find the top ${limit} recommended specific products (without duplicates) for the search query: ${searchQuery}. For each product, provide:
      - "title" (product name - best in __CATEGORY__)
      - "description" (brief explanation of why it's recommended)
      - "url" (Google Shopping link for the product)
      - "pros" (list of 2-3 short strings)
      - "cons" (list of 2-3 short strings)
      - "best_for" (short phrase, e.g. "Best for Gaming", "Best Value")`;

      console.log("Generated prompt:", prompt);

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          thinkingConfig: {
            // thinkingBudget: 0,
            thinkingLevel: ThinkingLevel.LOW,
          },
          tools: [{ googleSearch: {} }],
          maxOutputTokens: 8192,
          // temperature: 1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              results: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    url: { type: Type.STRING },
                    pros: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    cons: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    best_for: { type: Type.STRING },
                  },
                  required: ["title", "description", "pros", "cons"],
                },
              },
            },
            required: ["results"],
          },
        },
      });
      // console.log("Gemini API response received");
      // console.log(JSON.stringify(response, null, 2));

      // const groundingMetadata =
      //   response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      if (!response) return [];

      const content = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let parsed: any[] = [];

      try {
        parsed = JSON.parse(content.trim()).results;
        console.log("Grounding metadata:", JSON.stringify(parsed, null, 2));
      } catch (jsonError) {
        console.error("Failed to parse Gemini response as JSON:", jsonError);
        console.error("Raw Gemini response:", content);

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
        let description =
          typeof item.description === "string" &&
          item.description.trim().length > 0
            ? item.description
            : "No description available";

        // console.log("Item title:", groundingMetadata, item);

        let searchTerm = location ? `${title} ${location}` : title;
        searchTerm = searchTerm.replace(/\[.*?\]/g, "").trim();

        let url = `https://www.google.com/search?udm=28&q=${encodeURIComponent(
          searchTerm
        )}&sjc=1`;

        // Fallback parsing for pros/cons if they are missing from the JSON but present in the description
        let pros: string[] = Array.isArray(item.pros)
          ? (item.pros as string[])
          : [];
        let cons: string[] = Array.isArray(item.cons)
          ? (item.cons as string[])
          : [];

        // Clean up description if we removed parts
        description = description.trim();

        return {
          id: `gemini-${Date.now()}-${index}`,
          source: "Gemini",
          title,
          publisher: "Google Gemini",
          publicationDate: String(new Date().getFullYear()),
          abstract: description,
          url,
          category: isProductQuery ? "product" : "article",
          // New fields
          pros,
          cons,
          best_for:
            typeof item.best_for === "string" ? item.best_for : undefined,
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
