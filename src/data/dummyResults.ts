import { SearchResult } from '../types';

export const dummySearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Trastuzumab deruxtecan versus trastuzumab emtansine in patients with HER2-positive metastatic breast cancer: updated results from DESTINY-Breast03',
    source: 'The Lancet',
    publisher: 'Elsevier',
    publicationDate: '2023-12-15',
    abstract: 'Background: Trastuzumab deruxtecan showed superior efficacy versus trastuzumab emtansine in patients with HER2-positive metastatic breast cancer in the primary analysis of DESTINY-Breast03. Here we report updated overall survival results with longer follow-up.',
    citationCount: 1247,
    url: 'https://www.thelancet.com/example-1',
    type: 'article',
    category: 'Targeted Therapy'
  },
  {
    id: '2',
    title: 'Phase 3 Trial of Pembrolizumab plus Chemotherapy versus Chemotherapy as First-Line Therapy for Metastatic Triple-Negative Breast Cancer',
    source: 'New England Journal of Medicine',
    publisher: 'Massachusetts Medical Society',
    publicationDate: '2023-11-28',
    abstract: 'BACKGROUND: Triple-negative breast cancer is an aggressive subtype with limited treatment options. The addition of immune checkpoint inhibitors to chemotherapy has shown promise in early-phase trials.',
    citationCount: 892,
    url: 'https://www.nejm.org/example-2',
    type: 'trial',
    category: 'Immunotherapy'
  },
  {
    id: '3',
    title: 'CAR-T Cell Therapy for Relapsed B-cell Acute Lymphoblastic Leukemia: Long-term Follow-up Results',
    source: 'Nature Medicine',
    publisher: 'Nature Publishing Group',
    publicationDate: '2024-01-10',
    abstract: 'Chimeric antigen receptor (CAR) T-cell therapy has revolutionized treatment for relapsed B-cell acute lymphoblastic leukemia (B-ALL). This study presents 5-year follow-up data from a pivotal trial.',
    citationCount: 564,
    url: 'https://www.nature.com/example-3',
    type: 'article',
    category: 'Cellular Therapy'
  },
  {
    id: '4',
    title: 'NCCN Clinical Practice Guidelines in Oncology: Breast Cancer Version 4.2024',
    source: 'NCCN Guidelines',
    publisher: 'National Comprehensive Cancer Network',
    publicationDate: '2024-02-01',
    abstract: 'These NCCN Guidelines Insights highlight important updates to the NCCN Clinical Practice Guidelines in Oncology (NCCN Guidelines®) for Breast Cancer.',
    citationCount: 2156,
    url: 'https://www.nccn.org/example-4',
    type: 'guideline',
    category: 'Treatment Guidelines'
  },
  {
    id: '5',
    title: 'Efficacy and Safety of Fam-trastuzumab deruxtecan in Patients with Previously Treated Advanced HER2-Low Breast Cancer',
    source: 'Journal of Clinical Oncology',
    publisher: 'American Society of Clinical Oncology',
    publicationDate: '2023-10-05',
    abstract: 'PURPOSE: HER2-low breast cancer represents a newly defined subset with potential therapeutic implications. This analysis evaluates the efficacy and safety of fam-trastuzumab deruxtecan in this population.',
    citationCount: 743,
    url: 'https://ascopubs.org/example-5',
    type: 'article',
    category: 'Targeted Therapy'
  },
  {
    id: '6',
    title: 'Neoadjuvant Immunotherapy for Early-Stage Triple-Negative Breast Cancer: A Systematic Review and Meta-Analysis',
    source: 'The Lancet Oncology',
    publisher: 'Elsevier',
    publicationDate: '2023-09-20',
    abstract: 'BACKGROUND: Neoadjuvant immunotherapy has emerged as a promising strategy for early-stage triple-negative breast cancer. We aimed to assess the efficacy and safety across multiple randomized trials.',
    citationCount: 428,
    url: 'https://www.thelancet.com/example-6',
    type: 'article',
    category: 'Immunotherapy'
  }
];

export const getSearchResults = (query: string): Promise<SearchResult[]> => {
  // Simple search simulation - in real app would call API
  const lowercaseQuery = query.toLowerCase();
  
  let filtered: SearchResult[];
  
  if (lowercaseQuery.includes('her2') || lowercaseQuery.includes('breast cancer')) {
    filtered = dummySearchResults.filter(result => 
      result.title.toLowerCase().includes('her2') || 
      result.title.toLowerCase().includes('breast cancer')
    );
  } else if (lowercaseQuery.includes('clinical trial')) {
    filtered = dummySearchResults.filter(result => result.type === 'trial');
  } else if (lowercaseQuery.includes('immunotherapy')) {
    filtered = dummySearchResults.filter(result => 
      result.category === 'Immunotherapy'
    );
  } else {
    // Return all results for other queries
    filtered = dummySearchResults;
  }
  
  return Promise.resolve(filtered);
};