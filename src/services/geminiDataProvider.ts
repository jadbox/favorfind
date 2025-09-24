import type { DataProvider } from "./dataProviderInterface";
import type { SemanticScholarPaper } from "./semanticScholarMapper";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class GeminiDataProvider implements DataProvider {
  async fetchPapers(
    query: string,
    limit: number
  ): Promise<SemanticScholarPaper[]> {
    const q = query.trim();

    if (!q) {
      return [];
    }

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    try {
      const { GoogleGenAI, Type } = await import("@google/genai");

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      console.log("Using GeminiDataProvider with query:", q);
      const prompt = `Search only for the 3 most useful articles listed by PubMed about: "${q}". Return a JSON array of up to ${limit} articles.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
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
