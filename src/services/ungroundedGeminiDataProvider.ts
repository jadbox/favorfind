import type { DataProvider } from "./dataProviderInterface";
import type { SearchResult } from "../types"; // Using SearchResult for broader compatibility
import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

export class UngroundedGeminiDataProvider implements DataProvider {
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

    if (!q) {
      return [];
    }

    try {
      console.log(
        "Using UngroundedGeminiDataProvider with query:",
        q,
        "filter:",
        filter_type
      );

      const isProductQuery = filter_type.toLowerCase().includes("product");

      const prompt = isProductQuery
        ? `Provide a concise JSON array of up to ${limit} top recommended products to buy for "${q}". Each item should have a "title" (product name), a "description" (brief explanation of why it's recommended), and a "url" (Google Shopping link for the product). No preamble.`
        : `Provide a concise JSON array of up to ${limit} most helpful article titles for "${q}". Each item should have a "title" (article title), a "description" (brief explanation of why it's helpful), and a "url" (link to the article). No preamble.`;

      console.log("Generated prompt:", prompt);

      const generationConfig: Record<string, any> = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
              },
              description: {
                type: Type.STRING,
              },
              url: {
                type: Type.STRING,
              },
            },
            required: ["title", "description", "url"],
          },
        },
      };

      const result = await this.ai.models.generateContent({ // Use this.ai
        model: "gemini-flash-latest",
        contents: prompt,
        ...generationConfig,
      });

      const response = result;
      let text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let parsed: any[] = [];

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
        const title =
          typeof item.title === "string" && item.title.trim().length > 0
            ? item.title
            : "Untitled";
        const description =
          typeof item.description === "string" &&
          item.description.trim().length > 0
            ? item.description
            : "No description available";
        let url =
          typeof item.url === "string" && item.url.trim().length > 0
            ? item.url
            : "";

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
          citationCount: 0,
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
