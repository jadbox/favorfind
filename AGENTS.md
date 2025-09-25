# Development Tips & Lessons Learned

This is an Astro project using Bun runtime, Google Gemini AI, and Semantic Scholar API to provide a research paper search interface. Below are patterns, best practices, and lessons learned during development. Most pages are server-side rendered for SEO and performance. Deployed to fly.io cloud with CLI and Docker.

## Modular Architecture Patterns

### Data Provider Interface Pattern
- **Interface-based provider system** enables easy switching between search backends (Semantic Scholar, Gemini AI, etc.)
- **Single `DataProvider` interface** with `fetchPapers(query: string, limit: number): Promise<SemanticScholarPaper[]>` method
- **Provider selection via environment variables** (`SEARCH_PROVIDER=gemini|semantic-scholar`) with fallback defaults
- **Benefit**: Add new search providers without changing core search logic

## AI Integration Best Practices

### Gemini AI Structured Output
- **Use `responseSchema` and `responseMimeType: "application/json"`** for reliable JSON parsing from AI responses
- **Define TypeScript interfaces** that match the responseSchema exactly for type safety
- **Handle AI hallucinations** by constraining responses to PubMed-only articles with specific prompts
- **Fallback error handling** when AI returns malformed JSON

### API Key Management
- **Environment variables** for API keys (`GEMINI_API_KEY`, `SEMANTIC_SCHOLAR_API_KEY`)
- **Early validation** in provider constructors to fail fast if keys are missing
- **Never log API keys** in console output or error messages

## Caching Strategies

### Multi-Key SQLite Caching
- **Composite cache keys**: `provider:query:limit:page` format prevents cache collisions between providers
- **24-hour TTL** with automatic cleanup using `setInterval(cleanupCache, 60 * 60 * 1000)`
- **Database migrations** required when changing cache key structure - use ALTER TABLE or recreate tables
- **Cache statistics** function for monitoring hit rates and expired entries

### Bun SQLite Specifics
- **Built-in SQLite** with `new Database(path)` - no external dependencies
- **Parameterized queries** prevent SQL injection: `db.run("SELECT * FROM table WHERE id = ?", [id])`
- **Schema inspection** with `PRAGMA table_info(table_name)` for debugging

## Framework-Specific Patterns

### Astro Server-Side Rendering
- **Server-side search rendering** improves SEO and initial page load performance
- **Frontmatter variable scoping** issues: declare variables before using them in try/catch blocks
- **Import order matters** in Astro frontmatter - BaseLayout imports must come first
- **Error handling** in server-side rendering prevents broken pages

### API Route Patterns
- **GET/POST duality** in Astro API routes for flexibility
- **Cookie-based user data** persistence using custom cookie serialization functions
- **Configurable limits** with environment variables (`DEFAULT_SEARCH_LIMIT`, `MAX_SEARCH_LIMIT`)

## Debugging & Development Workflow

### Environment Setup
- **Multiple environment variables** needed: `SEARCH_PROVIDER`, `GEMINI_API_KEY`, `DEFAULT_SEARCH_LIMIT`, `MAX_SEARCH_LIMIT`
- **Test providers individually** before integration using direct API calls
- **Cache debugging** by inspecting SQLite database directly with Bun scripts

### Error Patterns to Watch For
- **"no such column" SQLite errors** indicate schema mismatches - check table structure
- **Variable scoping issues** in Astro frontmatter when using try/catch blocks
- **Import path resolution** failures - ensure `@/` aliases are configured correctly
- **AI API timeouts** - implement retry logic for production use

## Tool-Specific Insights

### Google GenAI SDK
- **Version 1.20.0** tested and working with structured output
- **Model selection**: `gemini-2.5-flash` provides good balance of speed and accuracy
- **Temperature control**: Default settings work well for factual search tasks

### Development Tools
- **Bun runtime** provides excellent SQLite integration and fast development server
- **Astro dev server** with hot reload supports server-side rendering debugging
- **Simple Browser** integration in VS Code for quick UI testing without leaving editor

## Production Considerations

### Scalability
- **Configurable article limits** prevent API abuse and control costs
- **Caching reduces API calls** significantly for repeated queries
- **Provider abstraction** allows A/B testing different search backends

### Monitoring
- **Cache hit/miss logging** helps optimize cache strategies
- **Provider usage logging** tracks which search backends are most effective
- **Error rate monitoring** for API reliability assessment

## Code Organization Tips

### File Structure Benefits
- **Separate provider modules** (`semanticScholarDataProvider.ts`, `geminiDataProvider.ts`) enable independent testing
- **Centralized configuration** in main search module with environment variable fallbacks
- **Mapper functions** (`semanticScholarMapper.ts`) isolate data transformation logic

### Type Safety
- **Shared interfaces** (`SemanticScholarPaper`) ensure consistency across providers
- **Strict TypeScript** catches integration issues early
- **Runtime validation** of AI responses prevents malformed data from breaking the UI</content>
<filePath>/home/jdunlap/github/medeligo/medeligo-cancer-net/AGENTS.md