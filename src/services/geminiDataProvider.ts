import type { DataProvider } from "./dataProviderInterface";
import type { SemanticScholarPaper } from "./semanticScholarMapper";
import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export class GeminiDataProvider implements DataProvider {
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
      // Define the grounding tool
      //   const groundingTool = {
      //     googleSearch: {},
      //   };

      console.log(
        "Using GeminiDataProvider with query:",
        q,
        "filter:",
        filter_type
      );
      const prompt = `Search only for the ${limit} most useful open-access articles listed by PubMed about: "${q}". 
      ${
        filter_type
          ? `The search should be filtered by the following filter criteria: ${filter_type}.`
          : ""
      }
      Return only a concise JSON array of up to ${limit} articles.`;

      console.log("Generated prompt:", prompt);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          // tools: [groundingTool],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                paperId: {
                  type: Type.STRING,
                },
                title: {
                  type: Type.STRING,
                },
                authors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: {
                        type: Type.STRING,
                      },
                    },
                  },
                },
                year: {
                  type: Type.INTEGER,
                },
                url: {
                  type: Type.STRING,
                },
                abstract: {
                  type: Type.STRING,
                },
                citationCount: {
                  type: Type.INTEGER,
                },
              },
              required: [
                "paperId",
                "title",
                "authors",
                "year",
                "url",
                "abstract",
                "citationCount",
              ],
            },
          },
        },
      });

      const text = response.text || "";
      const papers: SemanticScholarPaper[] = JSON.parse(text.trim());

      // Validate and clean the data
      return papers.map((paper, index) => ({
        paperId: paper.paperId || `gemini-${Date.now()}-${index}`,
        title: paper.title || "Untitled",
        authors: Array.isArray(paper.authors) ? paper.authors : [],
        year:
          typeof paper.year === "number"
            ? paper.year
            : new Date().getFullYear(),
        url: paper.url || "",
        abstract: paper.abstract || "No abstract available",
        citationCount:
          typeof paper.citationCount === "number" ? paper.citationCount : 0,
      }));
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(
        `Failed to fetch papers from Gemini: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
