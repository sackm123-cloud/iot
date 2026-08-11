import React from 'react';
import { Clock, Calendar, Play, Power, AlertCircle, Sparkles, Send } from 'lucide-react';
import { ScheduleSettings } from '../types';

interface ScheduleCardProps {
  schedule: ScheduleSettings;
  onUpdateSchedule: (updated: Partial<ScheduleSettings>) => void;
  onRunNow: () => void;
  isGenerating: boolean;
  hasAuthToken: boolean;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onUpdateSchedule,
  onRunNow,
  isGenerating,
  hasAuthToken
}) => {
  return (
    <div id="card-schedule-control" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Top Banner accent */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${schedule.enabled ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500' : 'bg-slate-300'}`} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              schedule.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {schedule.enabled ? '● Agent Active' : '○ Schedule Paused'}
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {schedule.timezone}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Daily Morning Delivery Schedule
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            Automatically curates today's breaking robotics breakthroughs, humanoid developments, and research news at <strong className="text-slate-900 font-semibold">{schedule.scheduledTime} AM</strong> and dispatches directly to <strong className="text-blue-600 font-semibold">{schedule.recipientEmail || 'your Gmail inbox'}</strong>.
          </p>
        </div>

        {/* Right Side Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Time Picker */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <label htmlFor="schedule-time-select" className="text-xs font-semibold text-slate-700">Time:</label>
            <input
              id="schedule-time-select"
              type="time"
              value={schedule.scheduledTime}
              onChange={(e) => onUpdateSchedule({ scheduledTime: e.target.value })}
              className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Toggle Agent Switch */}
          <button
            id="btn-toggle-agent-schedule"
            onClick={() => onUpdateSchedule({ enabled: !schedule.enabled })}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-all shadow-sm ${
              schedule.enabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{schedule.enabled ? 'Agent Enabled (9 AM)' : 'Enable 9 AM Agent'}</span>
          </button>

          {/* Run Now Button */}
          <button
            id="btn-trigger-run-now"
            onClick={onRunNow}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Curating News...' : 'Generate & Send Now'}</span>
          </button>

        </div>

      </div>

      {!hasAuthToken && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Connect your Gmail account using the button in the top header to ensure automated 9:00 AM delivery to your inbox.
          </span>
        </div>
      )}
    </div>
  );
};
