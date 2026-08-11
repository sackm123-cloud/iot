import React from 'react';
import { Sliders, Mail, Tag, MessageSquare, Check, Sparkles } from 'lucide-react';
import { ScheduleSettings } from '../types';

interface TopicsSelectorProps {
  schedule: ScheduleSettings;
  onUpdateSchedule: (updated: Partial<ScheduleSettings>) => void;
}

const AVAILABLE_TOPICS = [
  'Humanoids & Bipeds',
  'Warehouse & Logistics',
  'Medical & Surgical',
  'Autonomous & Drones',
  'AI & Foundation Models',
  'Research & Breakthroughs'
];

export const TopicsSelector: React.FC<TopicsSelectorProps> = ({
  schedule,
  onUpdateSchedule
}) => {
  const toggleTopic = (topic: string) => {
    const current = schedule.topics;
    if (current.includes(topic)) {
      if (current.length === 1) return; // Keep at least 1 topic
      onUpdateSchedule({ topics: current.filter(t => t !== topic) });
    } else {
      onUpdateSchedule({ topics: [...current, topic] });
    }
  };

  return (
    <div id="card-topics-customizer" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">AI Agent Curation Preferences</h3>
            <p className="text-xs text-slate-500">Configure what the agent searches and prioritizes for your 9 AM email</p>
          </div>
        </div>
      </div>

      {/* TOPIC CHIPS */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          <span>Robotics Topic Focus Areas:</span>
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          {AVAILABLE_TOPICS.map((topic) => {
            const isSelected = schedule.topics.includes(topic);
            return (
              <button
                key={topic}
                id={`btn-topic-${topic.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
                onClick={() => toggleTopic(topic)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 ring-2 ring-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{topic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMN INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Recipient Gmail Input */}
        <div className="space-y-1.5">
          <label htmlFor="input-recipient-email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Target Gmail Address:</span>
          </label>
          <input
            id="input-recipient-email"
            type="email"
            value={schedule.recipientEmail}
            onChange={(e) => onUpdateSchedule({ recipientEmail: e.target.value })}
            placeholder="sackm123@gmail.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Tone Selector */}
        <div className="space-y-1.5">
          <label htmlFor="select-digest-tone" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Digest Style & Depth:</span>
          </label>
          <select
            id="select-digest-tone"
            value={schedule.tone}
            onChange={(e) => onUpdateSchedule({ tone: e.target.value as any })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="Executive Brief">Executive Brief (3 Min Read)</option>
            <option value="Deep Tech Analysis">Deep Tech Analysis (5 Min Read)</option>
            <option value="Quick Highlights">Quick Highlights (1 Min Read)</option>
          </select>
        </div>

      </div>

      {/* Priority Keywords Input */}
      <div className="space-y-1.5">
        <label htmlFor="input-custom-keywords" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Priority Companies & Search Keywords:</span>
        </label>
        <input
          id="input-custom-keywords"
          type="text"
          value={schedule.customPromptKeywords}
          onChange={(e) => onUpdateSchedule({ customPromptKeywords: e.target.value })}
          placeholder="Tesla Optimus, Figure AI, Boston Dynamics, Unitree, ROS 2, Surgical Robots"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
        />
        <p className="text-[11px] text-slate-400">
          The agent uses these keywords during Google Search grounding to prioritize stories about your favorite robotics platforms.
        </p>
      </div>

    </div>
  );
};
