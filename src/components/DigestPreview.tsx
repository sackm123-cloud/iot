import React, { useState } from 'react';
import { Mail, Sparkles, ExternalLink, Calendar, Layers, Eye, FileText, CheckCircle2, AlertTriangle, Send, RefreshCw } from 'lucide-react';
import { NewsDigest } from '../types';

interface DigestPreviewProps {
  digest: NewsDigest | null;
  onGenerate: () => void;
  onSendEmail: (toEmail?: string) => Promise<void>;
  isGenerating: boolean;
  isSending: boolean;
  recipientEmail: string;
  hasAuthToken: boolean;
  onLogin: () => void;
}

export const DigestPreview: React.FC<DigestPreviewProps> = ({
  digest,
  onGenerate,
  onSendEmail,
  isGenerating,
  isSending,
  recipientEmail,
  hasAuthToken,
  onLogin
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'cards'>('html');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setSendSuccessMessage(null);
    try {
      await onSendEmail(recipientEmail);
      setSendSuccessMessage(`Digest successfully sent to ${recipientEmail}! Check your inbox.`);
      setTimeout(() => setSendSuccessMessage(null), 8000);
    } catch (err) {
      console.error('Failed to send:', err);
    }
  };

  if (!digest && !isGenerating) {
    return (
      <div id="card-digest-empty-state" className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-slate-900">No News Digest Generated Yet</h3>
          <p className="text-sm text-slate-500">
            Click the button below to trigger the AI agent to search today's latest robotics news and synthesize your morning email digest.
          </p>
        </div>
        <button
          id="btn-generate-first-digest"
          onClick={onGenerate}
          className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Curate Today's Robotics News</span>
        </button>
      </div>
    );
  }

  return (
    <div id="card-digest-preview-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* HEADER CONTROLS */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-slate-900">{digest?.title || 'Today\'s Robotics Digest'}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Preview
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {digest?.dateString || 'Today'} &bull; {digest?.articles.length || 0} Stories Curated
          </p>
        </div>

        {/* TABS & ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* View Toggle */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center space-x-1 text-xs font-semibold text-slate-700">
            <button
              id="tab-view-html"
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'html' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>HTML Email</span>
            </button>
            <button
              id="tab-view-cards"
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>News Cards</span>
            </button>
          </div>

          {/* Regenerate Button */}
          <button
            id="btn-regenerate-digest"
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            title="Refresh news search"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Search</span>
          </button>

          {/* Send to Gmail Button */}
          {hasAuthToken ? (
            <button
              id="btn-send-to-gmail-trigger"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSending || !digest}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-600/20 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending to Gmail...' : 'Send to My Gmail'}</span>
            </button>
          ) : (
            <button
              id="btn-login-for-email"
              onClick={onLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-md flex items-center space-x-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Sign in to Send Email</span>
            </button>
          )}

        </div>

      </div>

      {sendSuccessMessage && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{sendSuccessMessage}</span>
        </div>
      )}

      {/* BODY CONTENT */}
      {isGenerating ? (
        <div className="p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900">Gemini AI Agent searching breaking news...</h4>
            <p className="text-xs text-slate-500">Retrieving humanoids, robotics breakthroughs, and industry deployments via Google Search grounding.</p>
          </div>
        </div>
      ) : activeTab === 'html' ? (
        <div className="p-4 bg-slate-100 min-h-[500px]">
          <iframe
            id="iframe-email-preview"
            srcDoc={digest?.htmlContent || ''}
            title="HTML Email Preview"
            className="w-full h-[600px] rounded-xl border border-slate-200 bg-white shadow-inner"
          />
        </div>
      ) : (
        <div className="p-6 space-y-6 bg-slate-50/40">
          
          {/* Key takeaways */}
          {digest?.keyTakeaways && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">🎯 Strategic Signals & Takeaways</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-800">
                {digest.keyTakeaways.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {digest?.articles.map((art) => (
              <div key={art.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 text-[10px] uppercase">
                      {art.category}
                    </span>
                    <span className="text-slate-400 font-medium">{art.source}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base leading-snug">{art.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">{art.summary}</p>
                </div>
                {art.url && (
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1 pt-2 border-t border-slate-100"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* CONFIRMATION MODAL FOR GMAIL WORKSPACE ACTION */}
      {showConfirmModal && (
        <div id="modal-confirm-gmail-send" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-start space-x-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Send Digest to Gmail?</h3>
                <p className="text-xs text-slate-500">
                  This will dispatch an email using your connected Google Workspace Gmail account.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Target Email:</span>
                <span className="font-bold text-slate-900">{recipientEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Subject:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[220px]">{digest?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Article Count:</span>
                <span className="font-semibold text-blue-600">{digest?.articles.length || 0} stories</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Note: This action uses Gmail API scope <code className="text-blue-600 font-mono">gmail.send</code> with explicit user approval.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                id="btn-cancel-modal-send"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-modal-send"
                onClick={handleConfirmSend}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
              >
                Confirm & Send Email
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
