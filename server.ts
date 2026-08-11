import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import cron from 'node-cron';
import { NewsDigest, ScheduleSettings, DeliveryLog, AgentLogMessage, RoboticsNewsItem } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize Google Gen AI client with GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// In-Memory Database / State
let scheduleSettings: ScheduleSettings = {
  enabled: true,
  scheduledTime: '09:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
  recipientEmail: 'sackm123@gmail.com',
  topics: [
    'Humanoids & Bipeds',
    'Warehouse & Logistics',
    'Medical & Surgical',
    'Autonomous & Drones',
    'AI & Foundation Models',
    'Research & Breakthroughs'
  ],
  tone: 'Executive Brief',
  includeGroundingLinks: true,
  customPromptKeywords: 'Tesla Optimus, Figure AI, Boston Dynamics, Unitree, ROS 2, Embodied AI, Surgical Robots',
  autoSendEnabled: true
};

let latestDigest: NewsDigest | null = null;
let deliveryLogs: DeliveryLog[] = [];
let agentLogs: AgentLogMessage[] = [];
let lastAuthToken: string | null = null; // Store token for background scheduled runner if available

function addAgentLog(level: 'info' | 'success' | 'warn' | 'error', message: string) {
  const log: AgentLogMessage = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    level,
    message
  };
  agentLogs.unshift(log);
  if (agentLogs.length > 100) agentLogs.pop();
  console.log(`[${log.level.toUpperCase()}] ${log.message}`);
}

addAgentLog('info', 'Robotics News Morning 9 AM Agent initialized.');

