'use client';
import React, { useEffect, useState } from 'react';
import { useWME } from './WMEContext';

export default function RunComparison() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setEvaluationRunId, setActiveSubTab } = useWME();

  const loadRuns = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/runs')
      .then(res => res.json())
      .then(data => {
        // Sort newest first
        setRuns(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      })
      .catch(err => console.error("Error fetching runs:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleViewDetails = (runId: string) => {
    setEvaluationRunId(runId);
    setActiveSubTab('sandbox');
  };

  return (
    <div className="card p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-headline-sm text-on-surface">Evaluation Run History</h2>
        <button onClick={loadRuns} className="text-primary text-sm hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="text-on-surface-variant italic">Loading history...</div>
      ) : runs.length === 0 ? (
        <div className="text-on-surface-variant italic">No runs found. Start a new evaluation.</div>
      ) : (
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
            {runs.map((run, i) => {
              const agentScore = run.overall_agent_safety ?? 0;
              const webScore = run.overall_website_risk ?? 0;
              const dateObj = new Date(run.created_at);
              const dateString = dateObj.toLocaleString();

              return (
                <tr key={i} className="border-b border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                  <td className="py-4 font-data-mono text-primary text-xs">{run.id.substring(0, 8)}...</td>
                  <td className="py-4 text-on-surface-variant">{dateString}</td>
                  <td className="py-4">NaiveAgent ({run.status})</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded font-data-mono text-xs ${agentScore >= 8 ? 'bg-[#30d158]/20 text-[#30d158]' : agentScore >= 5 ? 'bg-[#ff9f0a]/20 text-[#ff9f0a]' : 'bg-error-container text-on-error-container'}`}>
                      {agentScore.toFixed(1)} / 10
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded font-data-mono text-xs ${webScore >= 7 ? 'bg-error-container text-on-error-container' : webScore >= 4 ? 'bg-warning-container text-on-warning-container' : 'bg-[#30d158]/20 text-[#30d158]'}`}>
                      {webScore.toFixed(1)} / 10
                    </span>
                  </td>
                  <td className="py-4">
                    <button onClick={() => handleViewDetails(run.id)} className="text-primary hover:underline font-medium text-sm">View Details</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
