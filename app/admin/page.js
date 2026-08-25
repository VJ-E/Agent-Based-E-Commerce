'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('/api/admin/audit')
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load audit logs", err);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-transparent pt-12 p-6 lg:p-8 max-w-[1400px] mx-auto relative z-10 font-[family-name:var(--font-body)]">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-zinc-600 hover:text-green-600 shadow-sm border border-zinc-100 hover:border-green-200 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </Link>
            <h1 className="text-4xl font-black text-zinc-800 tracking-tight">Merchant Control Plane</h1>
          </div>
          <p className="text-zinc-500 ml-13">Execution Audit Ledger - Immutable history of AI actions and Policy Gatekeeper interventions.</p>
        </div>
        
        <div className="clay-card px-5 py-3 rounded-2xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
          <span className="font-bold text-zinc-700 text-sm">System Live</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="clay-card rounded-3xl p-6 overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-12 bg-zinc-100 rounded-xl w-full"></div>
            <div className="h-16 bg-zinc-50 rounded-xl w-full"></div>
            <div className="h-16 bg-zinc-50 rounded-xl w-full"></div>
            <div className="h-16 bg-zinc-50 rounded-xl w-full"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-800">No logs found</h3>
            <p className="text-zinc-500 mt-1 text-sm">AI interactions will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-100">
                  <th className="py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Timestamp</th>
                  <th className="py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                  <th className="py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Reasoning / Note</th>
                  <th className="py-4 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {logs.map((log) => (
                  <React.Fragment key={log._id}>
                    <tr 
                      className={`hover:bg-zinc-50/50 transition-colors cursor-pointer ${expandedId === log._id ? 'bg-zinc-50/50' : ''}`}
                      onClick={() => toggleExpand(log._id)}
                    >
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-zinc-500 font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-bold font-mono">
                          {log.action === 'checkout' ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                          )}
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          log.status === 'blocked' ? 'bg-red-50 text-red-600 border border-red-100' :
                          log.status === 'success' ? 'bg-green-50 text-green-600 border border-green-100' :
                          'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}>
                          {log.status === 'blocked' && <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>}
                          {log.status === 'success' && <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-zinc-700 font-medium max-w-md truncate">
                        {log.reason}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-zinc-400 hover:text-green-600 transition-colors">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${expandedId === log._id ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Payload Row */}
                    {expandedId === log._id && (
                      <tr className="bg-zinc-50/80">
                        <td colSpan={5} className="p-0">
                           <div className="px-8 py-6 border-l-4 border-green-400 my-4 mx-4 bg-white rounded-xl shadow-sm">
                              <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider mb-3">Raw Payload Details</h4>
                              {log.details ? (
                                <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-inner">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              ) : (
                                <p className="text-sm text-zinc-500 italic">No additional payload details recorded for this action.</p>
                              )}
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