// Helper: Build HTML Email Template
function buildHtmlEmailDigest(digestTitle: string, dateStr: string, articles: RoboticsNewsItem[], keyTakeaways: string[], headlineSummary: string): string {
  const articlesHtml = articles.map((art) => `
    <div style="margin-bottom: 24px; padding: 20px; background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: #2563eb; background-color: #dbeafe; padding: 3px 8px; border-radius: 12px; text-transform: uppercase;">${art.category}</span>
        <span style="font-size: 12px; color: #64748b;">${art.publishedDate || 'Today'} &bull; ${art.source || 'News Source'}</span>
      </div>
      <h3 style="margin: 8px 0 10px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${art.title}
      </h3>
      <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #334155;">
        ${art.summary}
      </p>
      ${art.url ? `<a href="${art.url}" target="_blank" style="display: inline-block; font-size: 13px; font-weight: 600; color: #2563eb; text-decoration: none;">Read Original Source &rarr;</a>` : ''}
    </div>
  `).join('');

  const takeawaysHtml = keyTakeaways.map((takeaway) => `
    <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5; color: #1e293b;">
      ${takeaway}
    </li>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${digestTitle}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- HEADER -->
            <tr>
              <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 28px; text-align: left;">
                <table width="100%">
                  <tr>
                    <td>
                      <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">🤖 AI ROBOTICS DAILY BRIEF</div>
                      <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; line-height: 1.2;">${digestTitle}</h1>
                      <div style="font-size: 13px; color: #94a3b8; margin-top: 8px;">Delivered at 9:00 AM &bull; ${dateStr}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- EXECUTIVE SUMMARY -->
            <tr>
              <td style="padding: 24px 28px; background-color: #eff6ff; border-bottom: 1px solid #e2e8f0;">
                <h2 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Executive Summary</h2>
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1e293b; font-weight: 500;">
                  ${headlineSummary}
                </p>
              </td>
            </tr>

            <!-- KEY TAKEAWAYS -->
            ${keyTakeaways.length > 0 ? `
            <tr>
              <td style="padding: 24px 28px 12px 28px; border-bottom: 1px solid #f1f5f9;">
                <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a;">🎯 Strategic Takeaways & Signals</h2>
                <ul style="margin: 0; padding-left: 20px;">
                  ${takeawaysHtml}
                </ul>
              </td>
            </tr>
            ` : ''}

            <!-- TOP STORIES -->
            <tr>
              <td style="padding: 24px 28px;">
                <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                  📰 Today's Top Robotics Breakthroughs & News
                </h2>
                ${articlesHtml}
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background-color: #f8fafc; padding: 24px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #475569;">
                  Curated by your AI Agent for Robotics News
                </p>
                <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                  Automatically scheduled for morning 9:00 AM delivery to ${scheduleSettings.recipientEmail}.<br>
                  Powered by Google Gemini AI & Google Workspace Gmail API.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// Internal Digest Generation Helper using Gemini Search Grounding
async function generateRoboticsDigest(): Promise<NewsDigest> {
  addAgentLog('info', 'Searching latest robotics news using Gemini with Google Search Grounding...');

  const topicsList = scheduleSettings.topics.join(', ');
  const prompt = `
  You are an expert AI Robotics Intelligence Analyst.
  Search for real-time, latest breaking robotics news, breakthroughs, industry announcements, humanoid robot developments, AI embodied intelligence, surgical robotics, research papers, and commercial deployments from today or recent days.

  Focus topics requested: ${topicsList}.
  Additional priority keywords: ${scheduleSettings.customPromptKeywords}.
  Tone style: ${scheduleSettings.tone}.

  Search Google for recent robotics news and synthesize a structured, top-tier daily digest.

  Your response MUST be valid JSON (do not put extra commentary outside JSON) matching this exact format:
  {
    "title": "Robotics Daily Digest: [Catchy Headline summarizing today's main story]",
    "dateString": "August 11, 2026",
    "headlineSummary": "A concise 2-3 sentence high-level executive summary of the biggest news items in robotics today.",
    "keyTakeaways": [
      "Strategic Takeaway 1",
      "Strategic Takeaway 2",
      "Strategic Takeaway 3"
    ],
    "articles": [
      {
        "id": "art-1",
        "title": "Full News Headline",
        "summary": "Detailed paragraph explaining the story, why it matters, technical specs or business impact.",
        "category": "Humanoids & Bipeds", 
        "source": "IEEE Spectrum / TechCrunch / MIT News / Reuters",
        "url": "https://example.com/article",
        "publishedDate": "Recent",
        "importance": "High"
      }
    ]
  }

  Valid categories for category field MUST be one of:
  "Humanoids & Bipeds", "Warehouse & Logistics", "Medical & Surgical", "Autonomous & Drones", "AI & Foundation Models", "Research & Breakthroughs".

  Provide at least 4 to 6 distinct, high-quality, authentic robotics news stories found via Google Search.
  Ensure URLs are actual web links found in grounded search or high-authority domain links.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    addAgentLog('info', 'Received response from Gemini. Parsing JSON payload...');

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      // Cleanup markdown code blocks if present
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    const todayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const articles: RoboticsNewsItem[] = (parsed.articles || []).map((art: any, index: number) => ({
      id: art.id || `art-${Date.now()}-${index}`,
      title: art.title || 'Robotics Breakthrough',
      summary: art.summary || 'Summary not provided.',
      category: art.category || 'Humanoids & Bipeds',
      source: art.source || 'Industry News',
      url: art.url || 'https://news.google.com/search?q=robotics',
      publishedDate: art.publishedDate || 'Today',
      importance: art.importance || 'High'
    }));

    const keyTakeaways: string[] = parsed.keyTakeaways || [
      'Embodied AI models are accelerating rapid humanoid dexterity testing.',
      'Commercial warehouse deployments of autonomous mobile robots reach new peaks.',
      'Next-generation surgical robotics receive expanded regulatory clearances.'
    ];

    const headlineSummary = parsed.headlineSummary || 'Today in robotics: Major announcements in humanoid dexterity, autonomous warehouse fleet expansion, and novel foundation models for robotic control.';
    const title = parsed.title || `Robotics Intelligence Brief: ${todayStr}`;

    const htmlContent = buildHtmlEmailDigest(title, todayStr, articles, keyTakeaways, headlineSummary);
    const plainText = `${title}\n${todayStr}\n\n${headlineSummary}\n\nKey Takeaways:\n${keyTakeaways.map(t => `- ${t}`).join('\n')}\n\nTop Stories:\n${articles.map(a => `${a.title} (${a.source})\n${a.summary}\n${a.url}\n`).join('\n')}`;

    const digest: NewsDigest = {
      id: `digest-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      dateString: todayStr,
      title,
      headlineSummary,
      htmlContent,
      plainText,
      articles,
      keyTakeaways,
      topicsIncluded: scheduleSettings.topics,
      wordCount: htmlContent.split(/\s+/).length
    };

    latestDigest = digest;
    addAgentLog('success', `Digest generated successfully with ${articles.length} news stories!`);
    return digest;
  } catch (error: any) {
    addAgentLog('error', `Failed to generate digest via Gemini: ${error.message}`);
    throw error;
  }
}

// Internal Helper: Send Raw Email via Gmail API
async function sendGmailMessage(accessToken: string, toEmail: string, subject: string, htmlBody: string): Promise<string> {
  addAgentLog('info', `Constructing RFC 2822 email payload for recipient: ${toEmail}...`);

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `To: ${toEmail}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    htmlBody
  ];

  const rawMessage = messageParts.join('\r\n');
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  addAgentLog('info', 'Dispatching request to Gmail API (https://gmail.googleapis.com/gmail/v1/users/me/messages/send)...');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedMessage
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const msg = errorData?.error?.message || `Gmail API HTTP ${res.status}`;
    addAgentLog('error', `Gmail API Error: ${msg}`);
    throw new Error(`Gmail API failed: ${msg}`);
  }

  const data = await res.json();
  addAgentLog('success', `Gmail API response: Message sent! ID: ${data.id}`);
  return data.id;
}

// --- API ENDPOINTS ---

// 1. Get Agent & Schedule Status
app.get('/api/schedule', (req, res) => {
  res.json({
    schedule: scheduleSettings,
    latestDigest: latestDigest ? {
      id: latestDigest.id,
      generatedAt: latestDigest.generatedAt,
      title: latestDigest.title,
      articleCount: latestDigest.articles.length,
      headlineSummary: latestDigest.headlineSummary
    } : null,
    logCount: deliveryLogs.length
  });
});

