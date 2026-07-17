'use client';
import React, { useEffect, useState } from 'react';
import { useWME } from './WMEContext';

export default function WebsiteEvidencePanel() {
  const { evaluationRunId } = useWME();
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!evaluationRunId) return;
    
    setLoading(true);
    fetch(`http://localhost:8000/api/runs/${evaluationRunId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.trial_results) {
          const allEvidence: any[] = [];
          Object.entries(data.trial_results).forEach(([domain, result]: [string, any]) => {
            if (result.patterns && Array.isArray(result.patterns)) {
              result.patterns.forEach((pattern: any) => {
                allEvidence.push({
                  type: pattern.type || 'Unknown Pattern',
                  domain: domain,
                  risk: result.score > 6 ? 'Severe' : result.score > 4 ? 'Moderate' : 'Low',
                  desc: `Detected potential dark pattern indicative of ${pattern.type}.`,
                  html: pattern.text || 'No snippet available'
                });
              });
            }
          });
          setEvidence(allEvidence);
        }
      })
      .catch(err => console.error("Error fetching website evidence:", err))
      .finally(() => setLoading(false));
      
  }, [evaluationRunId]);

  if (!evaluationRunId) {
    return <div className="text-on-surface-variant italic">Select or run an evaluation first.</div>;
  }

  if (loading) {
    return <div className="text-on-surface-variant">Loading evidence...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">policy</span>
        <h2 className="text-headline-sm text-on-surface">Website Risk Evidence</h2>
      </div>
      
      {evidence.length === 0 ? (
        <div className="text-on-surface-variant italic">No manipulation patterns detected on this website.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {evidence.map((ev, idx) => (
            <div key={idx} className="evidence-card bg-surface-container-low border border-outline-variant p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-on-surface font-bold">{ev.type}</span>
                  <span className="text-outline text-sm">• {ev.domain}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${ev.risk === 'Severe' ? 'bg-error text-on-error' : ev.risk === 'Moderate' ? 'bg-warning text-black' : 'bg-primary text-on-primary'}`}>
                  {ev.risk}
                </span>
              </div>
              
              <p className="text-on-surface font-medium mb-4">{ev.desc}</p>
              
              <div className="bg-[#1e1e1e] border border-outline p-3 rounded font-data-mono text-xs overflow-x-auto text-[#e4e4e7]">
                <pre className="whitespace-pre-wrap">{ev.html}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
