export interface RoboticsNewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'Humanoids & Bipeds' | 'Warehouse & Logistics' | 'Medical & Surgical' | 'Autonomous & Drones' | 'AI & Foundation Models' | 'Research & Breakthroughs';
  source: string;
  url: string;
  publishedDate: string;
  importance: 'High' | 'Medium' | 'Low';
}

export interface NewsDigest {
  id: string;
  generatedAt: string;
  dateString: string;
  title: string;
  headlineSummary: string;
  htmlContent: string;
  plainText: string;
  articles: RoboticsNewsItem[];
  keyTakeaways: string[];
  topicsIncluded: string[];
  wordCount: number;
}

export interface ScheduleSettings {
  enabled: boolean;
  scheduledTime: string; // "09:00"
  timezone: string;
  recipientEmail: string;
  topics: string[];
  tone: 'Executive Brief' | 'Deep Tech Analysis' | 'Quick Highlights';
  includeGroundingLinks: boolean;
  customPromptKeywords: string;
  autoSendEnabled: boolean;
}

export interface DeliveryLog {
  id: string;
  timestamp: string;
  recipientEmail: string;
  subject: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'TEST';
  digestId?: string;
  errorMessage?: string;
  gmailMessageId?: string;
  articleCount: number;
}

export interface AgentLogMessage {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export interface UserAuth {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  accessToken: string | null;
}