// 2. Save / Update Schedule Settings
app.post('/api/schedule', (req, res) => {
  scheduleSettings = { ...scheduleSettings, ...req.body };
  addAgentLog('info', `Schedule updated: Time = ${scheduleSettings.scheduledTime}, Enabled = ${scheduleSettings.enabled}, Recipient = ${scheduleSettings.recipientEmail}`);
  res.json({ success: true, schedule: scheduleSettings });
});

// 3. Store Latest Auth Token for Server Scheduled Runs
app.post('/api/auth-token', (req, res) => {
  const { accessToken } = req.body;
  if (accessToken) {
    lastAuthToken = accessToken;
    addAgentLog('info', 'Gmail Access Token updated for background agent execution.');
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'accessToken is required' });
  }
});

// 4. Generate News Digest (Triggered by user or cron)
app.post('/api/generate-digest', async (req, res) => {
  try {
    const digest = await generateRoboticsDigest();
    res.json({ success: true, digest });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate robotics digest' });
  }
});

// 5. Get Latest Generated Digest
app.get('/api/digest/latest', (req, res) => {
  if (!latestDigest) {
    return res.status(404).json({ error: 'No digest generated yet' });
  }
  res.json(latestDigest);
});

// 6. Send Email to Gmail API
app.post('/api/send-email', async (req, res) => {
  const { accessToken, toEmail, subject, htmlContent } = req.body;

  const targetToken = accessToken || lastAuthToken;
  const targetEmail = toEmail || scheduleSettings.recipientEmail;

  if (!targetToken) {
    addAgentLog('warn', 'Email send request rejected: User is not authenticated with Google Gmail.');
    return res.status(401).json({
      error: 'Google Gmail authentication required. Please sign in with Google first.'
    });
  }

  let digestToSend = latestDigest;
  if (!digestToSend || htmlContent) {
    // If no digest or custom content provided
    if (!digestToSend) {
      try {
        digestToSend = await generateRoboticsDigest();
      } catch (err: any) {
        return res.status(500).json({ error: 'Failed to generate digest for email' });
      }
    }
  }

  const emailSubject = subject || digestToSend?.title || 'Daily Robotics News Brief';
  const emailBody = htmlContent || digestToSend?.htmlContent || '<p>Robotics digest content</p>';

  try {
    const messageId = await sendGmailMessage(targetToken, targetEmail, emailSubject, emailBody);

    const logItem: DeliveryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientEmail: targetEmail,
      subject: emailSubject,
      status: 'SUCCESS',
      digestId: digestToSend?.id,
      gmailMessageId: messageId,
      articleCount: digestToSend?.articles?.length || 0
    };

    deliveryLogs.unshift(logItem);
    res.json({ success: true, messageId, log: logItem });
  } catch (err: any) {
    const failedLogItem: DeliveryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientEmail: targetEmail,
      subject: emailSubject,
      status: 'FAILED',
      errorMessage: err.message,
      articleCount: digestToSend?.articles?.length || 0
    };
    deliveryLogs.unshift(failedLogItem);
    res.status(500).json({ error: err.message || 'Failed to send email via Gmail API' });
  }
});

// 7. Get Delivery Logs
app.get('/api/logs', (req, res) => {
  res.json({ logs: deliveryLogs });
});

// 8. Get Agent Terminal Activity Logs
app.get('/api/agent-activity', (req, res) => {
  res.json({ activity: agentLogs });
});

// Cron Job Scheduler for 9:00 AM Delivery
// Runs every minute to check schedule time
cron.schedule('* * * * *', async () => {
  if (!scheduleSettings.enabled) return;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  if (currentTimeStr === scheduleSettings.scheduledTime) {
    addAgentLog('info', `⏰ Morning ${scheduleSettings.scheduledTime} trigger activated! Initiating automated robotics news curation...`);

    try {
      const digest = await generateRoboticsDigest();
      
      if (lastAuthToken && scheduleSettings.autoSendEnabled) {
        addAgentLog('info', `Auto-sending daily digest to ${scheduleSettings.recipientEmail} via Gmail API...`);
        const messageId = await sendGmailMessage(
          lastAuthToken,
          scheduleSettings.recipientEmail,
          digest.title,
          digest.htmlContent
        );

        deliveryLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          recipientEmail: scheduleSettings.recipientEmail,
          subject: digest.title,
          status: 'SUCCESS',
          digestId: digest.id,
          gmailMessageId: messageId,
          articleCount: digest.articles.length
        });

        addAgentLog('success', `🎉 Scheduled 9:00 AM Robotics News Digest delivered to ${scheduleSettings.recipientEmail}!`);
      } else {
        addAgentLog('warn', `Scheduled digest created, but Gmail auto-send requires active sign-in token.`);
      }
    } catch (err: any) {
      addAgentLog('error', `Automated 9:00 AM delivery failed: ${err.message}`);
    }
  }
});

// Express Start and Vite Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Robotics News Agent server running on http://localhost:${PORT}`);
  });
}

startServer();
