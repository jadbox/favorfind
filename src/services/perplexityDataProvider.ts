import Perplexity from "@perplexity-ai/perplexity_ai";
import type { DataProvider } from "./dataProviderInterface";
import type { SemanticScholarPaper } from "./semanticScholarMapper";

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
  ): Promise<SemanticScholarPaper[]> {
    const q = query.trim();

    if (!q) {
      return [];
    }

    try {
      // console.log(
      //   "Using PerplexityDataProvider with query:",
      //   q,
      //   "filter:",
      //   filter_type
      // );

      const systemMessage = `You are a research assistant specializing in medical literature. You help doctors find the most useful and practical open-access articles from PubMed about cancer research and treatment.`;

      const effectiveLimit = 10; // Perplexity has a hard limit for this feature

      const userMessage = `Search for exactly ${effectiveLimit} top relevant medical articles listed that matches:
      <SEARCH_TERM>
        ${q}
      </SEARCH_TERM>
      ${
        filter_type
          ? `Extra search criterias: <PARAMS>${filter_type}</PARAMS>.`
          : ""
      }

      Focus on practical, useful insights for cancer treatment and identification.
      No preamble. No duplicate articles.`;

      console.log("::Generated prompt::");
      console.log(userMessage);

      const completion = await this.client.chat.completions.create({
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
        // temperature: 0.4,
        max_tokens: 6000,
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
                      paper_title: {
                        type: "string",
                      },
                      publish_date: {
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
        search_domain_filter: ["pubmed.ncbi.nlm.nih.gov", "nih.gov"],
        num_search_results: effectiveLimit,
      });

      const content = completion.choices?.[0]?.message?.content;

      if (typeof content !== "string") {
        throw new Error("No string content received from Perplexity API");
      }

      console.log("Perplexity response content:", content);

      const parsedResponse = JSON.parse(content.trim());

      const papers: SemanticScholarPaper[] = parsedResponse.papers || [];
      papers.forEach((element) => {
        element.title = (element as any).paper_title;
      });
      papers.forEach((element) => {
        element.year = (element as any).publish_date;
      });

      // Validate and clean the data
      return papers.map((paper, index) => ({
        paperId: paper.paperId || `perplexity-${Date.now()}-${index}`,
        source: "Perplexity",
        title: paper.title || "Untitled",
        category: paper.category || "article",
        // authors: [], // Array.isArray(paper.authors) ? paper.authors : [],
        year: paper.year,
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
