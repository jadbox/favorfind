import type { DataProvider } from "./dataProviderInterface";
import type { SemanticScholarPaper } from "./semanticScholarMapper";

const SEMANTIC_SCHOLAR_API_KEY = process.env.SEMANTIC_SCHOLAR_API;

interface SemanticScholarSearchResponse {
  data: SemanticScholarPaper[];
  total?: number;
}

export class SemanticScholarDataProvider implements DataProvider {
  async fetchPapers(
    query: string,
    limit: number
  ): Promise<SemanticScholarPaper[]> {
    const q = query.trim();

    if (!q) {
      return [];
    }

    try {
      const fields = "paperId,title,authors,year,url,abstract,citationCount";
      const base = new URL(
        "https://api.semanticscholar.org/graph/v1/paper/search"
      );
      base.search = new URLSearchParams({
        query: q,
        fields,
        limit: String(limit),
      }).toString();

      const headers: Record<string, string> = {};
      if (SEMANTIC_SCHOLAR_API_KEY && SEMANTIC_SCHOLAR_API_KEY.length > 0) {
        headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY;
      }

      const response = await fetch(base.toString(), { headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Semantic Scholar API error: ${response.status} - ${errorText}`
        );
      }

      const payload = (await response.json()) as SemanticScholarSearchResponse;

      return payload?.data || [];
    } catch (error) {
      throw error;
    }
  }
}
