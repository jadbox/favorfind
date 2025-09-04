import { SearchResult } from '../types';

const API_BASE_URL = 'https://api.semanticscholar.org/graph/v1';

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract?: string;
  venue?: string;
  year?: number;
  authors?: Array<{
    name: string;
    authorId?: string;
  }>;
  citationCount?: number;
  publicationDate?: string;
  url?: string;
  journal?: {
    name?: string;
  };
  publicationTypes?: string[];
}

interface SemanticScholarResponse {
  data: SemanticScholarPaper[];
  total: number;
}

const getApiKey = (): string => {
  return import.meta.env.VITE_SEMANTIC_SCHOLAR_API || '';
};

const mapToSearchResult = (paper: SemanticScholarPaper): SearchResult => {
  // Determine type based on publication types or venue
  let type: 'article' | 'trial' | 'guideline' = 'article';
  if (paper.publicationTypes?.some(t => t.toLowerCase().includes('clinical'))) {
    type = 'trial';
  } else if (paper.venue?.toLowerCase().includes('guideline') || 
             paper.title?.toLowerCase().includes('guideline')) {
    type = 'guideline';
  }

  // Determine category based on title and abstract content
  let category = 'General Oncology';
  const content = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
  
  if (content.includes('immunotherapy') || content.includes('checkpoint inhibitor')) {
    category = 'Immunotherapy';
  } else if (content.includes('targeted therapy') || content.includes('her2') || content.includes('egfr')) {
    category = 'Targeted Therapy';
  } else if (content.includes('car-t') || content.includes('cell therapy')) {
    category = 'Cellular Therapy';
  } else if (content.includes('chemotherapy') || content.includes('cytotoxic')) {
    category = 'Chemotherapy';
  } else if (content.includes('radiation') || content.includes('radiotherapy')) {
    category = 'Radiation Therapy';
  }

  return {
    id: paper.paperId,
    title: paper.title,
    source: paper.venue || paper.journal?.name || 'Unknown Journal',
    publisher: paper.venue || paper.journal?.name || 'Unknown Publisher',
    publicationDate: paper.publicationDate || `${paper.year}-01-01` || new Date().toISOString(),
    abstract: paper.abstract || 'No abstract available.',
    citationCount: paper.citationCount || 0,
    url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
    type,
    category
  };
};

export const searchPapers = async (query: string, limit: number = 20): Promise<SearchResult[]> => {
  try {
    const apiKey = getApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    // Add cancer/oncology context to improve relevance for medical searches
    const enhancedQuery = `${query} cancer oncology`;
    
    const url = new URL(`${API_BASE_URL}/paper/search`);
    url.searchParams.append('query', enhancedQuery);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('fields', 'paperId,title,abstract,venue,year,authors,citationCount,publicationDate,url,journal,publicationTypes');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: SemanticScholarResponse = await response.json();
    
    return data.data.map(mapToSearchResult);
  } catch (error) {
    console.error('Error searching Semantic Scholar:', error);
    
    // Fallback to dummy data if API fails
    const { getSearchResults } = await import('../data/dummyResults');
    return getSearchResults(query);
  }
};