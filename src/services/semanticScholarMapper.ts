import type { SearchResult } from "@/types";

export interface SemanticScholarPaper {
  paperId: string;
  source?: string;
  title: string;
  // authors: { name: string }[];
  year: number;
  url: string;
  abstract: string;
  citationCount: number;
  category: "article" | "trial" | "guideline";
}

export const mapToSearchResult = (
  paper: SemanticScholarPaper
): SearchResult => {
  // const publisher =
  //   (paper.authors || []).map((a) => a.name).join(", ") || "N/A";
  return {
    id: paper.paperId,
    title: paper.title,
    source: paper.source || "Unknown",
    publisher: "",
    publicationDate: paper.year ? String(paper.year) : "N/A",
    abstract: paper.abstract || "No abstract available.",
    citationCount: paper.citationCount || 0,
    url: paper.url,
    category: paper.category || "article",
  };
};
