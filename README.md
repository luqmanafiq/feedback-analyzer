# 🎯 Feedback Analyzer - Cloudflare PM Internship Assignment

A real-time customer feedback aggregation and analysis tool built with Cloudflare Workers, D1 Database, and Workers AI.

## 📋 Overview

This tool helps Product Managers aggregate feedback from multiple sources (Support Tickets, Discord, GitHub, Twitter, Email, Community Forums) and uses AI to automatically:
- Analyze sentiment (positive, negative, neutral)
- Extract recurring themes and issues
- Prioritize feedback by urgency
- Generate actionable suggestions

## 🏗️ Architecture

### Cloudflare Products Used:

1. **Cloudflare Workers** - Serverless compute platform hosting the application
   - Handles HTTP routing and API endpoints
   - Serves the dashboard UI
   - Orchestrates data flow between services

2. **D1 Database** - Serverless SQL database
   - Stores customer feedback entries
   - Stores analysis results and insights
   - Fast queries with indexed columns

3. **Workers AI** - AI inference at the edge
   - Uses Llama 3.1 8B model for analysis
   - Performs sentiment analysis
   - Extracts themes and generates suggestions
   - Runs directly on Cloudflare's network (no external API calls)

### Data Flow:
```
User Submits Feedback → Worker API → D1 Database
                              ↓
User Requests Analysis → Worker fetches from D1 → Workers AI analyzes → Results stored in D1 → Dashboard displays insights
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Cloudflare account (free tier works!)
- Wrangler CLI

### 1. Install Dependencies
```bash
npm install
```

### 2. Create D1 Database
```bash
# Create the database
wrangler d1 create feedback-db

# This will output a database ID. Copy it and update wrangler.toml:
# database_id = "your-database-id-here"
```

### 3. Initialize Database Schema
```bash
# Create tables
wrangler d1 execute feedback-db --file=./schema.sql

# Seed with mock data (optional but recommended)
wrangler d1 execute feedback-db --file=./seed.sql
```

### 4. Test Locally
```bash
npm run dev
```
Open http://localhost:8787 in your browser

### 5. Deploy to Production
```bash
npm run deploy
```

You'll get a URL like: `https://feedback-analyzer.your-account.workers.dev`

## 📊 Features

### Dashboard Features:
- ✅ Submit new feedback from multiple sources
- ✅ View recent feedback in real-time
- ✅ Run AI-powered analysis with one click
- ✅ Visualize sentiment distribution
- ✅ See prioritized themes (High/Medium/Low)
- ✅ Get actionable suggestions for PMs

### API Endpoints:
- `GET /` - Dashboard UI
- `GET /api/feedback` - Retrieve all feedback
- `POST /api/feedback` - Submit new feedback
- `POST /api/analyze` - Run AI analysis on feedback
- `GET /api/insights` - Get latest analysis results

## 🎨 Key Technical Decisions

### Why D1 over KV?
- Structured data with relationships (feedback + analysis)
- SQL queries for filtering by date, source, etc.
- Better for aggregating and counting

### Why Workers AI?
- No external API dependencies (faster, more reliable)
- Runs at the edge (low latency globally)
- No API keys or rate limits to manage
- Cost-effective for high-volume analysis

### Why single-file HTML?
- Simplicity - entire dashboard in one Worker
- Fast loading - no separate asset requests
- Easy deployment - no build step required

## 🔧 Development Commands

```bash
# Start local development server
npm run dev

# Deploy to Cloudflare
npm run deploy

# Create D1 database
npm run db:create

# Initialize database schema
npm run db:init

# Seed mock data
npm run db:seed

# Query database directly
wrangler d1 execute feedback-db --command="SELECT * FROM feedback LIMIT 5"
```

## 📈 Scaling Considerations

For production use, consider:
1. **Add KV for caching** - Cache analysis results to reduce D1 queries
2. **Implement Workflows** - For scheduled daily/weekly analysis reports
3. **Add Analytics Engine** - Track usage metrics and performance
4. **Set up Queues** - Handle high-volume feedback submission
5. **Add AI Search (RAG)** - Enable semantic search across feedback

## 🛠️ Customization

### Adding New Feedback Sources:
Edit the `<select>` options in the HTML (line ~250)

### Changing AI Model:
Replace `@cf/meta/llama-3.1-8b-instruct` with another model from [Workers AI models](https://developers.cloudflare.com/workers-ai/models/)

### Modifying Analysis Prompt:
Edit the prompt in `handleAnalyze()` function (line ~137)

## 📝 Assignment Notes

**Time Spent:** ~3 hours
- 30 min: Planning architecture & reading docs
- 90 min: Building prototype
- 60 min: Testing, refinement, and documentation

**What I'd Add with More Time:**
- Scheduled analysis using Workflows
- Export to Slack/Discord integration
- User authentication
- Historical trend analysis
- Mobile-responsive improvements

## 🔗 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## 👨‍💻 Author

Built by Luqman Afiq for the Cloudflare Product Manager Internship (Summer 2026) assignment.

---

**Note:** This is a prototype for educational purposes. For production use, add proper error handling, authentication, rate limiting, and monitoring.
