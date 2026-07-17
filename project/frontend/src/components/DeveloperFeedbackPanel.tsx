'use client';
import React, { useEffect, useState } from 'react';
import { useWME } from './WMEContext';

export default function DeveloperFeedbackPanel() {
  const { evaluationRunId } = useWME();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!evaluationRunId) return;
    
    setLoading(true);
    fetch(`http://localhost:8000/api/runs/${evaluationRunId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.developer_feedback) {
          setFeedback(data.developer_feedback);
        }
      })
      .catch(err => console.error("Error fetching feedback:", err))
      .finally(() => setLoading(false));
      
  }, [evaluationRunId]);

  if (!evaluationRunId) {
    return <div className="text-on-surface-variant italic">Select or run an evaluation first.</div>;
  }

  if (loading) {
    return <div className="text-on-surface-variant">Loading feedback...</div>;
  }

  const grouped: Record<string, any[]> = {
    High: feedback.filter((f) => ['Critical', 'High'].includes(f.severity) || f.severity === 1 || f.severity === 2),
    Medium: feedback.filter((f) => f.severity === 'Medium' || f.severity === 3),
    Low: feedback.filter((f) => f.severity === 'Low' || f.severity === 4),
    Info: feedback.filter((f) => f.severity === 'Info' || f.severity === 5),
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">bug_report</span>
        <h2 className="text-headline-sm text-on-surface">Agent Hardening Feedback</h2>
      </div>
      
      <div className="flex flex-col gap-8">
        {Object.entries(grouped).map(([severityLabel, items]) => {
          if (items.length === 0) return null;
          
          return (
            <div key={severityLabel}>
              <h3 className={`text-label-caps text-outline mb-4 pb-2 border-b border-outline-variant ${
                severityLabel === 'High' ? 'text-error' : 
                severityLabel === 'Medium' ? 'text-warning' : 
                'text-primary'
              }`}>
                {severityLabel} SEVERITY
              </h3>
              
              <div className="flex flex-col gap-4">
                {items.map((fb, idx) => (
                  <div key={idx} className="feedback-entry bg-surface-container-low p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${severityLabel === 'High' ? 'bg-error-container text-on-error-container' : 'bg-primary-container/20 text-primary'}`}>
                        {severityLabel} Failure
                      </span>
                    </div>
                    
                    <p className="text-on-surface font-medium mb-4">{fb.observed_failure}</p>
                    
                    {fb.evidence && (
                       <div className="mb-4">
                          <div className="text-xs text-outline mb-1 uppercase tracking-widest font-bold">Evidence</div>
                          <div className="bg-surface-variant text-on-surface-variant p-2 rounded text-sm font-data-mono">{fb.evidence}</div>
                          {/* Placeholder for future screenshots if `fb.screenshot_url` exists */}
                          {fb.screenshot_url && <img src={fb.screenshot_url} alt="Evidence" className="mt-2 rounded border border-outline-variant" />}
                       </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-2 text-sm bg-surface p-3 rounded">
                      <div className="flex flex-col">
                        <span className="text-outline text-xs uppercase tracking-widest font-bold mb-1">Violated Intent:</span>
                        <span className="text-on-surface-variant">{fb.violated_intent}</span>
                      </div>
                      <div className="flex flex-col mt-2">
                        <span className="text-outline text-xs uppercase tracking-widest font-bold mb-1">Likely Weakness:</span>
                        <span className="text-on-surface-variant">{fb.likely_weakness}</span>
                      </div>
                      <div className="flex flex-col mt-2">
                        <span className="text-outline text-xs uppercase tracking-widest font-bold mb-1">Recommended Guardrail:</span>
                        <span className="text-primary font-medium">{fb.recommended_guardrail}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {feedback.length === 0 && (
          <div className="text-on-surface-variant italic">No feedback found for this run yet. Run an evaluation.</div>
        )}
      </div>
    </div>
  );
}
