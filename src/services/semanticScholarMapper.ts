import type { SearchResult } from "@/types";

export interface SemanticScholarPaper {
  paperId: string;
  source?: string;
  title: string;
  authors?: { name: string }[]; // Uncommented and typed
  year: string;
  url: string;
  abstract: string;
  citationCount: number;
  category: "article" | "trial" | "guideline";
}
