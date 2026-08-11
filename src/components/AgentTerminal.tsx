import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Activity, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { AgentLogMessage } from '../types';

interface AgentTerminalProps {
  logs: AgentLogMessage[];
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div id="card-agent-terminal-log" className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
      
      {/* HEADER */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 text-xs">AI Agent Live Execution Console</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-sans">
            Realtime
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xs">
          <span>{logs.length} events</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* TERMINAL CONTENT */}
      {isExpanded && (
        <div className="p-4 max-h-56 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 bg-slate-950/90 text-slate-300">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic py-2">Console initialized. Awaiting agent events...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-slate-500 flex-shrink-0 text-[11px] font-sans">[{log.timestamp}]</span>
                
                {log.level === 'success' && (
                  <span className="text-emerald-400 font-bold flex-shrink-0">[SUCCESS]</span>
                )}
                {log.level === 'error' && (
                  <span className="text-rose-400 font-bold flex-shrink-0">[ERROR]</span>
                )}
                {log.level === 'warn' && (
                  <span className="text-amber-400 font-bold flex-shrink-0">[WARN]</span>
                )}
                {log.level === 'info' && (
                  <span className="text-cyan-400 font-bold flex-shrink-0">[INFO]</span>
                )}

                <span className={`break-words ${
                  log.level === 'error' ? 'text-rose-300' :
                  log.level === 'success' ? 'text-emerald-300' :
                  log.level === 'warn' ? 'text-amber-300' : 'text-slate-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
