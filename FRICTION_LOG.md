# 📝 Cloudflare Product Insights - Friction Log Template

Use this template to document your experience building with Cloudflare. Aim for 3-5 insights.

---

## Insight #1
### Title: [Concise name of the issue]

### Problem:
[Describe what happened or what you noticed. Was it a technical bug, a confusing UI element, or a gap in the documentation? How did it slow you down?]

### Suggestion:
[As a PM, how would you fix this? Is it a UI change, a new documentation section, a better error message, or a completely new feature?]

---

## Insight #2
### Title: [Concise name of the issue]

### Problem:
[Describe what happened or what you noticed. Was it a technical bug, a confusing UI element, or a gap in the documentation? How did it slow you down?]

### Suggestion:
[As a PM, how would you fix this? Is it a UI change, a new documentation section, a better error message, or a completely new feature?]

---

## Insight #3
### Title: [Concise name of the issue]

### Problem:
[Describe what happened or what you noticed. Was it a technical bug, a confusing UI element, or a gap in the documentation? How did it slow you down?]

### Suggestion:
[As a PM, how would you fix this? Is it a UI change, a new documentation section, a better error message, or a completely new feature?]

---

## Insight #4 (Optional)
### Title: [Concise name of the issue]

### Problem:
[Describe what happened or what you noticed. Was it a technical bug, a confusing UI element, or a gap in the documentation? How did it slow you down?]

### Suggestion:
[As a PM, how would you fix this? Is it a UI change, a new documentation section, a better error message, or a completely new feature?]

---

## Insight #5 (Optional)
### Title: [Concise name of the issue]

### Problem:
[Describe what happened or what you noticed. Was it a technical bug, a confusing UI element, or a gap in the documentation? How did it slow you down?]

### Suggestion:
[As a PM, how would you fix this? Is it a UI change, a new documentation section, a better error message, or a completely new feature?]

---

## 💡 Tips for Writing Good Insights

### Good Problem Descriptions:
- ✅ "The D1 migration command failed with error code D1_5001, but the docs don't explain what this code means"
- ✅ "I couldn't find where to view my Worker's logs in the dashboard. Took 10 minutes of clicking around"
- ✅ "The wrangler.toml documentation shows TOML format but the CLI generates JSONC format, causing confusion"

### Bad Problem Descriptions:
- ❌ "The docs are confusing" (too vague)
- ❌ "It didn't work" (not specific enough)
- ❌ "The UI is bad" (no details about what's wrong)

### Good Suggestions:
- ✅ "Add a table of D1 error codes to the docs with explanations and fix suggestions"
- ✅ "Add a 'View Logs' button directly on the Worker overview page"
- ✅ "Update CLI to generate .toml files to match docs, or update docs to show .jsonc examples"

### Bad Suggestions:
- ❌ "Fix it" (not actionable)
- ❌ "Make it better" (too vague)
- ❌ "Read my mind" (unhelpful)

---

## 🎯 Areas to Pay Attention To

As you build, watch for friction in these areas:

1. **Onboarding & Setup:**
   - Was `wrangler login` straightforward?
   - Did you understand how to create a D1 database?
   - Were the CLI commands intuitive?

2. **Documentation:**
   - Could you find what you needed?
   - Were code examples accurate and complete?
   - Were there gaps or outdated info?

3. **UI/UX:**
   - Was the dashboard easy to navigate?
   - Were settings easy to find?
   - Did you understand what each page does?

4. **Error Messages:**
   - Were errors clear and actionable?
   - Did they tell you how to fix the problem?
   - Were error codes documented?

5. **Developer Experience:**
   - How was local development?
   - Was deployment smooth?
   - Did hot reloading work well?

---

## 📋 Example Insights (For Reference)

### Example Insight #1
**Title:** D1 Database ID Discovery is Hidden

**Problem:** After creating a D1 database with `wrangler d1 create`, the database ID is shown once in the terminal output. If I miss it or close the terminal, there's no obvious way to find it again in the dashboard. I had to search through documentation and eventually found it buried in the D1 settings page. This wasted 15 minutes.

**Suggestion:** Show the database ID prominently in the D1 database overview page in the dashboard, with a copy button. Also, add a `wrangler d1 list` command that shows all databases with their IDs.

### Example Insight #2
**Title:** Workers AI Model Selection Lacks Guidance

**Problem:** The Workers AI documentation lists 50+ models but doesn't provide clear guidance on which model to use for different use cases. For text analysis, should I use Llama, Mistral, or something else? What are the tradeoffs? I had to experiment with several models before finding one that worked well.

**Suggestion:** Add a "Model Selection Guide" page that recommends models by use case (summarization, sentiment analysis, code generation, etc.) with example prompts and expected performance characteristics.

### Example Insight #3
**Title:** Wrangler Dev Local Mode D1 Limitations Unclear

**Problem:** When running `wrangler dev --local`, D1 bindings don't work, but the error message just says "binding not found" without explaining that local mode doesn't support D1. I spent 20 minutes debugging before finding a GitHub issue that explained this limitation.

**Suggestion:** When D1 bindings fail in local mode, show a helpful error: "D1 bindings are not available in --local mode. Use `wrangler dev` without --local flag to test with remote D1, or use --persist flag to simulate D1 locally."
