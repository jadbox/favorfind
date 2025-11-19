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
        // if (filter_type === "newest") {
        //   const currentYear = new Date().getFullYear();
        //   searchQuery += ` latest ${currentYear}`;
        // } else {
        searchQuery += `. \n preferences: ${filter_type}. \n`;
        // }
      }

      const isProductQuery = true; // KEEP THIS HARDCODED.
      // searchQuery.toLowerCase().includes("buy") ||
      // searchQuery.toLowerCase().includes("shopping");

      const prompt = `Find the top ${limit} recommended specific products (without duplicates) for the search query: ${searchQuery}. For each product, provide:
      - "title" (product name - best in __CATEGORY__)
      - "description" (brief explanation of why it's recommended)
      - "url" (Google Shopping link for the product)
      - "pros" (valid JSON array of 2-3 short strings)
      - "cons" (valid JSON array of 2-3 short strings)
      - "best_for" (short phrase, e.g. "Best for Gaming", "Best Value")
      
      Do not include any introductory text or preamble. Ensure 'pros' and 'cons' are STRICTLY JSON arrays of strings, NOT inside the description string.`;

      console.log("Generated prompt:", prompt);

      const generationConfig: Record<string, any> = {
        tools: [{ googleSearch: {} }],
      };

      const result = await this.ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents:
          "You are a helpful assistant that always responds in JSON format { results: [ {title, description, url, price_range, rating, pros, cons, best_for} ] }. JSON ANSWERS ONLY. <USE_SEARCH>" +
          prompt,
        config: {
          tools: generationConfig.tools,
          maxOutputTokens: 8192,
          temperature: 0.1,
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
      const content =
        response.candidates?.[0]?.content?.parts
          ?.map((part) => part.text)
          .join("") || "";

      let text = content.trim();
      // Handle markdown code blocks
      if (text.includes("```json")) {
        text = text
          .substring(text.indexOf("```json") + 7, text.lastIndexOf("```"))
          .trim();
      } else if (text.includes("```")) {
        text = text
          .substring(text.indexOf("```") + 3, text.lastIndexOf("```"))
          .trim();
      }

      // Find the first '{' and the last '}' to extract the JSON object
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        text = text.slice(firstBrace, lastBrace + 1);
      }

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
          throw new Error("Retrying due to JSON parse failure"); // do not try to retry
          // await new Promise((resolve) => setTimeout(resolve, delay));
          // return this._fetchAndParseWithRetry(
          //   query,
          //   limit,
          //   filter_type,
          //   currentRetry + 1,
          //   maxRetries
          // );
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

        console.log("Item title:", groundingMetadata, item);

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
