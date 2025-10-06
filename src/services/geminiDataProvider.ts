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
      const prompt = `This tool is for doctors to get the best useful information to understand and treat types of cancers. Results must be practical or useful insightful. 
                      Search only for the ${limit} most useful open-access articles listed by PubMed about: "${q}". 
      ${
        filter_type
          ? `The search should be filtered by the following filter criteria: ${filter_type}.`
          : ""
      }
      No preamble. Return only a concise JSON array of up to ${limit} articles.`;

      console.log("Generated prompt:", prompt);

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          // tools: [groundingTool],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  enum: ["article", "trial", "guideline"],
                },
                paperId: {
                  type: Type.STRING,
                },
                title: {
                  type: Type.STRING,
                },
                // authors: {
                //   type: Type.ARRAY,
                //   items: {
                //     type: Type.OBJECT,
                //     properties: {
                //       name: {
                //         type: Type.STRING,
                //       },
                //     },
                //   },
                // },
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
                // "authors",
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
      const parsed = JSON.parse(text.trim());

      if (!Array.isArray(parsed)) {
        console.warn("Gemini response was not an array", parsed);
        return [];
      }

      // Validate and clean the data
      return parsed.map((paper: Record<string, unknown>, index) => {
        const rawCategory = typeof paper.category === "string" ? paper.category : "";
        const category: SemanticScholarPaper["category"] = [
          "article",
          "trial",
          "guideline",
        ].includes(rawCategory as SemanticScholarPaper["category"])
          ? (rawCategory as SemanticScholarPaper["category"])
          : "article";

        const rawYear = paper.year;
        const normalizedYear = (() => {
          if (typeof rawYear === "string" && rawYear.trim().length > 0) {
            return rawYear;
          }
          if (typeof rawYear === "number" && Number.isFinite(rawYear)) {
            return String(rawYear);
          }
          return String(new Date().getFullYear());
        })();

        return {
          paperId:
            typeof paper.paperId === "string" && paper.paperId
              ? paper.paperId
              : `gemini-${Date.now()}-${index}`,
          source: "Gemini",
          title:
            typeof paper.title === "string" && paper.title.trim().length > 0
              ? paper.title
              : "Untitled",
          category,
          year: normalizedYear,
          url:
            typeof paper.url === "string" && paper.url.trim().length > 0
              ? paper.url
              : "",
          abstract:
            typeof paper.abstract === "string" && paper.abstract.trim().length > 0
              ? paper.abstract
              : "No abstract available",
          citationCount:
            typeof paper.citationCount === "number" && Number.isFinite(paper.citationCount)
              ? paper.citationCount
              : 0,
        } satisfies SemanticScholarPaper;
      });
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
