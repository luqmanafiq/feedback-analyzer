# 🚀 Quick Reference Guide

## Essential Commands

```bash
# Initial Setup
npm install                          # Install dependencies
wrangler login                       # Login to Cloudflare
wrangler d1 create feedback-db       # Create database

# Database Management
wrangler d1 execute feedback-db --file=./schema.sql    # Create tables
wrangler d1 execute feedback-db --file=./seed.sql      # Load mock data
wrangler d1 execute feedback-db --command="SELECT * FROM feedback LIMIT 5"  # Query DB

# Development
npm run dev                          # Start local server (online mode with D1)
wrangler dev --local                 # Local mode (without D1)
wrangler dev --persist               # Persist data between sessions

# Deployment
npm run deploy                       # Deploy to production
wrangler publish                     # Alternative deploy command

# Debugging
wrangler tail                        # Stream live logs
wrangler d1 execute feedback-db --command="SELECT COUNT(*) FROM feedback"  # Check data
```

## Project Structure

```
feedback-analyzer/
├── src/
│   └── index.js              # Main Worker code (API + HTML)
├── schema.sql                # D1 database schema
├── seed.sql                  # Mock feedback data
├── wrangler.toml            # Cloudflare config
├── package.json             # Node dependencies
├── README.md                # Project documentation
├── DEPLOYMENT_CHECKLIST.md  # Step-by-step deployment
└── FRICTION_LOG.md          # Your insights template
```

## Key URLs

- **Dashboard:** https://dash.cloudflare.com
- **Workers Docs:** https://developers.cloudflare.com/workers/
- **D1 Docs:** https://developers.cloudflare.com/d1/
- **Workers AI Docs:** https://developers.cloudflare.com/workers-ai/
- **Discord:** https://discord.gg/cloudflaredev

## Cloudflare Products Used

### 1. Workers (Core Platform)
- **Purpose:** Serverless compute, runs your code
- **Usage:** Hosts entire application (API + UI)
- **Billing:** 100k requests/day free

### 2. D1 Database
- **Purpose:** Serverless SQL database
- **Usage:** Stores feedback and analysis results
- **Billing:** 5M reads/month free
- **Binding name:** `DB`

### 3. Workers AI
- **Purpose:** Run AI models at the edge
- **Usage:** Sentiment analysis + theme extraction
- **Model:** Llama 3.1 8B Instruct
- **Billing:** 10k neurons/day free
- **Binding name:** `AI`

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Dashboard UI |
| GET | /api/feedback | Get all feedback |
| POST | /api/feedback | Submit new feedback |
| POST | /api/analyze | Run AI analysis |
| GET | /api/insights | Get latest analysis |

## Common Issues & Quick Fixes

### ❌ "Database not found"
```bash
# Check your database ID is correct in wrangler.toml
wrangler d1 list  # Get your database ID
```

### ❌ "Cannot read property 'prepare' of undefined"
```bash
# D1 binding not working - check wrangler.toml
# Make sure you have [[d1_databases]] section
```

### ❌ "Worker exceeded CPU time limit"
```bash
# Workers AI taking too long
# Solution: Reduce feedback batch size or optimize prompt
```

### ❌ "Wrangler command not found"
```bash
npm install -g wrangler
# or
npx wrangler <command>
```

## Testing Your Deployment

After deploying, test these scenarios:

1. **Submit Feedback:**
   - Fill form with different sources
   - Verify data appears in "Recent Feedback"

2. **Run Analysis:**
   - Click "Run AI Analysis"
   - Check sentiment visualization
   - Verify themes appear with priorities

3. **Data Persistence:**
   - Refresh page
   - Click "Load Latest Insights"
   - Verify previous analysis loads

## Performance Tips

1. **Optimize AI Prompts:**
   - Keep prompts concise
   - Request structured JSON output
   - Limit input length

2. **Database Queries:**
   - Use LIMIT on queries
   - Add indexes for common filters
   - Cache frequent queries in KV

3. **Response Times:**
   - Workers: <50ms typical
   - D1 Queries: <20ms typical
   - Workers AI: 1-3s typical

## Customization Ideas

### Easy Additions (5-10 min each):
- [ ] Add date range filter for feedback
- [ ] Export analysis as JSON
- [ ] Add more feedback sources
- [ ] Customize color scheme
- [ ] Add feedback search

### Medium Additions (30-60 min each):
- [ ] Implement KV caching for analysis
- [ ] Add scheduled Workflows for daily reports
- [ ] Integrate with Slack/Discord webhooks
- [ ] Add user authentication
- [ ] Implement pagination

### Advanced Additions (2+ hours):
- [ ] Use AI Search (RAG) for semantic feedback search
- [ ] Multi-language sentiment analysis
- [ ] Historical trend visualization
- [ ] Real-time feedback streaming
- [ ] Advanced filtering and segmentation

## For the Assignment Submission

### Required Deliverables:

1. **PDF Document containing:**
   - Project Links (live URL + GitHub)
   - Architecture overview (screenshot of bindings)
   - 3-5 Friction Log insights
   - Optional: Vibe-coding context

2. **Live Demo:**
   - Must be accessible at your Workers URL
   - Should have data (use seed.sql)
   - All features should work

3. **GitHub Repository:**
   - Clean, documented code
   - README with setup instructions
   - Include wrangler.toml (remove sensitive data)

### Submission Checklist:
- [ ] Project deployed and accessible
- [ ] GitHub repo is public
- [ ] README includes architecture explanation
- [ ] Friction log has 3-5 quality insights
- [ ] Screenshot of Workers Bindings page
- [ ] PDF formatted professionally
- [ ] Links tested and working
- [ ] Submitted before Feb 1, 2026 11:59 PM GMT

## Time Management

Recommended 3-4 hour breakdown:
- **Hour 1:** Setup + docs reading
  - Install Wrangler
  - Create accounts
  - Read Workers and D1 docs
  
- **Hours 2-3:** Building
  - Set up project structure
  - Implement core features
  - Test locally
  - Deploy to production
  
- **Hour 4:** Documentation + Friction Log
  - Write friction insights
  - Take screenshots
  - Create PDF
  - Submit

## Pro Tips

1. **Use the starter code provided** - don't build from scratch
2. **Seed mock data immediately** - saves time testing
3. **Deploy early, deploy often** - catch issues fast
4. **Document friction as you go** - don't wait until the end
5. **Keep it simple** - a working prototype beats a broken feature-complete app
6. **Screenshot everything** - you'll need it for the PDF

## Getting Help

- **Docs:** https://developers.cloudflare.com
- **Discord:** https://discord.gg/cloudflaredev
- **Assignment Issues:** pminternassignment@cloudflare.com

Good luck! 🚀
