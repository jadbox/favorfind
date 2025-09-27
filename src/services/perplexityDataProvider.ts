import type { DataProvider } from "./dataProviderInterface";
import type { SemanticScholarPaper } from "./semanticScholarMapper";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  throw new Error("PERPLEXITY_API_KEY environment variable is not set");
}

export class PerplexityDataProvider implements DataProvider {
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
      console.log(
        "Using PerplexityDataProvider with query:",
        q,
        "filter:",
        filter_type
      );

      const systemMessage = `You are a research assistant specializing in medical literature. You help doctors find the most useful and practical open-access articles from PubMed about cancer research and treatment.`;

      limit = 10; // override
      const userMessage = `Search for exactly ${limit} most relevant open-access articles listed by PubMed that matches this search:
      <SEARCH>
        ${q}
      </SEARCH>
      ${
        filter_type
          ? `The search should also have the following criteria: ${filter_type}.`
          : ""
      }

      Focus on practical, useful insights for cancer treatment and identification.`;

      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              {
                role: "system",
                content: systemMessage,
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            maxResults: 10,
            search_mode: "academic",
            temperature: 0.1,
            max_tokens: 4000,
            response_format: {
              type: "json_schema",
              json_schema: {
                schema: {
                  type: "object",
                  properties: {
                    papers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: {
                            type: "string",
                            enum: ["article", "trial", "guideline"],
                          },
                          paperId: {
                            type: "string",
                          },
                          title: {
                            type: "string",
                          },
                          year: {
                            type: "integer",
                          },
                          url: {
                            type: "string",
                          },
                          abstract: {
                            type: "string",
                          },
                          citationCount: {
                            type: "integer",
                          },
                        },
                        required: [
                          "paperId",
                          "title",
                          "year",
                          "url",
                          "abstract",
                          "citationCount",
                        ],
                      },
                    },
                  },
                  required: ["papers"],
                },
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Perplexity API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from Perplexity API");
      }

      console.log("Perplexity response content:", content);

      const parsedResponse = JSON.parse(content.trim());
      const papers: SemanticScholarPaper[] = parsedResponse.papers || [];

      // Validate and clean the data
      return papers.map((paper, index) => ({
        paperId: paper.paperId || `perplexity-${Date.now()}-${index}`,
        source: "Perplexity",
        title: paper.title || "Untitled",
        category: paper.category || "article",
        // authors: [], // Array.isArray(paper.authors) ? paper.authors : [],
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
      console.error("Perplexity API error:", error);
      throw new Error(
        `Failed to fetch papers from Perplexity: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
