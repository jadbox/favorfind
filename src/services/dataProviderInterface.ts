import type { SemanticScholarPaper } from "./semanticScholarMapper";

export interface DataProvider {
  fetchPapers(query: string, limit: number): Promise<SemanticScholarPaper[]>;
}
