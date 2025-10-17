# FavorFind Cancer Research Platform

An advanced knowledge discovery platform designed for oncology professionals to search, discover, and organize the latest cancer research, clinical trials, and treatment guidelines.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
SEMANTIC_SCHOLAR_API=your_api_key_here
```

### Semantic Scholar API

The platform uses the Semantic Scholar API to search for academic papers and research articles. 

- **API Documentation**: https://api.semanticscholar.org/api-docs/
- **Paper Search Endpoint**: Used for retrieving relevant research papers based on user queries
- **Rate Limits**: Please refer to Semantic Scholar's API documentation for current rate limits
- **API Key**: Required for enhanced rate limits and access to additional features

## Development

```bash
npm install
npm run dev
```

## Features

- Unified search interface for cancer medical literature
- Real-time search results (powered by Semantic Scholar and other APIs)
- Search history persistence (localStorage)
- Personal library for saving articles
- Professional medical interface design
- No authentication required - immediate access