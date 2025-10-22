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
    const q = query.trim();

    limit = 3;

    if (!q) {
      return [];
    }

    try {
      const groundingTool = {
        googleSearch: {},
      };

      console.log(
        "Using GroundedGeminiDataProvider with query:",
        q,
        "filter:",
        filter_type
      );

      const isProductQuery = filter_type.toLowerCase().includes("product");

      const prompt = isProductQuery
        ? `What is the top ${limit} recommended products to buy for "${q}". Each item should have a "title" (product name), a "description" (brief explanation of why it's recommended), and a "url" (Google Shopping link for the product). No preamble.`
        : `Provide a concise bullet of up to ${limit} most helpful article titles for "${q}". Each item should have a "title" (article title), a "description" (brief explanation of why it's helpful), and a "url" (link to the article). No preamble.`;

      console.log("Generated prompt:", prompt);

      const generationConfig: Record<string, any> = {
        tools: [groundingTool],
        // responseMimeType: "text/plain", // Grounding might override JSON output
      };

      const result = await this.ai.models.generateContent({ // Use this.ai
        model: "gemini-flash-latest", // Using latest for potential grounding improvements
        contents: prompt,
        ...generationConfig, // Spread generationConfig properties
      });

      const response = result;
      console.log("Gemini API response received");
      console.log(JSON.stringify(response, null, 2));
      throw new Error("Debug stop");

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      // if (groundingMetadata?.groundingChunks) {
      //   console.log("Grounding chunks found:", groundingMetadata.groundingChunks);

      //   // map needs replacement
      //   return groundingMetadata.groundingChunks.map((chunk: any, index: number) => {
      //     return {
      //       id: `gemini-${Date.now()}-${index}`,
      //       source: "Gemini",
      //       title: chunk.web.title || "Untitled",
      //       publisher: new URL(chunk.web.uri).hostname || "Google Gemini",
      //       publicationDate: String(new Date().getFullYear()),
      //       abstract: "No abstract available", // Grounding chunks don't provide a snippet
      //       citationCount: 0,
      //       url: chunk.web.uri,
      //       category: isProductQuery ? "product" : "article",
      //     } satisfies SearchResult;
      //   });
      // }

      // Fallback to parsing text if grounding chunks are not available
      let text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let parsed: any[] = [];

    text = text.replace(/^\s*```json/, "").replace(/```\s*$/, "");

      try {
        parsed = JSON.parse(text.trim());
      } catch (jsonError) {
        console.error("Failed to parse Gemini response as JSON:", jsonError);
        console.error("Raw Gemini response:", text);
        return [];
      }

      if (!Array.isArray(parsed)) {
        console.warn("Gemini response was not an array", parsed);
        return [];
      }

      return parsed.map((item: Record<string, unknown>, index) => {

        const title:string =
          typeof item.title === "string" && item.title.trim().length > 0
            ? item.title
            : "Untitled";
        const description =
          typeof item.description === "string" &&
          item.description.trim().length > 0
            ? item.description
            : "No description available";

        console.log("Item title:", groundingMetadata, item);
        let url:string = (groundingMetadata?.groundingChunks?.[0]?.web?.uri || item.url || "") as string;

        if (isProductQuery && title !== "Untitled") {
          url = `https://www.google.com/search?udm=28&q=${encodeURIComponent(
            title
          )}&sjc=1`;
        }

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
