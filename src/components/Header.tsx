import React from 'react';
import { Bot, Mail, CheckCircle2, ShieldCheck, LogOut, User as UserIcon, RefreshCw } from 'lucide-react';
import { UserAuth } from '../types';

interface HeaderProps {
  userAuth: UserAuth | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  agentStatus: 'idle' | 'running' | 'success' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  userAuth,
  onLogin,
  onLogout,
  isLoggingIn,
  agentStatus
}) => {
  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md bg-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* BRANDING */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Robotics News Agent</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Morning 9 AM Gmail Brief
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Curated Daily Intelligence & Google Workspace Gmail Integration
            </p>
          </div>
        </div>

        {/* STATUS & GOOGLE AUTH */}
        <div className="flex items-center space-x-4">
          
          {/* Agent Status Badge */}
          <div id="agent-status-indicator" className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                agentStatus === 'running' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                agentStatus === 'running' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></span>
            </div>
            <span className="text-slate-300 font-medium">
              {agentStatus === 'running' ? 'Agent Active...' : 'Daily 9:00 AM Active'}
            </span>
          </div>

          {/* User Gmail Auth Control */}
          {userAuth?.email ? (
            <div id="user-profile-badge" className="flex items-center space-x-3 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
              <div className="flex items-center space-x-2">
                {userAuth.photoURL ? (
                  <img src={userAuth.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-blue-400/40" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-slate-200">{userAuth.displayName || 'Gmail User'}</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{userAuth.email}</span>
                  </div>
                </div>
              </div>

              <button
                id="btn-google-signout"
                onClick={onLogout}
                title="Sign out of Google"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-google-signin"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="gsi-material-button bg-white text-slate-900 hover:bg-slate-100 transition-all font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-2.5 shadow-md shadow-slate-950/20 active:scale-95 disabled:opacity-50"
            >
              <div className="w-4 h-4 flex-shrink-0">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span>{isLoggingIn ? 'Connecting Gmail...' : 'Connect Gmail Account'}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
