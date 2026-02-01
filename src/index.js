/**
 * Feedback Analyzer - Cloudflare Workers Application
 * Aggregates and analyzes customer feedback using AI
 */

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		
		// CORS headers for development
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Route handling
		if (url.pathname === '/' && request.method === 'GET') {
			return new Response(getHTML(), {
				headers: { 
					'Content-Type': 'text/html',
					...corsHeaders 
				},
			});
		}

		if (url.pathname === '/api/feedback' && request.method === 'GET') {
			return handleGetFeedback(env, corsHeaders);
		}

		if (url.pathname === '/api/feedback' && request.method === 'POST') {
			return handleSubmitFeedback(request, env, corsHeaders);
		}

		if (url.pathname === '/api/analyze' && request.method === 'POST') {
			return handleAnalyze(request, env, corsHeaders);
		}

		if (url.pathname === '/api/insights' && request.method === 'GET') {
			return handleGetInsights(env, corsHeaders);
		}

		return new Response('Not Found', { status: 404 });
	},
};

/**
 * Get all feedback from D1 database
 */
async function handleGetFeedback(env, corsHeaders) {
	try {
		const { results } = await env.DB.prepare(
			'SELECT * FROM feedback ORDER BY created_at DESC LIMIT 100'
		).all();

		return new Response(JSON.stringify(results), {
			headers: { 
				'Content-Type': 'application/json',
				...corsHeaders 
			},
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 
				'Content-Type': 'application/json',
				...corsHeaders 
			},
		});
	}
}

/**
 * Submit new feedback to D1 database
 */
async function handleSubmitFeedback(request, env, corsHeaders) {
	try {
		const body = await request.json();
		const { source, content, user_id } = body;

		if (!source || !content) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), {
				status: 400,
				headers: { 
					'Content-Type': 'application/json',
					...corsHeaders 
				},
			});
		}

		const result = await env.DB.prepare(
			'INSERT INTO feedback (source, content, user_id, created_at) VALUES (?, ?, ?, ?)'
		).bind(source, content, user_id || 'anonymous', new Date().toISOString()).run();

		return new Response(JSON.stringify({ 
			success: true, 
			id: result.meta.last_row_id 
		}), {
			headers: { 
				'Content-Type': 'application/json',
				...corsHeaders 
			},
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 
				'Content-Type': 'application/json',
				...corsHeaders 
			},
		});
	}
}

/**
 * Analyze feedback using Workers AI
 */
async function handleAnalyze(request, env, corsHeaders) {
	try {
		const { feedbackIds } = await request.json();
		
		// Get feedback from database
		let feedbackList;
		if (feedbackIds && feedbackIds.length > 0) {
			const placeholders = feedbackIds.map(() => '?').join(',');
			const { results } = await env.DB.prepare(
				`SELECT * FROM feedback WHERE id IN (${placeholders})`
			).bind(...feedbackIds).all();
			feedbackList = results;
		} else {
			const { results } = await env.DB.prepare(
				'SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50'
			).all();
			feedbackList = results;
		}

		if (feedbackList.length === 0) {
			return new Response(JSON.stringify({ error: 'No feedback to analyze' }), {
				status: 400,
				headers: { 
					'Content-Type': 'application/json',
					...corsHeaders 
				},
			});
		}

		// Prepare feedback for AI analysis
		const feedbackText = feedbackList.map((f, i) => 
			`${i + 1}. [${f.source}] ${f.content}`
		).join('\n\n');

		// Use Workers AI to analyze sentiment and extract themes
		const prompt = `Analyze the following customer feedback and provide:
1. Overall sentiment (positive, negative, neutral) with percentages
2. Top 3-5 recurring themes or issues
3. Priority level (high, medium, low) for each theme
4. Suggested actions

Feedback:
${feedbackText}

Provide the response in JSON format with keys: sentiment, themes (array with theme, priority, count, description), suggestions (array).`;

		const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
			messages: [
				{ role: 'system', content: 'You are a product manager analyzing customer feedback. Provide concise, actionable insights in JSON format.' },
				{ role: 'user', content: prompt }
			],
			max_tokens: 1024,
		});

		// Parse AI response
		let analysis;
		try {
			// Extract JSON from the response
			const responseText = aiResponse.response || JSON.stringify(aiResponse);
			const jsonMatch = responseText.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				analysis = JSON.parse(jsonMatch[0]);
			} else {
				analysis = {
					sentiment: { positive: 33, negative: 33, neutral: 34 },
					themes: [
						{ theme: 'General Feedback', priority: 'medium', count: feedbackList.length, description: 'Various feedback items' }
					],
					suggestions: ['Review individual feedback items for detailed insights']
				};
			}
		} catch (parseError) {
			// Fallback analysis
			analysis = {
				sentiment: { positive: 33, negative: 33, neutral: 34 },
				themes: [
					{ theme: 'General Feedback', priority: 'medium', count: feedbackList.length, description: 'Various feedback items' }
				],
				suggestions: ['Review individual feedback items for detailed insights'],
				raw_response: aiResponse
			};
		}

		// Store analysis results
		await env.DB.prepare(
			'INSERT INTO analysis_results (analysis_data, feedback_count, created_at) VALUES (?, ?, ?)'
		).bind(JSON.stringify(analysis), feedbackList.length, new Date().toISOString()).run();

		return new Response(JSON.stringify({
			success: true,
			analysis,
			feedback_analyzed: feedbackList.length
		}), {
			headers: { 
				'Content-Type': 'application/json',
				...corsHeaders 
			},
		});
	} catch (error) {
		return new Response(JSON.stringify({ 
			error: error.message,
			stack: error.stack 
		}), {
			status: 500,
			headers: { 
				'Content-Type': 'application/json',
				...corsHeaders 
			},
		});
	}
}

