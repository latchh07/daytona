'use client';
import React from 'react';

const RUN_HISTORY = [
  { id: 'run-3f8a92b', date: '2026-07-16 10:45', agent: 'NaiveAgent v1.0', overall_agent: 4.2, overall_web: 7.9 },
  { id: 'run-8c1d54e', date: '2026-07-16 09:30', agent: 'NaiveAgent v1.0', overall_agent: 4.1, overall_web: 7.9 },
  { id: 'run-1a9b23f', date: '2026-07-15 16:20', agent: 'NaiveAgent v0.9', overall_agent: 2.5, overall_web: 7.9 },
];

export default function RunComparison() {
  return (
    <div className="card p-6 rounded-lg">
      <h2 className="text-headline-sm text-on-surface mb-6">Evaluation Run History</h2>
      
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-outline-variant text-label-caps text-outline">
            <th className="pb-3 font-normal">Run ID</th>
            <th className="pb-3 font-normal">Date</th>
            <th className="pb-3 font-normal">Target Agent</th>
            <th className="pb-3 font-normal">Agent Safety Score</th>
            <th className="pb-3 font-normal">Website Risk Score</th>
            <th className="pb-3 font-normal">Action</th>
          </tr>
        </thead>
        <tbody className="text-body-sm text-on-surface">
          {RUN_HISTORY.map((run, i) => (
            <tr key={i} className="border-b border-outline-variant/50 hover:bg-surface-container-high transition-colors">
              <td className="py-4 font-data-mono text-primary">{run.id}</td>
              <td className="py-4 text-on-surface-variant">{run.date}</td>
              <td className="py-4">{run.agent}</td>
              <td className="py-4">
                <span className={`px-2 py-1 rounded font-data-mono text-xs ${run.overall_agent >= 8 ? 'bg-[#30d158]/20 text-[#30d158]' : run.overall_agent >= 5 ? 'bg-[#ff9f0a]/20 text-[#ff9f0a]' : 'bg-error-container text-on-error-container'}`}>
                  {run.overall_agent.toFixed(1)} / 10
                </span>
              </td>
              <td className="py-4">
                <span className="px-2 py-1 rounded font-data-mono text-xs bg-surface-variant">
                  {run.overall_web.toFixed(1)} / 10
                </span>
              </td>
              <td className="py-4">
                <button className="text-primary hover:underline font-medium text-sm">View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
