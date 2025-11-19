The Bun dev server is always running. Ask for logs if needed.

# Development Tips & Lessons Learned

This is an Astro project using Bun runtime, Google Gemini AI, and Semantic Scholar API to provide a research paper search interface. Below are patterns, best practices, and lessons learned during development. Most pages are server-side rendered for SEO and performance. Deployed to fly.io cloud with CLI and Docker. We are NOT using page transitions- only SSR SPA.

## TIP for testing
- To access search directly, start testing from the search result query url. Example: http://localhost:4321/search?q=tvs%2Boled-tv%2Boled-gaming

## AI Integration Best Practices

### Gemini AI Structured Output
- **Use `responseSchema` and `responseMimeType: "application/json"`** for reliable JSON parsing from AI responses
- **Define TypeScript interfaces** that match the responseSchema exactly for type safety
- **Handle AI hallucinations** by constraining responses to PubMed-only articles with specific prompts
- **Fallback error handling** when AI returns malformed JSON

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
- **Import order matters** in Astro frontmatter - BaseLayout imports must come first

### API Route Patterns
- **GET/POST duality** in Astro API routes for flexibility
- **Cookie-based user data** persistence using custom cookie serialization functions
- **Configurable limits** with environment variables (`DEFAULT_SEARCH_LIMIT`, `MAX_SEARCH_LIMIT`)

## Debugging & Development Workflow

### Environment Setup
- **environment variables** needed: `GEMINI_API_KEY`
- **Test providers individually** before integration using direct API calls
- **Cache debugging** by inspecting SQLite database directly with Bun scripts

### Error Patterns to Watch For
- **Variable scoping issues** in Astro frontmatter when using try/catch blocks
- **Import path resolution** failures - ensure `@/` aliases are configured correctly

## Tool-Specific Insights

### Development Tools
- **Bun runtime** provides excellent SQLite integration and fast development server
- **Astro dev server** with hot reload supports server-side rendering debugging. Server does not need restart on code changes. Assume dev server is always running.
- **Simple Browser** integration in VS Code allows quick bowser UI testing

## Production Considerations

## Code Organization Tips

Keep code modular and maintainable. Be critical to make code simple, concise, using modern standards, and avoid over-engineering. Split very large files into smaller focused modules.

### File Structure Benefits
- **Separate provider modules** (`geminiDataProvider.ts`) enable independent testing
- **Centralized configuration** in main search module with environment variable fallbacks

### Type Safety
- **Strict TypeScript** catches integration issues early
- **Runtime validation** of AI responses prevents malformed data from breaking the UI

# Frontend
- DO not use setTimeout for UI state management. Keep code short, concise, and easy to read.