/**
 * Get latest analysis insights
 */
async function handleGetInsights(env, corsHeaders) {
	try {
		const { results } = await env.DB.prepare(
			'SELECT * FROM analysis_results ORDER BY created_at DESC LIMIT 1'
		).all();

		if (results.length === 0) {
			return new Response(JSON.stringify({ error: 'No analysis available' }), {
				status: 404,
				headers: { 
					'Content-Type': 'application/json',
					...corsHeaders 
				},
			});
		}

		const latest = results[0];
		return new Response(JSON.stringify({
			analysis: JSON.parse(latest.analysis_data),
			feedback_count: latest.feedback_count,
			created_at: latest.created_at
		}), {
			headers: { 
				'Content-Type': 'application/json',
				...corsHeaders 
			},
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 
				'Content-Type': 'application/json',
				...corsHeaders 
			},
		});
	}
}

/**
 * HTML Dashboard
 */
function getHTML() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Feedback Analyzer - Cloudflare PM Assignment</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			min-height: 100vh;
			padding: 20px;
		}
		.container {
			max-width: 1200px;
			margin: 0 auto;
		}
		.header {
			background: white;
			padding: 30px;
			border-radius: 15px;
			box-shadow: 0 10px 30px rgba(0,0,0,0.2);
			margin-bottom: 30px;
		}
		h1 {
			color: #333;
			font-size: 2.5em;
			margin-bottom: 10px;
		}
		.subtitle {
			color: #666;
			font-size: 1.1em;
		}
		.grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
			gap: 20px;
			margin-bottom: 30px;
		}
		.card {
			background: white;
			padding: 25px;
			border-radius: 15px;
			box-shadow: 0 10px 30px rgba(0,0,0,0.2);
		}
		.card h2 {
			color: #333;
			margin-bottom: 20px;
			padding-bottom: 10px;
			border-bottom: 3px solid #667eea;
		}
		.btn {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border: none;
			padding: 12px 30px;
			border-radius: 8px;
			cursor: pointer;
			font-size: 1em;
			font-weight: bold;
			transition: transform 0.2s;
		}
		.btn:hover {
			transform: translateY(-2px);
		}
		.btn:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
		.feedback-form {
			display: flex;
			flex-direction: column;
			gap: 15px;
		}
		select, textarea, input {
			padding: 12px;
			border: 2px solid #e0e0e0;
			border-radius: 8px;
			font-size: 1em;
			font-family: inherit;
		}
		textarea {
			resize: vertical;
			min-height: 100px;
		}
		.feedback-list {
			max-height: 400px;
			overflow-y: auto;
		}
		.feedback-item {
			background: #f5f5f5;
			padding: 15px;
			border-radius: 8px;
			margin-bottom: 10px;
			border-left: 4px solid #667eea;
		}
		.feedback-source {
			font-weight: bold;
			color: #667eea;
			font-size: 0.9em;
			margin-bottom: 5px;
		}
		.feedback-content {
			color: #333;
			line-height: 1.5;
		}
		.feedback-meta {
			color: #999;
			font-size: 0.85em;
			margin-top: 8px;
		}
		.analysis-section {
			margin-top: 20px;
		}
		.sentiment-bar {
			display: flex;
			height: 40px;
			border-radius: 8px;
			overflow: hidden;
			margin: 15px 0;
		}
		.sentiment-positive { background: #4ade80; }
		.sentiment-neutral { background: #fbbf24; }
		.sentiment-negative { background: #f87171; }
		.theme-item {
			background: #f5f5f5;
			padding: 15px;
			border-radius: 8px;
			margin-bottom: 10px;
		}
		.priority-high { border-left: 4px solid #f87171; }
		.priority-medium { border-left: 4px solid #fbbf24; }
		.priority-low { border-left: 4px solid #4ade80; }
		.theme-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;
		}
		.theme-title {
			font-weight: bold;
			color: #333;
		}
		.theme-badge {
			padding: 4px 12px;
			border-radius: 12px;
			font-size: 0.85em;
			font-weight: bold;
		}
		.badge-high { background: #fee2e2; color: #dc2626; }
		.badge-medium { background: #fef3c7; color: #d97706; }
		.badge-low { background: #dcfce7; color: #16a34a; }
		.loading {
			text-align: center;
			padding: 20px;
			color: #667eea;
			font-weight: bold;
		}
		.error {
			background: #fee2e2;
			color: #dc2626;
			padding: 15px;
			border-radius: 8px;
			margin: 10px 0;
		}
		.success {
			background: #dcfce7;
			color: #16a34a;
			padding: 15px;
			border-radius: 8px;
			margin: 10px 0;
		}
		.stats {
			display: flex;
			gap: 15px;
			margin-top: 15px;
		}
		.stat-box {
			flex: 1;
			background: #f5f5f5;
			padding: 15px;
			border-radius: 8px;
			text-align: center;
		}
		.stat-number {
			font-size: 2em;
			font-weight: bold;
			color: #667eea;
		}
		.stat-label {
			color: #666;
			font-size: 0.9em;
			margin-top: 5px;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🎯 Feedback Analyzer</h1>
			<p class="subtitle">Cloudflare Product Manager Internship Assignment - Real-time Customer Feedback Analysis</p>
		</div>

		<div class="grid">
			<!-- Submit Feedback -->
			<div class="card">
				<h2>📝 Submit Feedback</h2>
				<form class="feedback-form" id="feedbackForm">
					<select id="source" required>
						<option value="">Select Source...</option>
						<option value="Support Ticket">Support Ticket</option>
						<option value="Discord">Discord</option>
						<option value="GitHub">GitHub Issues</option>
						<option value="Twitter">Twitter/X</option>
						<option value="Email">Email</option>
						<option value="Community Forum">Community Forum</option>
					</select>
					<textarea id="content" placeholder="Enter feedback content..." required></textarea>
					<input type="text" id="userId" placeholder="User ID (optional)">
					<button type="submit" class="btn">Submit Feedback</button>
				</form>
				<div id="submitMessage"></div>
			</div>

			<!-- Recent Feedback -->
			<div class="card">
				<h2>💬 Recent Feedback</h2>
				<button class="btn" onclick="loadFeedback()" style="margin-bottom: 15px;">Refresh</button>
				<div class="feedback-list" id="feedbackList">
					<div class="loading">Loading feedback...</div>
				</div>
			</div>
		</div>

		<!-- Analysis Dashboard -->
		<div class="card">
			<h2>📊 Analysis Dashboard</h2>
			<button class="btn" onclick="runAnalysis()" id="analyzeBtn">Run AI Analysis</button>
			<button class="btn" onclick="loadInsights()" style="margin-left: 10px;">Load Latest Insights</button>
			<div id="analysisResults"></div>
		</div>
	</div>

	<script>
		// Load feedback on page load
		window.addEventListener('DOMContentLoaded', () => {
			loadFeedback();
			loadInsights();
		});

		// Submit feedback form
		document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
			e.preventDefault();
			const submitMessage = document.getElementById('submitMessage');
			
			const data = {
				source: document.getElementById('source').value,
				content: document.getElementById('content').value,
				user_id: document.getElementById('userId').value || 'anonymous'
			};

			try {
				const response = await fetch('/api/feedback', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data)
				});

				const result = await response.json();
				
				if (result.success) {
					submitMessage.innerHTML = '<div class="success">Feedback submitted successfully!</div>';
					document.getElementById('feedbackForm').reset();
					setTimeout(() => {
						submitMessage.innerHTML = '';
						loadFeedback();
					}, 2000);
				} else {
					submitMessage.innerHTML = '<div class="error">Error: ' + result.error + '</div>';
				}
			} catch (error) {
				submitMessage.innerHTML = '<div class="error">Error submitting feedback: ' + error.message + '</div>';
			}
		});

		// Load feedback
		async function loadFeedback() {
			const feedbackList = document.getElementById('feedbackList');
			feedbackList.innerHTML = '<div class="loading">Loading feedback...</div>';

			try {
				const response = await fetch('/api/feedback');
				const data = await response.json();

				if (data.length === 0) {
					feedbackList.innerHTML = '<p style="color: #999;">No feedback yet. Submit some to get started!</p>';
					return;
				}

				feedbackList.innerHTML = data.map(item => \`
					<div class="feedback-item">
						<div class="feedback-source">\${item.source}</div>
						<div class="feedback-content">\${item.content}</div>
						<div class="feedback-meta">User: \${item.user_id} | \${new Date(item.created_at).toLocaleString()}</div>
					</div>
				\`).join('');
			} catch (error) {
				feedbackList.innerHTML = '<div class="error">Error loading feedback: ' + error.message + '</div>';
			}
		}

		// Run analysis
		async function runAnalysis() {
			const btn = document.getElementById('analyzeBtn');
			const results = document.getElementById('analysisResults');
			
			btn.disabled = true;
			btn.textContent = 'Analyzing...';
			results.innerHTML = '<div class="loading">Running AI analysis on feedback...</div>';

			try {
				const response = await fetch('/api/analyze', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({})
				});

				const data = await response.json();

				if (data.success) {
					displayAnalysis(data.analysis, data.feedback_analyzed);
				} else {
					results.innerHTML = '<div class="error">Error: ' + data.error + '</div>';
				}
			} catch (error) {
				results.innerHTML = '<div class="error">Error running analysis: ' + error.message + '</div>';
			} finally {
				btn.disabled = false;
				btn.textContent = 'Run AI Analysis';
			}
		}

		// Load latest insights
		async function loadInsights() {
			const results = document.getElementById('analysisResults');

			try {
				const response = await fetch('/api/insights');
				const data = await response.json();

				if (data.analysis) {
					displayAnalysis(data.analysis, data.feedback_count);
				}
			} catch (error) {
				// Silently fail if no insights available yet
			}
		}

		// Display analysis results
		function displayAnalysis(analysis, feedbackCount) {
			const results = document.getElementById('analysisResults');
			
			const sentiment = analysis.sentiment || { positive: 0, negative: 0, neutral: 0 };
			const themes = analysis.themes || [];
			const suggestions = analysis.suggestions || [];

			results.innerHTML = \`
				<div class="analysis-section">
					<div class="stats">
						<div class="stat-box">
							<div class="stat-number">\${feedbackCount}</div>
							<div class="stat-label">Items Analyzed</div>
						</div>
						<div class="stat-box">
							<div class="stat-number">\${themes.length}</div>
							<div class="stat-label">Themes Found</div>
						</div>
						<div class="stat-box">
							<div class="stat-number">\${suggestions.length}</div>
							<div class="stat-label">Suggestions</div>
						</div>
					</div>

					<h3 style="margin-top: 25px; margin-bottom: 15px; color: #333;">😊 Sentiment Analysis</h3>
					<div class="sentiment-bar">
						<div class="sentiment-positive" style="width: \${sentiment.positive || 0}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
							\${sentiment.positive || 0}% Positive
						</div>
						<div class="sentiment-neutral" style="width: \${sentiment.neutral || 0}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
							\${sentiment.neutral || 0}% Neutral
						</div>
						<div class="sentiment-negative" style="width: \${sentiment.negative || 0}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
							\${sentiment.negative || 0}% Negative
						</div>
					</div>

					<h3 style="margin-top: 25px; margin-bottom: 15px; color: #333;">🎯 Key Themes</h3>
					\${themes.map(theme => \`
						<div class="theme-item priority-\${theme.priority}">
							<div class="theme-header">
								<span class="theme-title">\${theme.theme}</span>
								<span class="theme-badge badge-\${theme.priority}">\${theme.priority.toUpperCase()}</span>
							</div>
							<p style="color: #666; margin-top: 8px;">\${theme.description}</p>
							<p style="color: #999; font-size: 0.9em; margin-top: 5px;">Mentioned \${theme.count} times</p>
						</div>
					\`).join('')}

					<h3 style="margin-top: 25px; margin-bottom: 15px; color: #333;">💡 Suggested Actions</h3>
					<ul style="padding-left: 20px; color: #333;">
						\${suggestions.map(s => \`<li style="margin-bottom: 10px; line-height: 1.6;">\${s}</li>\`).join('')}
					</ul>
				</div>
			\`;
		}
	</script>
</body>
</html>`;
}
