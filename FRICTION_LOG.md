# 📝 Cloudflare Product Insights - Friction Log

---


### Insight #1
**Title:** D1 Database ID Discovery is Hidden

**Problem:** After creating a D1 database with `wrangler d1 create`, the database ID is shown once in the terminal output. If I miss it or close the terminal, there's no obvious way to find it again in the dashboard. I had to search through documentation and eventually found it buried in the D1 settings page. This wasted 15 minutes.

**Suggestion:** Show the database ID prominently in the D1 database overview page in the dashboard, with a copy button. Also, add a `wrangler d1 list` command that shows all databases with their IDs.

### Insight #2
**Title:** Workers AI Model Selection Lacks Guidance

**Problem:** The Workers AI documentation lists 50+ models but doesn't provide clear guidance on which model to use for different use cases. For text analysis, should I use Llama, Mistral, or something else? What are the tradeoffs? I had to experiment with several models before finding one that worked well.

**Suggestion:** Add a "Model Selection Guide" page that recommends models by use case (summarization, sentiment analysis, code generation, etc.) with example prompts and expected performance characteristics.

### Insight #3
**Title:** Wrangler Dev Local Mode D1 Limitations Unclear

**Problem:** When running `wrangler dev --local`, D1 bindings don't work, but the error message just says "binding not found" without explaining that local mode doesn't support D1. I spent 20 minutes debugging before finding a GitHub issue that explained this limitation.

**Suggestion:** When D1 bindings fail in local mode, show a helpful error: "D1 bindings are not available in --local mode. Use `wrangler dev` without --local flag to test with remote D1, or use --persist flag to simulate D1 locally."

### Insight #4
**Title:** Cannot read property 'prepare' of undefined

**Problem:** D1 binding not working - check wrangler.toml

**Suggestion:** Make sure to have [[d1_databases]] section
