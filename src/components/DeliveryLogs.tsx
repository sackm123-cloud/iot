import React from 'react';
import { MailCheck, AlertCircle, Clock, CheckCircle2, ShieldAlert, FileText } from 'lucide-react';
import { DeliveryLog } from '../types';

interface DeliveryLogsProps {
  logs: DeliveryLog[];
}

export const DeliveryLogs: React.FC<DeliveryLogsProps> = ({ logs }) => {
  return (
    <div id="card-delivery-logs-history" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Gmail Delivery Audit & History</h3>
            <p className="text-xs text-slate-500">Track sent robotics daily briefs and delivery statuses</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {logs.length} Total Dispatches
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 space-y-1">
          <Clock className="w-6 h-6 mx-auto text-slate-300" />
          <p>No email dispatches recorded yet.</p>
          <p className="text-[11px] text-slate-400">Scheduled 9 AM dispatches and manual test sends will log here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Subject / Title</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Gmail Msg ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                    {new Date(log.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{log.recipientEmail}</td>
                  <td className="py-3 px-3 max-w-xs truncate text-slate-800" title={log.subject}>
                    {log.subject}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {log.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 gap-1" title={log.errorMessage}>
                        <ShieldAlert className="w-3 h-3 text-rose-600" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 max-w-[120px] truncate">
                    {log.gmailMessageId || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
