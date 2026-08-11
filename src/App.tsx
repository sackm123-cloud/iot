import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScheduleCard } from './components/ScheduleCard';
import { TopicsSelector } from './components/TopicsSelector';
import { DigestPreview } from './components/DigestPreview';
import { DeliveryLogs } from './components/DeliveryLogs';
import { AgentTerminal } from './components/AgentTerminal';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { ScheduleSettings, NewsDigest, DeliveryLog, AgentLogMessage, UserAuth } from './types';

export default function App() {
  const [userAuth, setUserAuth] = useState<UserAuth | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [schedule, setSchedule] = useState<ScheduleSettings>({
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
    customPromptKeywords: 'Tesla Optimus, Figure AI, Boston Dynamics, Unitree, ROS 2, Surgical Robots',
    autoSendEnabled: true
  });

  const [latestDigest, setLatestDigest] = useState<NewsDigest | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogMessage[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Initialize Auth & Fetch Schedule Data
  useEffect(() => {
    // 1. Initialize Firebase Google Workspace Auth
    initAuth(
      (user, token) => {
        const authData: UserAuth = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          accessToken: token
        };
        setUserAuth(authData);
        if (user.email) {
          setSchedule(prev => ({ ...prev, recipientEmail: user.email || 'sackm123@gmail.com' }));
        }
        // Send token to backend for background scheduled runs
        fetch('/api/auth-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: token })
        }).catch(err => console.error('Token sync failed:', err));
      },
      () => {
        setUserAuth(null);
      }
    );

    // 2. Load Initial Schedule & Digest State
    fetchData();

    // 3. Poll Agent Console Activity Logs periodically
    const interval = setInterval(() => {
      fetchAgentActivity();
      fetchLogs();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const scheduleRes = await fetch('/api/schedule');
      if (scheduleRes.ok) {
        const data = await scheduleRes.json();
        if (data.schedule) setSchedule(data.schedule);
      }

      const digestRes = await fetch('/api/digest/latest');
      if (digestRes.ok) {
        const digest = await digestRes.json();
        setLatestDigest(digest);
      }

      fetchLogs();
      fetchAgentActivity();
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setDeliveryLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
  };

  const fetchAgentActivity = async () => {
    try {
      const res = await fetch('/api/agent-activity');
      if (res.ok) {
        const data = await res.json();
        setAgentLogs(data.activity || []);
      }
    } catch (e) {
      console.error('Failed to fetch activity:', e);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUserAuth({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          accessToken: result.accessToken
        });

        if (result.user.email) {
          setSchedule(prev => ({ ...prev, recipientEmail: result.user.email || 'sackm123@gmail.com' }));
        }

        // Sync token to server
        await fetch('/api/auth-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: result.accessToken })
        });
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserAuth(null);
  };

  const handleUpdateSchedule = async (updated: Partial<ScheduleSettings>) => {
    const newSchedule = { ...schedule, ...updated };
    setSchedule(newSchedule);
    try {
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      });
    } catch (e) {
      console.error('Failed to save schedule:', e);
    }
  };

  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-digest', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate digest');
      const data = await res.json();
      setLatestDigest(data.digest);
      fetchAgentActivity();
    } catch (err) {
      console.error('Generate failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (toEmail?: string) => {
    setIsSending(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: userAuth?.accessToken,
          toEmail: toEmail || schedule.recipientEmail,
          subject: latestDigest?.title || 'Daily Robotics News Brief'
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to dispatch email');
      }

      await fetchLogs();
      await fetchAgentActivity();
    } catch (err: any) {
      alert(`Send Error: ${err.message}`);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased">
      
      {/* HEADER */}
      <Header
        userAuth={userAuth}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        agentStatus={isGenerating ? 'running' : 'idle'}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* SCHEDULE CONTROL CARD */}
        <ScheduleCard
          schedule={schedule}
          onUpdateSchedule={handleUpdateSchedule}
          onRunNow={handleGenerateDigest}
          isGenerating={isGenerating}
          hasAuthToken={!!userAuth?.accessToken}
        />

        {/* TWO COLUMN WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Preferences & Agent Console */}
          <div className="lg:col-span-1 space-y-8">
            <TopicsSelector
              schedule={schedule}
              onUpdateSchedule={handleUpdateSchedule}
            />
            
            <AgentTerminal logs={agentLogs} />
          </div>

          {/* RIGHT COLUMN: Live Digest Preview & Logs */}
          <div className="lg:col-span-2 space-y-8">
            <DigestPreview
              digest={latestDigest}
              onGenerate={handleGenerateDigest}
              onSendEmail={handleSendEmail}
              isGenerating={isGenerating}
              isSending={isSending}
              recipientEmail={schedule.recipientEmail}
              hasAuthToken={!!userAuth?.accessToken}
              onLogin={handleLogin}
            />

            <DeliveryLogs logs={deliveryLogs} />
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>AI Agent for Robotics News Morning 9:00 AM &bull; Powered by Google Gemini AI & Google Workspace Gmail API</p>
      </footer>

    </div>
  );
}
